from django.db import models
from django.contrib.auth import get_user_model
from friends.models import Friendship

User = get_user_model()


class Message(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('appointment_card', 'Appointment Card'),
    )
    
    friendship = models.ForeignKey(
        Friendship,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    text = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['friendship', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.created_at}"
