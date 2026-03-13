# insurance/filters.py
import django_filters
from django.db.models import Q
from .models import Enrollment, Claim


class EnrollmentFilter(django_filters.FilterSet):
    """Custom filters for enrollments"""
    
    status = django_filters.ChoiceFilter(
        choices=Enrollment.STATUS_CHOICES,
        field_name='status'
    )
    plan_type = django_filters.CharFilter(
        field_name='plan__plan_type',
        lookup_expr='iexact'
    )
    livestock_species = django_filters.CharFilter(
        field_name='livestock__species__name',
        lookup_expr='icontains'
    )
    start_date_after = django_filters.DateFilter(
        field_name='start_date',
        lookup_expr='gte'
    )
    start_date_before = django_filters.DateFilter(
        field_name='start_date',
        lookup_expr='lte'
    )
    end_date_after = django_filters.DateFilter(
        field_name='end_date',
        lookup_expr='gte'
    )
    end_date_before = django_filters.DateFilter(
        field_name='end_date',
        lookup_expr='lte'
    )
    
    class Meta:
        model = Enrollment
        fields = ['status', 'plan_type', 'livestock_species']


class ClaimFilter(django_filters.FilterSet):
    """Custom filters for claims"""
    
    status = django_filters.ChoiceFilter(
        choices=Claim.STATUS_CHOICES,
        field_name='status'
    )
    claim_type = django_filters.ChoiceFilter(
        choices=Claim.CLAIM_TYPE_CHOICES,
        field_name='claim_type'
    )
    farmer_name = django_filters.CharFilter(
        method='filter_by_farmer_name'
    )
    incident_date_after = django_filters.DateFilter(
        field_name='incident_date',
        lookup_expr='gte'
    )
    incident_date_before = django_filters.DateFilter(
        field_name='incident_date',
        lookup_expr='lte'
    )
    min_amount = django_filters.NumberFilter(
        field_name='claim_amount',
        lookup_expr='gte'
    )
    max_amount = django_filters.NumberFilter(
        field_name='claim_amount',
        lookup_expr='lte'
    )
    livestock_tag = django_filters.CharFilter(
        field_name='enrollment__livestock__tag_number',
        lookup_expr='icontains'
    )
    
    class Meta:
        model = Claim
        fields = ['status', 'claim_type']
    
    def filter_by_farmer_name(self, queryset, name, value):
        """Filter by farmer's first or last name"""
        return queryset.filter(
            Q(farmer__first_name__icontains=value) |
            Q(farmer__last_name__icontains=value)
        )
