# appointment/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count
from django.utils import timezone
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentStatusUpdateSerializer
from .permissions import AppointmentPermission


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments
    
    Farmers can:
    - Create appointments
    - View their own appointments
    - Cancel their appointments
    
    Vets can:
    - View appointments assigned to them
    - Approve/Decline pending appointments
    - Complete approved appointments
    - Add notes to appointments
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, AppointmentPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'animal_type', 'preferred_date']
    search_fields = ['reason', 'farmer__email', 'farmer__first_name', 'farmer__last_name', 
                     'veterinarian__email', 'veterinarian__first_name', 'veterinarian__last_name']
    ordering_fields = ['preferred_date', 'created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Farmers see their own appointments
        if user.user_type == 'farmer':
            return Appointment.objects.filter(farmer=user).select_related(
                'farmer', 'veterinarian'
            )
        
        # Vets see appointments assigned to them
        elif user.user_type == 'vet':
            return Appointment.objects.filter(veterinarian=user).select_related(
                'farmer', 'veterinarian'
            )
        
        # Admins see all appointments
        elif user.is_staff:
            return Appointment.objects.all().select_related('farmer', 'veterinarian')
        
        return Appointment.objects.none()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get appointment statistics for the current user"""
        user = request.user
        
        if user.user_type == 'farmer':
            queryset = Appointment.objects.filter(farmer=user)
        elif user.user_type == 'vet':
            queryset = Appointment.objects.filter(veterinarian=user)
        else:
            queryset = Appointment.objects.all()
        
        stats = {
            'upcoming': queryset.filter(
                status='Approved',
                preferred_date__gte=timezone.now().date()
            ).count(),
            'pending': queryset.filter(status='Pending').count(),
            'completed': queryset.filter(status='Completed').count(),
            'cancelled': queryset.filter(
                status__in=['Cancelled', 'Declined']
            ).count(),
            'total': queryset.count(),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update appointment status (for vets)"""
        appointment = self.get_object()
        serializer = AppointmentStatusUpdateSerializer(
            appointment, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                AppointmentSerializer(appointment).data,
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending appointment (vet only)"""
        appointment = self.get_object()
        
        if appointment.status != 'Pending':
            return Response(
                {'error': 'Only pending appointments can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'Approved'
        appointment.save()
        
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a pending appointment (vet only)"""
        appointment = self.get_object()
        
        if appointment.status != 'Pending':
            return Response(
                {'error': 'Only pending appointments can be declined'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'Declined'
        appointment.vet_notes = request.data.get('vet_notes', '')
        appointment.save()
        
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete an approved appointment (vet only)"""
        appointment = self.get_object()
        
        if appointment.status != 'Approved':
            return Response(
                {'error': 'Only approved appointments can be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'Completed'
        appointment.vet_notes = request.data.get('vet_notes', appointment.vet_notes or '')
        appointment.save()
        
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment (farmer only)"""
        appointment = self.get_object()
        
        if appointment.status in ['Completed', 'Cancelled', 'Declined']:
            return Response(
                {'error': f'{appointment.status} appointments cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'Cancelled'
        appointment.save()
        
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_200_OK
        )
