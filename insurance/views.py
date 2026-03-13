# insurance/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import InsurancePlan, Enrollment, Claim
from .serializers import (
    InsurancePlanSerializer, EnrollmentSerializer, ClaimSerializer,
    ClaimVerificationSerializer, ClaimStatusUpdateSerializer, ClaimStatsSerializer
)
from .permissions import IsFarmerOrVet, IsVetOrAdmin, IsFarmer
from .filters import EnrollmentFilter, ClaimFilter


class InsurancePlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for insurance plans (read-only for users)
    """
    queryset = InsurancePlan.objects.filter(is_active=True)
    serializer_class = InsurancePlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'plan_type']
    ordering_fields = ['coverage_amount', 'premium_amount', 'created_at']
    ordering = ['coverage_amount']


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for livestock insurance enrollments
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated, IsFarmer]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EnrollmentFilter
    search_fields = ['livestock__name', 'livestock__tag_number', 'plan__name']
    ordering_fields = ['enrollment_date', 'start_date', 'end_date']
    ordering = ['-enrollment_date']
    
    def get_queryset(self):
        """Filter enrollments by farmer"""
        user = self.request.user
        if user.role == 'farmer':
            return Enrollment.objects.filter(farmer=user).select_related(
                'farmer', 'livestock', 'plan'
            )
        return Enrollment.objects.none()
    
    def perform_create(self, serializer):
        """Set farmer to current user"""
        serializer.save(farmer=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active enrollments"""
        enrollments = self.get_queryset().filter(status='Active')
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an enrollment"""
        enrollment = self.get_object()
        
        if enrollment.status == 'Cancelled':
            return Response(
                {'error': 'Enrollment is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.status = 'Cancelled'
        enrollment.save()
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class ClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet for insurance claims
    """
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated, IsFarmerOrVet]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ClaimFilter
    search_fields = ['claim_type', 'incident_location', 'description']
    ordering_fields = ['created_at', 'incident_date', 'claim_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter claims based on user role"""
        user = self.request.user
        
        if user.role == 'farmer':
            return Claim.objects.filter(farmer=user).select_related(
                'farmer', 'veterinarian', 'enrollment', 'enrollment__livestock', 'enrollment__plan'
            )
        elif user.role == 'vet':
            return Claim.objects.filter(
                Q(status='Pending Verification') | Q(veterinarian=user)
            ).select_related(
                'farmer', 'veterinarian', 'enrollment', 'enrollment__livestock', 'enrollment__plan'
            )
        elif user.role == 'admin':
            return Claim.objects.all().select_related(
                'farmer', 'veterinarian', 'enrollment', 'enrollment__livestock', 'enrollment__plan'
            )
        
        return Claim.objects.none()
    
    def perform_create(self, serializer):
        """Set farmer to current user and initial status"""
        serializer.save(
            farmer=self.request.user,
            status='Submitted'
        )
    
    @action(detail=False, methods=['get'])
    def my_claims(self, request):
        """Get current user's claims"""
        if request.user.role != 'farmer':
            return Response(
                {'error': 'Only farmers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        claims = self.get_queryset()
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_verification(self, request):
        """Get claims pending vet verification"""
        if request.user.role != 'vet':
            return Response(
                {'error': 'Only vets can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        claims = Claim.objects.filter(status='Pending Verification').select_related(
            'farmer', 'enrollment', 'enrollment__livestock', 'enrollment__plan'
        )
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Vet verifies a claim"""
        if request.user.role != 'vet':
            return Response(
                {'error': 'Only vets can verify claims'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        claim = self.get_object()
        
        if claim.status != 'Pending Verification':
            return Response(
                {'error': 'Claim is not pending verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ClaimVerificationSerializer(data=request.data)
        if serializer.is_valid():
            claim.veterinarian = request.user
            claim.vet_notes = serializer.validated_data['vet_notes']
            claim.verification_date = timezone.now()
            
            if serializer.validated_data['decision'] == 'approve':
                claim.status = 'Verified'
            else:
                claim.status = 'Rejected'
            
            claim.save()
            
            response_serializer = self.get_serializer(claim)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Admin updates claim status"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can update claim status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        claim = self.get_object()
        serializer = ClaimStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            claim.status = serializer.validated_data['status']
            
            if 'admin_notes' in serializer.validated_data:
                claim.admin_notes = serializer.validated_data['admin_notes']
            
            if 'approved_amount' in serializer.validated_data:
                claim.approved_amount = serializer.validated_data['approved_amount']
            
            if claim.status in ['Approved', 'Rejected']:
                claim.decision_date = timezone.now()
            
            claim.save()
            
            response_serializer = self.get_serializer(claim)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get claim statistics"""
        user = request.user
        
        if user.role == 'farmer':
            claims = Claim.objects.filter(farmer=user)
        elif user.role == 'vet':
            claims = Claim.objects.filter(veterinarian=user)
        elif user.role == 'admin':
            claims = Claim.objects.all()
        else:
            return Response(
                {'error': 'Invalid user role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'total_claims': claims.count(),
            'pending_claims': claims.filter(
                status__in=['Submitted', 'Under Review', 'Pending Verification']
            ).count(),
            'approved_claims': claims.filter(status='Approved').count(),
            'rejected_claims': claims.filter(status='Rejected').count(),
            'total_claim_amount': claims.aggregate(
                total=Sum('claim_amount')
            )['total'] or 0,
            'total_approved_amount': claims.filter(
                status='Approved'
            ).aggregate(
                total=Sum('approved_amount')
            )['total'] or 0,
        }
        
        serializer = ClaimStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get claims filtered by status"""
        status_param = request.query_params.get('status')
        
        if not status_param:
            return Response(
                {'error': 'Status parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        claims = self.get_queryset().filter(status=status_param)
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)
