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
        queryset = Treatment.objects.filter(
            user=self.request.user
        ).select_related('livestock', 'livestock__species', 'livestock__breed', 'user').prefetch_related('medicines')
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Override list to ensure medicines are included"""
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        # Handle medicines JSON string from FormData
        import json
        from rest_framework.request import Request
        from django.http import QueryDict
        
        print(f"\n{'='*60}")
        print(f"[TreatmentViewSet.create] ========== START ==========")
        print(f"[TreatmentViewSet.create] request.data type: {type(request.data)}")
        print(f"[TreatmentViewSet.create] request.data keys: {request.data.keys() if hasattr(request.data, 'keys') else 'N/A'}")
        
        # Create a mutable copy of request data
        if isinstance(request.data, QueryDict):
            data = request.data.dict()
        else:
            data = dict(request.data)
        
        print(f"[TreatmentViewSet.create] data type after conversion: {type(data)}")
        print(f"[TreatmentViewSet.create] 'medicines' in data: {'medicines' in data}")
        
        if 'medicines' in data:
            print(f"[TreatmentViewSet.create] medicines type: {type(data['medicines'])}")
            print(f"[TreatmentViewSet.create] medicines value (first 200 chars): {str(data['medicines'])[:200]}")
        
        # Parse medicines if it's a JSON string
        if 'medicines' in data and isinstance(data['medicines'], str):
            try:
                parsed = json.loads(data['medicines'])
                print(f"[TreatmentViewSet.create] Parsed medicines type: {type(parsed)}")
                print(f"[TreatmentViewSet.create] Parsed medicines length: {len(parsed) if isinstance(parsed, list) else 'N/A'}")
                print(f"[TreatmentViewSet.create] Parsed medicines: {parsed}")
                data['medicines'] = parsed
            except json.JSONDecodeError as e:
                print(f"[TreatmentViewSet.create] JSON decode error: {e}")
                return Response(
                    {'medicines': ['Invalid JSON format']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        print(f"[TreatmentViewSet.create] Final data['medicines'] type: {type(data.get('medicines'))}")
        print(f"[TreatmentViewSet.create] Final data['medicines']: {data.get('medicines')}")
        print(f"{'='*60}\n")
        
        serializer = self.get_serializer(data=data)
        
        print(f"[TreatmentViewSet.create] Before is_valid()")
        print(f"[TreatmentViewSet.create] serializer.initial_data type: {type(serializer.initial_data)}")
        print(f"[TreatmentViewSet.create] 'medicines' in serializer.initial_data: {'medicines' in serializer.initial_data}")
        if 'medicines' in serializer.initial_data:
            print(f"[TreatmentViewSet.create] serializer.initial_data['medicines']: {serializer.initial_data['medicines']}")
        
        serializer.is_valid(raise_exception=True)
        
        print(f"[TreatmentViewSet.create] After is_valid()")
        print(f"[TreatmentViewSet.create] 'medicines' in validated_data: {'medicines' in serializer.validated_data}")
        if 'medicines' in serializer.validated_data:
            print(f"[TreatmentViewSet.create] validated_data['medicines']: {serializer.validated_data['medicines']}")
        else:
            print(f"[TreatmentViewSet.create] ⚠️⚠️⚠️ NO 'medicines' IN validated_data! ⚠️⚠️⚠️")
        
        self.perform_create(serializer)
        
        # Re-serialize the instance to include the medicines that were just created
        response_serializer = self.get_serializer(serializer.instance)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to ensure medicines are included"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        # Handle medicines JSON string from FormData
        # Must convert QueryDict to a regular dict first — DRF's ListSerializer uses
        # html.parse_html_list() on QueryDicts which ignores our JSON-string medicines key.
        import json
        from django.http import QueryDict

        if isinstance(request.data, QueryDict):
            data = request.data.dict()
        else:
            data = dict(request.data)

        if 'medicines' in data and isinstance(data['medicines'], str):
            data['medicines'] = json.loads(data['medicines'])
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Re-serialize the instance to include the updated medicines
        response_serializer = self.get_serializer(serializer.instance)
        return Response(response_serializer.data)
    
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
