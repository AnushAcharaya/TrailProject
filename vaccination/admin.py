# vaccination/admin.py
from django.contrib import admin
from .models import Vaccination

@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
    list_display = ['livestock', 'vaccine_name', 'vaccine_type', 'date_given', 'next_due_date', 'get_status_display', 'user']
    list_filter = ['vaccine_type', 'user', 'date_given']
    list_select_related = ['livestock', 'user']
    search_fields = ['vaccine_name', 'livestock__tag_id', 'user__username']
    date_hierarchy = 'date_given'

    def get_status_display(self, obj):
        return obj.get_status()
    get_status_display.short_description = 'Status'

