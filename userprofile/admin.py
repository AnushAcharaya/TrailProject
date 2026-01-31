from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'gender', 'location', 'theme', 'language', 'created_at', 'updated_at']
    list_filter = ['gender', 'theme', 'language', 'email_notifications', 'push_notifications', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__full_name', 'location', 'bio']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Profile Information', {
            'fields': ('bio', 'location', 'gender', 'profile_image')
        }),
        ('Preferences', {
            'fields': ('theme', 'language', 'email_notifications', 'push_notifications')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')
