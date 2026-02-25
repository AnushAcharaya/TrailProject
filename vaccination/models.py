# vaccination/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from livestockcrud.models import Livestock

VACCINE_TYPES = [
    ('Viral Vaccine', 'Viral Vaccine'),
    ('Bacterial Vaccine', 'Bacterial Vaccine'),
    ('Clostridial Vaccine', 'Clostridial Vaccine'),
]

class Vaccination(models.Model):
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='vaccinations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine_name = models.CharField(max_length=200)
    vaccine_type = models.CharField(max_length=50, choices=VACCINE_TYPES)
    date_given = models.DateField()
    next_due_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        if self.next_due_date <= self.date_given:
            raise ValidationError("Next due date must be after date given")

    def get_status(self):
        today = timezone.now().date()
        if self.next_due_date < today:
            return 'overdue'
        elif self.next_due_date == today:
            return 'due_today'
        else:
            return 'upcoming'

    def days_until_due(self):
        today = timezone.now().date()
        delta = self.next_due_date - today
        return delta.days

    def __str__(self):
        return f"{self.livestock.tag_id} - {self.vaccine_name}"

