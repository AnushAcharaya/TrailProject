# medical/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import Treatment
from .serializers import TreatmentSerializer

class TreatmentPermission(BasePermission):
    """
    Custom permission to only allow users to access their own treatments
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or obj.livestock.user == request.user

class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.select_related('livestock', 'user').prefetch_related('medicines')
    serializer_class = TreatmentSerializer
    permission_classes = [TreatmentPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'livestock__tag_id']
    search_fields = ['treatment_name', 'diagnosis', 'vet_name', 'livestock__tag_id']
    ordering_fields = ['treatment_date', 'next_treatment_date', 'created_at']
    
    def get_queryset(self):
        # Ensure medicines are always prefetched
        return Treatment.objects.filter(
            user=self.request.user
        ).select_related('livestock', 'livestock__species', 'livestock__breed', 'user').prefetch_related('medicines').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Override list to add debug logging"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Debug logging
        print(f"\n{'='*60}")
        print(f"[TreatmentViewSet] LIST - Total treatments: {queryset.count()}")
        if queryset.exists():
            first = queryset.first()
            print(f"[TreatmentViewSet] First treatment: {first.treatment_name}")
            print(f"[TreatmentViewSet] Medicines count: {first.medicines.count()}")
            if first.medicines.exists():
                for med in first.medicines.all():
                    print(f"[TreatmentViewSet]   - {med.name} ({med.dosage})")
            else:
                print(f"[TreatmentViewSet]   ⚠️ No medicines found!")
        print(f"{'='*60}\n")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # Debug serialized data
            if serializer.data:
                first_data = serializer.data[0]
                print(f"[TreatmentViewSet] Serialized medicines: {first_data.get('medicines', [])}")
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        # Handle medicines JSON string from FormData
        data = request.data.copy()
        print(f"\n{'='*60}")
        print(f"[TreatmentViewSet] CREATE - Raw request.data:")
        print(f"  medicines field: {data.get('medicines')}")
        print(f"  medicines type: {type(data.get('medicines'))}")
        
        if 'medicines' in data and isinstance(data['medicines'], str):
            import json
            parsed_medicines = json.loads(data['medicines'])
            print(f"  Parsed medicines: {parsed_medicines}")
            print(f"  Parsed medicines length: {len(parsed_medicines)}")
            data['medicines'] = parsed_medicines
        
        print(f"  Final medicines data: {data.get('medicines')}")
        print(f"{'='*60}\n")
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Log what was actually created
        created_treatment = serializer.instance
        print(f"\n[TreatmentViewSet] Created treatment ID: {created_treatment.id}")
        print(f"[TreatmentViewSet] Medicines count in DB: {created_treatment.medicines.count()}")
        for med in created_treatment.medicines.all():
            print(f"  - {med.name} ({med.dosage})")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to add debug logging"""
        instance = self.get_object()
        print(f"\n{'='*60}")
        print(f"[TreatmentViewSet] RETRIEVE - Treatment ID: {instance.id}")
        print(f"[TreatmentViewSet] Treatment name: {instance.treatment_name}")
        print(f"[TreatmentViewSet] Medicines count in DB: {instance.medicines.count()}")
        if instance.medicines.exists():
            for med in instance.medicines.all():
                print(f"[TreatmentViewSet]   - {med.name} ({med.dosage})")
        else:
            print(f"[TreatmentViewSet]   ⚠️ No medicines found in DB!")
        print(f"{'='*60}\n")
        
        serializer = self.get_serializer(instance)
        print(f"[TreatmentViewSet] Serialized medicines: {serializer.data.get('medicines', [])}")
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        # Handle medicines JSON string from FormData
        data = request.data.copy()
        print(f"\n{'='*60}")
        print(f"[TreatmentViewSet] UPDATE - Raw request.data:")
        print(f"[TreatmentViewSet] ALL FIELDS IN REQUEST:")
        for key in data.keys():
            print(f"  {key}: {data.get(key)}")
        print(f"\n[TreatmentViewSet] medicines field: {data.get('medicines')}")
        print(f"[TreatmentViewSet] medicines type: {type(data.get('medicines'))}")
        print(f"[TreatmentViewSet] 'medicines' in data: {'medicines' in data}")
        
        if 'medicines' in data:
            if isinstance(data['medicines'], str):
                import json
                parsed_medicines = json.loads(data['medicines'])
                print(f"[TreatmentViewSet] Parsed medicines from JSON string: {parsed_medicines}")
                print(f"[TreatmentViewSet] Parsed medicines length: {len(parsed_medicines)}")
                data['medicines'] = parsed_medicines
            else:
                print(f"[TreatmentViewSet] Medicines is already a list/dict: {data['medicines']}")
        else:
            print(f"[TreatmentViewSet] ⚠️⚠️⚠️ NO 'medicines' FIELD IN REQUEST DATA! ⚠️⚠️⚠️")
        
        print(f"[TreatmentViewSet] Final medicines data: {data.get('medicines')}")
        print(f"{'='*60}\n")
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Log what was actually updated
        updated_treatment = serializer.instance
        print(f"\n[TreatmentViewSet] Updated treatment ID: {updated_treatment.id}")
        print(f"[TreatmentViewSet] Medicines count in DB after update: {updated_treatment.medicines.count()}")
        for med in updated_treatment.medicines.all():
            print(f"  - {med.name} ({med.dosage})")
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def counts(self, request):
        """AlertNotifications.jsx + MonitorDeadlines.jsx"""
        today = timezone.now().date()
        queryset = self.get_queryset()
        
        overdue = queryset.filter(next_treatment_date__lt=today).count()
        due_today = queryset.filter(next_treatment_date=today).count()
        due_soon = queryset.filter(
            next_treatment_date__gt=today,
            next_treatment_date__lte=today + timedelta(days=7)
        ).count()
        on_track = queryset.filter(next_treatment_date__gt=today + timedelta(days=7)).count()
        
        return Response({
            'overdue': overdue,
            'due_today': due_today,
            'due_soon': due_soon,
            'on_track': on_track,
            'total': queryset.count()
        })
    
    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """AlertNotifications.jsx - categorized by days"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(next_treatment_date__isnull=False)
        
        alerts = {
            'overdue': queryset.filter(next_treatment_date__lt=today),
            'today': queryset.filter(next_treatment_date=today),
            'day_1': queryset.filter(next_treatment_date=today + timedelta(days=1)),
            'day_3': queryset.filter(next_treatment_date=today + timedelta(days=3)),
            'day_7': queryset.filter(next_treatment_date=today + timedelta(days=7)),
        }
        
        result = {}
        for key, qs in alerts.items():
            result[key] = self.get_serializer(qs, many=True).data
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def active_tracking(self, request):
        """ViewTreatmentHistory.jsx Medicine Tracking tab"""
        return Response(self.get_serializer(
            self.get_queryset().filter(is_active_tracking=True), many=True
        ).data)
