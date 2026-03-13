# medical/models.py - 10/10 PRODUCTION READY
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from django.db.models import Q, Count, ExpressionWrapper, F, DurationField
from datetime import timedelta
from livestockcrud.models import Livestock
import json

class Medicine(models.Model):
    """Nested medicine doses within treatment"""
    SCHEDULE_TYPES = [
        ('interval', 'Interval'),
        ('exact', 'Exact Times'),
    ]
    
    treatment = models.ForeignKey('Treatment', related_name='medicines', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    frequency = models.PositiveIntegerField(choices=[(1, 'Once'), (2, 'Twice'), (3, 'Three times')])
    duration = models.PositiveIntegerField(default=3, help_text="Days")
    schedule_type = models.CharField(max_length=10, choices=SCHEDULE_TYPES, default='interval')
    start_time = models.TimeField()
    interval_hours = models.PositiveIntegerField(default=8, blank=True, null=True)
    exact_times = models.JSONField(default=list, blank=True, null=True)
    
    class Meta:
        indexes = [models.Index(fields=['treatment', 'name'])]
    
    def clean(self):
        if self.schedule_type == 'interval' and not self.interval_hours:
            raise ValidationError("Interval hours required for interval schedule")
        if self.schedule_type == 'exact' and (not self.exact_times or len(self.exact_times) != self.frequency):
            raise ValidationError(f"Exactly {self.frequency} exact times required")

    def __str__(self):
        return f"{self.name} ({self.frequency}x/day)"

class Treatment(models.Model):
    STATUS_CHOICES = [
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='treatments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treatments')
    treatment_name = models.CharField(max_length=200)
    diagnosis = models.TextField()
    vet_name = models.CharField(max_length=100)
    treatment_date = models.DateField()
    next_treatment_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='In Progress')
    document = models.FileField(upload_to='treatment_docs/%Y/%m/%d/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'next_treatment_date']),
            models.Index(fields=['livestock', 'status']),
        ]
        ordering = ['-created_at']
    
    def clean(self):
        if self.next_treatment_date and self.next_treatment_date <= self.treatment_date:
            raise ValidationError("Next treatment date must be after treatment date")
    
    @property
    def days_until_next(self):
        if not self.next_treatment_date:
            return None
        today = timezone.now().date()
        delta = self.next_treatment_date - today
        return delta.days
    
    @property
    def get_status_display(self):
        days = self.days_until_next
        if days is None:
            return f"{self.status}"
        if days < 0:
            return f"Overdue by {abs(days)} days"
        elif days == 0:
            return "Due today"
        elif days <= 7:
            return f"Due in {days} days"
        return f"{self.status}"
    
    @property
    def is_active_tracking(self):
        """For MedicineTrackingCard - has valid dates + medicines + In Progress"""
        if self.status != 'In Progress' or not self.medicines.exists():
            return False
        today = timezone.now().date()
        return self.treatment_date <= today <= (self.treatment_date + timedelta(days=self.medicines.first().duration))
    
    def __str__(self):
        return f"{self.livestock.tag_id} - {self.treatment_name}"

