import django_filters
from .models import Livestock

class LivestockFilter(django_filters.FilterSet):
    min_weight = django_filters.NumberFilter(field_name='weight', lookup_expr='gte')
    max_weight = django_filters.NumberFilter(field_name='weight', lookup_expr='lte')
    min_age = django_filters.NumberFilter(field_name='date_of_birth', lookup_expr='lte')
    health_status = django_filters.MultipleChoiceFilter(choices=Livestock.HEALTH_STATUS_CHOICES)
    
    class Meta:
        model = Livestock
        fields = ['species', 'health_status', 'is_active', 'min_weight', 'max_weight']
