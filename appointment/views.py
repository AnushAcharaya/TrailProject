# appointment/views.py
import logging
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

logger = logging.getLogger(__name__)


def _notify_farmer_appointment_decision(appointment, decision):
    """
    Best-effort: send an in-app notification (real-time bell) AND an email to
    the farmer when a vet approves/declines/completes their appointment.
    Failures are logged but never bubble up — they must not break the vet's
    button click.

    decision is one of: 'approved', 'declined', 'completed'.
    """
    farmer = appointment.farmer
    vet = appointment.veterinarian
    vet_name = (vet.full_name or vet.username) if vet else 'your veterinarian'
    when = f"{appointment.preferred_date} at {appointment.preferred_time}"

    if decision == 'approved':
        title = 'Appointment confirmed'
        message = (
            f"{vet_name} has confirmed your appointment on {when}. "
            "Please be on time."
        )
        email_subject = "Your LHMMS appointment has been confirmed"
        email_body = (
            f"Hello {farmer.full_name or farmer.username},\n\n"
            f"Good news — {vet_name} has accepted your appointment.\n\n"
            f"  Date & time : {when}\n"
            f"  Animal      : {appointment.animal_type}\n"
            f"  Reason      : {appointment.reason}\n\n"
            f"Please arrive on time. You can view this appointment any time at\n"
            f"  http://localhost:5173/appointments\n\n"
            f"— LHMMS Team"
        )
    elif decision == 'declined':
        notes = (appointment.vet_notes or '').strip()
        reason_line = f"\nReason given: {notes}" if notes else ''
        title = 'Appointment declined'
        message = (
            f"{vet_name} could not accept your appointment on {when}." + reason_line
        )
        email_subject = "Your LHMMS appointment was declined"
        email_body = (
            f"Hello {farmer.full_name or farmer.username},\n\n"
            f"We're sorry — {vet_name} was unable to accept your appointment.\n\n"
            f"  Date & time : {when}\n"
            f"  Animal      : {appointment.animal_type}\n"
            f"  Reason      : {appointment.reason}\n"
            f"{('  Note from vet : ' + notes + chr(10)) if notes else ''}\n"
            f"You can book another time slot or pick a different vet at\n"
            f"  http://localhost:5173/appointments/request\n\n"
            f"— LHMMS Team"
        )
    elif decision == 'completed':
        title = 'Appointment completed'
        message = f"Your appointment with {vet_name} on {when} has been marked completed."
        email_subject = "Your LHMMS appointment is complete"
        email_body = (
            f"Hello {farmer.full_name or farmer.username},\n\n"
            f"{vet_name} has marked your appointment as complete.\n\n"
            f"  Date & time : {when}\n"
            f"  Animal      : {appointment.animal_type}\n\n"
            f"Thanks for using LHMMS.\n\n"
            f"— LHMMS Team"
        )
    else:
        return

    # 1) In-app notification (real-time via WebSocket)
    try:
        from notifications.utils import create_notification
        create_notification(
            recipient=farmer,
            sender=vet,
            notification_type='appointment',
            title=title,
            message=message,
            link='/appointments',
            data={'appointment_id': appointment.id, 'decision': decision},
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not create in-app notification: %s", exc)

    # 2) Email
    try:
        from authentication.email_utils import send_email_sync
        send_email_sync(farmer.email, email_subject, email_body)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not send appointment email: %s", exc)


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
    
    def perform_create(self, serializer):
        """
        Mark new appointments as 'payment pending'. The actual fee is computed
        inside AppointmentSerializer.create() so we have access to the resolved
        veterinarian instance (the vet's profile.consultation_fee is the
        default; falls back to NPR 500 if no profile fee is set).
        """
        instance = serializer.save(payment_status='pending')
        if instance.appointment_fee is None:
            instance.appointment_fee = 500.00
            instance.save(update_fields=['appointment_fee'])
    
    def get_queryset(self):
        user = self.request.user
        
        # Farmers see their own appointments
        if user.role == 'farmer':
            return Appointment.objects.filter(farmer=user).select_related(
                'farmer', 'veterinarian'
            )
        
        # Vets see appointments assigned to them
        elif user.role == 'vet':
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
        
        if user.role == 'farmer':
            queryset = Appointment.objects.filter(farmer=user)
        elif user.role == 'vet':
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

        # Notify farmer (in-app + email) — best-effort
        _notify_farmer_appointment_decision(appointment, 'approved')

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

        # Notify farmer (in-app + email) — best-effort
        _notify_farmer_appointment_decision(appointment, 'declined')

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

        # Notify farmer the appointment is wrapped up
        _notify_farmer_appointment_decision(appointment, 'completed')

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
