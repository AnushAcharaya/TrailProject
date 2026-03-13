# appointment/filters.py
import django_filters
from django.db.models import Q
from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    """Custom filters for appointments"""
    
    date_from = django_filters.DateFilter(field_name='preferred_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='preferred_date', lookup_expr='lte')
    farmer_name = django_filters.CharFilter(method='filter_farmer_name')
    vet_name = django_filters.CharFilter(method='filter_vet_name')
    
    class Meta:
        model = Appointment
        fields = ['status', 'animal_type', 'preferred_date']
    
    def filter_farmer_name(self, queryset, name, value):
        return queryset.filter(
            Q(farmer__first_name__icontains=value) |
            Q(farmer__last_name__icontains=value) |
            Q(farmer__email__icontains=value)
        )
    
    def filter_vet_name(self, queryset, name, value):
        return queryset.filter(
            Q(veterinarian__first_name__icontains=value) |
            Q(veterinarian__last_name__icontains=value) |
            Q(veterinarian__email__icontains=value)
        )
