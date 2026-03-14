# profileTransfer/admin.py
from django.contrib import admin
from .models import Transfer


@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    """Admin interface for Transfer model"""
    
    list_display = [
        'id', 'livestock_tag_display', 'sender_name_display',
        'receiver_name_display', 'status', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = [
        'livestock__tag_number', 'livestock__name',
        'sender__email', 'sender__first_name', 'sender__last_name',
        'receiver__email', 'receiver__first_name', 'receiver__last_name',
        'reason'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'receiver_approved_at',
        'admin_approved_at', 'completed_at'
    ]
    
    fieldsets = (
        ('Transfer Information', {
            'fields': (
                'livestock', 'sender', 'receiver', 'reason',
                'supporting_document'
            )
        }),
        ('Status', {
            'fields': ('status', 'admin_reviewer')
        }),
        ('Notes', {
            'fields': ('receiver_notes', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': (
                'created_at', 'updated_at', 'receiver_approved_at',
                'admin_approved_at', 'completed_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def livestock_tag_display(self, obj):
        """Display livestock tag number"""
        return obj.livestock.tag_number
    livestock_tag_display.short_description = 'Livestock Tag'
    
    def sender_name_display(self, obj):
        """Display sender name"""
        return obj.sender.get_full_name()
    sender_name_display.short_description = 'Sender'
    
    def receiver_name_display(self, obj):
        """Display receiver name"""
        return obj.receiver.get_full_name()
    receiver_name_display.short_description = 'Receiver'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related(
            'livestock', 'sender', 'receiver', 'admin_reviewer'
        )
