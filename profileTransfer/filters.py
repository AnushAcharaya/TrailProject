# profileTransfer/filters.py
import django_filters
from django.db.models import Q
from .models import Transfer


class TransferFilter(django_filters.FilterSet):
    """Filter class for transfers"""
    
    # Status filter
    status = django_filters.ChoiceFilter(
        choices=Transfer.STATUS_CHOICES,
        field_name='status'
    )
    
    # Date range filters
    created_after = django_filters.DateFilter(
        field_name='created_at',
        lookup_expr='gte'
    )
    created_before = django_filters.DateFilter(
        field_name='created_at',
        lookup_expr='lte'
    )
    
    # Livestock filter
    livestock = django_filters.NumberFilter(field_name='livestock__id')
    livestock_tag = django_filters.CharFilter(
        field_name='livestock__tag_number',
        lookup_expr='icontains'
    )
    
    # Sender/Receiver filters
    sender = django_filters.NumberFilter(field_name='sender__id')
    receiver = django_filters.NumberFilter(field_name='receiver__id')
    
    # Search by sender or receiver name
    participant_name = django_filters.CharFilter(method='filter_participant_name')
    
    class Meta:
        model = Transfer
        fields = [
            'status', 'livestock', 'livestock_tag', 'sender', 'receiver',
            'created_after', 'created_before'
        ]
    
    def filter_participant_name(self, queryset, name, value):
        """Filter by sender or receiver name"""
        return queryset.filter(
            Q(sender__first_name__icontains=value) |
            Q(sender__last_name__icontains=value) |
            Q(receiver__first_name__icontains=value) |
            Q(receiver__last_name__icontains=value)
        )
