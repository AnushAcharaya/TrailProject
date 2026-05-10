from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    sender_name = serializers.SerializerMethodField()
    sender_image = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'sender',
            'sender_name',
            'sender_image',
            'notification_type',
            'title',
            'message',
            'link',
            'is_read',
            'data',
            'created_at',
            'read_at',
            'time_ago',
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'sender_name', 'sender_image', 'time_ago']

    def get_sender_name(self, obj):
        """Get sender's full name or username"""
        if obj.sender:
            return obj.sender.full_name or obj.sender.username
        return "System"

    def get_sender_image(self, obj):
        """Get sender's profile image"""
        if obj.sender and hasattr(obj.sender, 'userprofile'):
            profile = obj.sender.userprofile
            if profile.profile_image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.profile_image.url)
                return profile.profile_image.url
        return None

    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes}m ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours}h ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days}d ago"
        else:
            return obj.created_at.strftime("%b %d, %Y")
