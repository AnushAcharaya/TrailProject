from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'transaction_uuid', 'product_code',
        'total_amount', 'status', 'esewa_ref_id', 'created_at'
    ]
    list_filter = ['status', 'product_code', 'payment_method', 'created_at']
    search_fields = [
        'transaction_uuid', 'esewa_ref_id',
        'user__username', 'user__email'
    ]
    readonly_fields = [
        'transaction_uuid', 'created_at', 'updated_at',
        'completed_at', 'ip_address', 'user_agent'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': (
                'user', 'transaction_uuid', 'amount',
                'tax_amount', 'total_amount', 'status'
            )
        }),
        ('Product Details', {
            'fields': ('product_code', 'product_description')
        }),
        ('eSewa Details', {
            'fields': ('esewa_ref_id', 'payment_method')
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Disable manual payment creation through admin"""
        return False
