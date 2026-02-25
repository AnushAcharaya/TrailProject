# vaccination/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from django.utils import timezone
from .models import Vaccination
from .serializers import VaccinationSerializer

class VaccinationViewSet(viewsets.ModelViewSet):
    serializer_class = VaccinationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['vaccine_type', 'livestock__tag_id']
    search_fields = ['vaccine_name', 'livestock__tag_id']
    ordering_fields = ['next_due_date', 'date_given', 'created_at']

    def get_queryset(self):
        return Vaccination.objects.filter(user=self.request.user).select_related('livestock', 'livestock__species', 'livestock__breed')

    @action(detail=False, methods=['get'])
    def counts(self, request):
        """Get counts for tabs: upcoming, completed, overdue"""
        today = timezone.now().date()
        counts = {}
        counts['upcoming'] = self.get_queryset().filter(next_due_date__gt=today).count()
        counts['overdue'] = self.get_queryset().filter(next_due_date__lt=today).count()
        counts['due_today'] = self.get_queryset().filter(next_due_date=today).count()
        counts['completed'] = self.get_queryset().filter(next_due_date=today).count()
        return Response(counts)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Upcoming vaccinations (matches frontend tab)"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(next_due_date__gt=today).order_by('next_due_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Overdue vaccinations"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(next_due_date__lt=today).order_by('next_due_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Completed vaccinations (next_due_date is today - marked as completed)"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(next_due_date=today).order_by('-next_due_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

