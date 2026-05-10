from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Model to store user notifications
    """
    NOTIFICATION_TYPES = (
        ('account', 'Account Verification'),
        ('appointment', 'Appointment'),
        ('transfer', 'Profile Transfer'),
        ('insurance', 'Insurance'),
        ('medical', 'Medical Record'),
        ('vaccination', 'Vaccination'),
        ('message', 'Message'),
        ('friend', 'Friend Request'),
        ('system', 'System'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User who receives this notification"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications',
        help_text="User who triggered this notification (optional)"
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        help_text="Type of notification"
    )
    title = models.CharField(
        max_length=255,
        help_text="Notification title/headline"
    )
    message = models.TextField(
        help_text="Notification message body"
    )
    link = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text="URL to navigate when notification is clicked"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the notification has been read"
    )
    data = models.JSONField(
        null=True,
        blank=True,
        help_text="Additional metadata for the notification"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the notification was created"
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the notification was read"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', '-created_at']),
        ]

    def __str__(self):
        return f"{self.notification_type} - {self.title} (to: {self.recipient.username})"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
