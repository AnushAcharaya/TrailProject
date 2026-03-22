# insurance/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from livestockcrud.models import Livestock


class InsurancePlan(models.Model):
    """Insurance plan model with coverage details"""
    
    PLAN_TYPE_CHOICES = [
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('comprehensive', 'Comprehensive'),
    ]
    
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, unique=True)
    coverage_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    premium_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField()
    
    # Coverage details (stored as JSON-like text or separate fields)
    covers_death = models.BooleanField(default=True)
    covers_theft = models.BooleanField(default=False)
    covers_disease = models.BooleanField(default=False)
    covers_accident = models.BooleanField(default=False)
    covers_natural_disaster = models.BooleanField(default=False)
    
    # Additional details
    waiting_period_days = models.IntegerField(default=30, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['coverage_amount']
        indexes = [
            models.Index(fields=['plan_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - NPR {self.coverage_amount}"


class Enrollment(models.Model):
    """Livestock insurance enrollment"""
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Pending', 'Pending'),
        ('Expired', 'Expired'),
        ('Cancelled', 'Cancelled'),
    ]
    
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='insurance_enrollments'
    )
    livestock = models.ForeignKey(
        Livestock,
        on_delete=models.CASCADE,
        related_name='insurance_enrollments'
    )
    plan = models.ForeignKey(
        InsurancePlan,
        on_delete=models.PROTECT,
        related_name='enrollments'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    enrollment_date = models.DateField(auto_now_add=True)
    start_date = models.DateField()
    end_date = models.DateField()
    
    premium_paid = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['livestock']),
            models.Index(fields=['start_date', 'end_date']),
        ]
        unique_together = ['livestock', 'plan', 'start_date']
    
    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date")
    
    def __str__(self):
        return f"{self.livestock} - {self.plan.name} ({self.status})"


class Claim(models.Model):
    """Insurance claim model"""
    
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Paid', 'Paid'),
    ]
    
    CLAIM_TYPE_CHOICES = [
        ('Death', 'Death'),
        ('Theft', 'Theft'),
        ('Disease', 'Disease'),
        ('Accident', 'Accident'),
        ('Natural Disaster', 'Natural Disaster'),
        ('Other', 'Other'),
    ]
    
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='claims'
    )
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='insurance_claims'
    )
    
    claim_type = models.CharField(max_length=50, choices=CLAIM_TYPE_CHOICES)
    claim_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    incident_date = models.DateField()
    incident_location = models.CharField(max_length=255)
    description = models.TextField()
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Submitted')
    
    # Supporting documents
    incident_image = models.ImageField(upload_to='insurance/claims/images/', null=True, blank=True)
    vaccination_history = models.FileField(upload_to='insurance/claims/vaccination/', null=True, blank=True)
    medical_history = models.FileField(upload_to='insurance/claims/medical/', null=True, blank=True)
    
    # Admin decision
    admin_notes = models.TextField(blank=True, null=True)
    decision_date = models.DateTimeField(null=True, blank=True)
    approved_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['incident_date']),
        ]
    
    def clean(self):
        if self.claim_amount and self.enrollment:
            if self.claim_amount > self.enrollment.plan.coverage_amount:
                raise ValidationError(
                    f"Claim amount cannot exceed plan coverage of NPR {self.enrollment.plan.coverage_amount}"
                )
    
    def __str__(self):
        return f"Claim #{self.id} - {self.farmer.get_full_name()} - {self.status}"
