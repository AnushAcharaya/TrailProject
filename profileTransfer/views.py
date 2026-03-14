# profileTransfer/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Transfer
from .serializers import (
    TransferSerializer, TransferStatusUpdateSerializer,
    TransferStatsSerializer, FarmerSearchSerializer
)
from .permissions import TransferPermission
from .filters import TransferFilter

User = get_user_model()


class TransferViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing livestock ownership transfers
    
    Senders (Farmers) can:
    - Create transfer requests
    - View their sent transfers
    - Cancel pending transfers
    
    Receivers (Farmers) can:
    - View received transfer requests
    - Approve/Reject pending requests
    
    Admins can:
    - View all transfers
    - Approve/Reject receiver-approved transfers
    - View statistics
    """
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated, TransferPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TransferFilter
    search_fields = [
        'livestock__tag_number', 'livestock__name', 'reason',
        'sender__email', 'sender__first_name', 'sender__last_name',
        'receiver__email', 'receiver__first_name', 'receiver__last_name'
    ]
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter transfers based on user role"""
        user = self.request.user
        
        # Farmers see their sent and received transfers
        if user.role == 'farmer':
            return Transfer.objects.filter(
                Q(sender=user) | Q(receiver=user)
            ).select_related(
                'livestock', 'livestock__species', 'livestock__breed',
                'sender', 'receiver', 'admin_reviewer'
            )
        
        # Admins see all transfers
        elif user.role == 'admin' or user.is_staff:
            return Transfer.objects.all().select_related(
                'livestock', 'livestock__species', 'livestock__breed',
                'sender', 'receiver', 'admin_reviewer'
            )
        
        return Transfer.objects.none()
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get transfers sent by current user"""
        if request.user.role != 'farmer':
            return Response(
                {'error': 'Only farmers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transfers = Transfer.objects.filter(sender=request.user).select_related(
            'livestock', 'livestock__species', 'livestock__breed',
            'sender', 'receiver', 'admin_reviewer'
        )
        
        # Apply filters
        transfers = self.filter_queryset(transfers)
        
        page = self.paginate_queryset(transfers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(transfers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        """Get transfers received by current user"""
        if request.user.role != 'farmer':
            return Response(
                {'error': 'Only farmers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transfers = Transfer.objects.filter(receiver=request.user).select_related(
            'livestock', 'livestock__species', 'livestock__breed',
            'sender', 'receiver', 'admin_reviewer'
        )
        
        # Apply filters
        transfers = self.filter_queryset(transfers)
        
        page = self.paginate_queryset(transfers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(transfers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_review(self, request):
        """Get transfers pending admin review (Admin only)"""
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response(
                {'error': 'Only admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transfers = Transfer.objects.filter(
            status='Receiver Approved'
        ).select_related(
            'livestock', 'livestock__species', 'livestock__breed',
            'sender', 'receiver', 'admin_reviewer'
        )
        
        serializer = self.get_serializer(transfers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def receiver_approve(self, request, pk=None):
        """Receiver approves the transfer"""
        transfer = self.get_object()
        
        # Check if user is the receiver
        if transfer.receiver != request.user:
            return Response(
                {'error': 'Only the receiver can approve this transfer'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if transfer is pending
        if transfer.status != 'Pending':
            return Response(
                {'error': 'Only pending transfers can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        transfer.status = 'Receiver Approved'
        transfer.receiver_notes = request.data.get('notes', '')
        transfer.receiver_approved_at = timezone.now()
        transfer.save()
        
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def receiver_reject(self, request, pk=None):
        """Receiver rejects the transfer"""
        transfer = self.get_object()
        
        # Check if user is the receiver
        if transfer.receiver != request.user:
            return Response(
                {'error': 'Only the receiver can reject this transfer'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if transfer is pending
        if transfer.status != 'Pending':
            return Response(
                {'error': 'Only pending transfers can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        transfer.status = 'Rejected'
        transfer.receiver_notes = request.data.get('notes', '')
        transfer.save()
        
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def admin_approve(self, request, pk=None):
        """Admin approves the transfer"""
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response(
                {'error': 'Only admins can approve transfers'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transfer = self.get_object()
        
        # Check if transfer is receiver approved
        if transfer.status != 'Receiver Approved':
            return Response(
                {'error': 'Only receiver-approved transfers can be admin approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        transfer.status = 'Admin Approved'
        transfer.admin_reviewer = request.user
        transfer.admin_notes = request.data.get('notes', '')
        transfer.admin_approved_at = timezone.now()
        transfer.save()
        
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def admin_reject(self, request, pk=None):
        """Admin rejects the transfer"""
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response(
                {'error': 'Only admins can reject transfers'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transfer = self.get_object()
        
        # Check if transfer is receiver approved
        if transfer.status != 'Receiver Approved':
            return Response(
                {'error': 'Only receiver-approved transfers can be admin rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        transfer.status = 'Rejected'
        transfer.admin_reviewer = request.user
        transfer.admin_notes = request.data.get('notes', '')
        transfer.save()
        
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete the transfer (Admin only)"""
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response(
                {'error': 'Only admins can complete transfers'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transfer = self.get_object()
        
        # Check if transfer is admin approved
        if transfer.status != 'Admin Approved':
            return Response(
                {'error': 'Only admin-approved transfers can be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status (this will trigger ownership transfer in model save)
        transfer.status = 'Completed'
        transfer.completed_at = timezone.now()
        transfer.save()
        
        serializer = self.get_serializer(transfer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pending transfer (Sender only)"""
        transfer = self.get_object()
        
        # Check if user is the sender
        if transfer.sender != request.user:
            return Response(
                {'error': 'Only the sender can cancel this transfer'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if transfer is pending
        if transfer.status != 'Pending':
            return Response(
                {'error': 'Only pending transfers can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the transfer
        transfer.delete()
        
        return Response(
            {'message': 'Transfer cancelled successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transfer statistics"""
        user = request.user
        
        if user.role == 'farmer':
            # Stats for sent transfers
            sent_transfers = Transfer.objects.filter(sender=user)
            stats = {
                'total_transfers': sent_transfers.count(),
                'pending_transfers': sent_transfers.filter(status='Pending').count(),
                'receiver_approved_transfers': sent_transfers.filter(status='Receiver Approved').count(),
                'admin_approved_transfers': sent_transfers.filter(status='Admin Approved').count(),
                'completed_transfers': sent_transfers.filter(status='Completed').count(),
                'rejected_transfers': sent_transfers.filter(status='Rejected').count(),
            }
        elif user.role == 'admin' or user.is_staff:
            # Stats for all transfers
            all_transfers = Transfer.objects.all()
            stats = {
                'total_transfers': all_transfers.count(),
                'pending_transfers': all_transfers.filter(status='Pending').count(),
                'receiver_approved_transfers': all_transfers.filter(status='Receiver Approved').count(),
                'admin_approved_transfers': all_transfers.filter(status='Admin Approved').count(),
                'completed_transfers': all_transfers.filter(status='Completed').count(),
                'rejected_transfers': all_transfers.filter(status='Rejected').count(),
            }
        else:
            return Response(
                {'error': 'Invalid user role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TransferStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_farmers(self, request):
        """Search for farmers to transfer livestock to"""
        if request.user.role != 'farmer':
            return Response(
                {'error': 'Only farmers can search for other farmers'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        search_query = request.query_params.get('q', '')
        
        if not search_query or len(search_query) < 2:
            return Response(
                {'error': 'Search query must be at least 2 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Search farmers (exclude current user)
        farmers = User.objects.filter(
            role='farmer'
        ).filter(
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        ).exclude(
            id=request.user.id
        )[:10]  # Limit to 10 results
        
        # Format results
        results = []
        for farmer in farmers:
            results.append({
                'id': farmer.id,
                'full_name': farmer.get_full_name(),
                'email': farmer.email,
                'phone_number': farmer.phone_number or '',
                'farm_name': getattr(farmer, 'farm_name', None)
            })
        
        serializer = FarmerSearchSerializer(results, many=True)
        return Response(serializer.data)
