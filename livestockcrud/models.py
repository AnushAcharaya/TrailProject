from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date
from django.conf import settings

class Species(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Breed(models.Model):
    name = models.CharField(max_length=100)
    species = models.ForeignKey(Species, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['name', 'species']
    
    def __str__(self):
        return f"{self.name} ({self.species})"

class Livestock(models.Model):
    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female')]
    HEALTH_STATUS_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Under Treatment', 'Under Treatment'),
        ('Critical', 'Critical'),
        ('Deceased', 'Deceased')
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='livestock')
    species = models.ForeignKey(Species, on_delete=models.PROTECT)
    breed = models.ForeignKey(Breed, on_delete=models.PROTECT)
    tag_id = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    color = models.CharField(max_length=50, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    health_status = models.CharField(max_length=20, choices=HEALTH_STATUS_CHOICES, default='Healthy')
    remarks = models.TextField(blank=True)
    image = models.ImageField(upload_to='livestock_images/%Y/%m/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['tag_id']),
            models.Index(fields=['health_status']),
            models.Index(fields=['species', 'is_active'])
        ]

    def clean(self):
        if self.health_status == 'Deceased' and self.is_active:
            raise ValidationError("Deceased animals cannot be active")
        if self.date_of_birth > date.today():
            raise ValidationError("Date of birth cannot be in the future")

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    def __str__(self):
        return f"{self.species} - {self.tag_id}"
