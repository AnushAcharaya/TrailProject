from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'recipient__email', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('recipient', 'sender', 'notification_type')
        }),
        ('Content', {
            'fields': ('title', 'message', 'link', 'data')
        }),
        ('Status', {
            'fields': ('is_read', 'created_at', 'read_at')
        }),
    )
