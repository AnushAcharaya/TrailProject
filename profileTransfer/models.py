# profileTransfer/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from livestockcrud.models import Livestock


class Transfer(models.Model):
    """
    Livestock ownership transfer model
    Manages the 3-tier approval workflow: Sender → Receiver → Admin
    """
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Receiver Approved', 'Receiver Approved'),
        ('Admin Approved', 'Admin Approved'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed'),
    ]
    
    # Relationships
    livestock = models.ForeignKey(
        Livestock,
        on_delete=models.CASCADE,
        related_name='transfers',
        help_text="Livestock being transferred"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_transfers',
        help_text="Current owner initiating the transfer"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_transfers',
        help_text="New owner receiving the livestock"
    )
    admin_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_transfers',
        help_text="Admin who reviewed the transfer"
    )
    
    # Transfer details
    reason = models.TextField(help_text="Reason for the transfer")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    
    # Notes from different parties
    receiver_notes = models.TextField(blank=True, null=True, help_text="Notes from receiver")
    admin_notes = models.TextField(blank=True, null=True, help_text="Notes from admin")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    receiver_approved_at = models.DateTimeField(null=True, blank=True)
    admin_approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Supporting documents (optional)
    supporting_document = models.FileField(
        upload_to='transfers/documents/',
        null=True,
        blank=True,
        help_text="Supporting documents for the transfer"
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'status']),
            models.Index(fields=['receiver', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['livestock']),
            models.Index(fields=['created_at']),
        ]
    
    def clean(self):
        """Validate transfer data"""
        # Sender and receiver must be different
        if self.sender_id and self.receiver_id and self.sender_id == self.receiver_id:
            raise ValidationError("Sender and receiver must be different users")
        
        # Livestock must belong to sender
        if self.livestock_id and self.sender_id:
            if self.livestock.owner_id != self.sender_id:
                raise ValidationError("You can only transfer livestock you own")
        
        # Check if livestock already has pending transfer
        if self.livestock_id and not self.pk:  # Only for new transfers
            existing_pending = Transfer.objects.filter(
                livestock=self.livestock,
                status__in=['Pending', 'Receiver Approved']
            ).exists()
            if existing_pending:
                raise ValidationError("This livestock already has a pending transfer")
    
    def save(self, *args, **kwargs):
        """Override save to update timestamps and handle ownership transfer"""
        # Update timestamps based on status changes
        if self.pk:  # Existing transfer
            old_transfer = Transfer.objects.get(pk=self.pk)
            
            # Receiver approved
            if old_transfer.status != 'Receiver Approved' and self.status == 'Receiver Approved':
                self.receiver_approved_at = timezone.now()
            
            # Admin approved
            if old_transfer.status != 'Admin Approved' and self.status == 'Admin Approved':
                self.admin_approved_at = timezone.now()
            
            # Completed - transfer ownership
            if old_transfer.status != 'Completed' and self.status == 'Completed':
                self.completed_at = timezone.now()
                # Transfer livestock ownership
                self.livestock.owner = self.receiver
                self.livestock.save()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Transfer #{self.id}: {self.livestock.tag_number} from {self.sender.get_full_name()} to {self.receiver.get_full_name()} ({self.status})"
    
    @property
    def animal_tag(self):
        """Get animal tag number"""
        return self.livestock.tag_number
    
    @property
    def animal_name(self):
        """Get animal name"""
        return self.livestock.name
    
    @property
    def sender_name(self):
        """Get sender full name"""
        return self.sender.get_full_name()
    
    @property
    def receiver_name(self):
        """Get receiver full name"""
        return self.receiver.get_full_name()
