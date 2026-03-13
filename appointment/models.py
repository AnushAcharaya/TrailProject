# appointment/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class Appointment(models.Model):
    """Appointment model for farmer-vet appointments"""
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Declined', 'Declined'),
    ]
    
    ANIMAL_TYPE_CHOICES = [
        ('cattle', 'Cattle'),
        ('sheep', 'Sheep'),
        ('goat', 'Goat'),
        ('pig', 'Pig'),
        ('poultry', 'Poultry'),
    ]
    
    # Relationships
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_appointments',
        help_text="Farmer who requested the appointment"
    )
    veterinarian = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vet_appointments',
        help_text="Veterinarian assigned to the appointment"
    )
    
    # Appointment details
    animal_type = models.CharField(max_length=20, choices=ANIMAL_TYPE_CHOICES)
    reason = models.TextField(help_text="Reason for the appointment")
    preferred_date = models.DateField()
    preferred_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional notes
    vet_notes = models.TextField(blank=True, null=True, help_text="Notes from veterinarian")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['veterinarian', 'status']),
            models.Index(fields=['preferred_date']),
        ]
    
    def clean(self):
        # Validate that preferred_date is not in the past
        if self.preferred_date and self.preferred_date < timezone.now().date():
            raise ValidationError("Preferred date cannot be in the past")
        
        # Validate that farmer and vet are different users
        if self.farmer_id and self.veterinarian_id and self.farmer_id == self.veterinarian_id:
            raise ValidationError("Farmer and veterinarian must be different users")
    
    def __str__(self):
        return f"{self.farmer.get_full_name()} - {self.veterinarian.get_full_name()} ({self.preferred_date})"
