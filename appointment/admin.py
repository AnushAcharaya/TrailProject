# appointment/admin.py
from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'farmer', 'veterinarian', 'animal_type', 'preferred_date', 
                    'preferred_time', 'status', 'created_at']
    list_filter = ['status', 'animal_type', 'preferred_date', 'created_at']
    search_fields = ['farmer__email', 'farmer__first_name', 'farmer__last_name',
                     'veterinarian__email', 'veterinarian__first_name', 'veterinarian__last_name',
                     'reason']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'preferred_date'
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('farmer', 'veterinarian', 'animal_type', 'reason')
        }),
        ('Schedule', {
            'fields': ('preferred_date', 'preferred_time', 'status')
        }),
        ('Notes', {
            'fields': ('vet_notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('farmer', 'veterinarian')
