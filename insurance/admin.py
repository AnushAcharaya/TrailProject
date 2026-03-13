# insurance/admin.py
from django.contrib import admin
from .models import InsurancePlan, Enrollment, Claim


@admin.register(InsurancePlan)
class InsurancePlanAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'plan_type', 'coverage_amount', 'premium_amount', 
        'is_active', 'created_at'
    ]
    list_filter = ['plan_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['coverage_amount']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'plan_type', 'description', 'is_active')
        }),
        ('Financial Details', {
            'fields': ('coverage_amount', 'premium_amount')
        }),
        ('Coverage Details', {
            'fields': (
                'covers_death', 'covers_theft', 'covers_disease',
                'covers_accident', 'covers_natural_disaster'
            )
        }),
        ('Additional Information', {
            'fields': ('waiting_period_days',)
        }),
    )


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'farmer', 'livestock', 'plan', 'status', 
        'enrollment_date', 'start_date', 'end_date'
    ]
    list_filter = ['status', 'enrollment_date', 'start_date']
    search_fields = [
        'farmer__email', 'farmer__first_name', 'farmer__last_name',
        'livestock__tag_number', 'livestock__name'
    ]
    ordering = ['-enrollment_date']
    date_hierarchy = 'enrollment_date'
    
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('farmer', 'livestock', 'plan', 'status')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Payment Information', {
            'fields': ('premium_paid', 'payment_date')
        }),
        ('Additional Notes', {
            'fields': ('notes',)
        }),
    )
    
    readonly_fields = ['enrollment_date']


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'farmer', 'claim_type', 'claim_amount', 'status',
        'incident_date', 'created_at'
    ]
    list_filter = ['status', 'claim_type', 'incident_date', 'created_at']
    search_fields = [
        'farmer__email', 'farmer__first_name', 'farmer__last_name',
        'description', 'incident_location'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Claim Information', {
            'fields': (
                'enrollment', 'farmer', 'claim_type', 'claim_amount',
                'incident_date', 'incident_location', 'description', 'status'
            )
        }),
        ('Supporting Documents', {
            'fields': ('supporting_document',)
        }),
        ('Veterinarian Verification', {
            'fields': ('veterinarian', 'vet_notes', 'verification_date')
        }),
        ('Admin Decision', {
            'fields': ('admin_notes', 'decision_date', 'approved_amount')
        }),
    )
    
    readonly_fields = ['verification_date', 'decision_date']
