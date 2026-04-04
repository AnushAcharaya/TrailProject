from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Payment(models.Model):
    """
    Payment model to track eSewa transactions
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PRODUCT_CHOICES = [
        ('INSURANCE_PREMIUM', 'Insurance Premium'),
        ('APPOINTMENT_FEE', 'Appointment Fee'),
        ('CONSULTATION_FEE', 'Consultation Fee'),
        ('OTHER', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    transaction_uuid = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    product_code = models.CharField(max_length=50, choices=PRODUCT_CHOICES)
    product_description = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    esewa_ref_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    payment_method = models.CharField(max_length=50, default='esewa')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['transaction_uuid']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.product_code} - Rs.{self.total_amount} - {self.status}"
    
    def mark_completed(self, esewa_ref_id):
        """Mark payment as completed"""
        from django.utils import timezone
        self.status = 'completed'
        self.esewa_ref_id = esewa_ref_id
        self.completed_at = timezone.now()
        self.save()
    
    def mark_failed(self):
        """Mark payment as failed"""
        self.status = 'failed'
        self.save()
