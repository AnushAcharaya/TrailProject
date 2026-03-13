# medical/admin.py
from django.contrib import admin
from .models import Treatment, Medicine

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'treatment', 'frequency', 'duration']
    list_filter = ['schedule_type', 'frequency']

class MedicineInline(admin.TabularInline):
    model = Medicine
    extra = 1

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ['treatment_name', 'livestock', 'status', 'days_until_next', 'user']
    list_filter = ['status', 'treatment_date', 'next_treatment_date']
    search_fields = ['treatment_name', 'livestock__tag_id', 'vet_name']
    inlines = [MedicineInline]
    readonly_fields = ['days_until_next']
    
    def days_until_next(self, obj):
        return obj.days_until_next
    days_until_next.admin_order_field = 'next_treatment_date'

