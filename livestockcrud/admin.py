from django.contrib import admin
from django.utils.html import format_html
from .models import Livestock, Species, Breed

@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
    list_display = ['name', 'livestock_count']
    search_fields = ['name']
    
    def livestock_count(self, obj):
        return obj.livestock_set.count()

@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ['name', 'species', 'livestock_count']
    list_filter = ['species']
    search_fields = ['name']
    
    def livestock_count(self, obj):
        return obj.livestock_set.count()

@admin.register(Livestock)
class LivestockAdmin(admin.ModelAdmin):
    list_display = ['tag_id', 'species', 'breed', 'age_display', 'gender', 'health_status', 'user', 'created_at']
    list_filter = ['species', 'breed', 'gender', 'health_status', 'is_active', 'created_at']
    search_fields = ['tag_id', 'species__name', 'breed__name']
    readonly_fields = ['created_at', 'updated_at']
    
    def age_display(self, obj):
        return f"{obj.age} years" if obj.age else "N/A"

