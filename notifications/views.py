from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer
from .utils import create_notification


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return notifications for the current user"""
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get all unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'message': f'{updated} notifications marked as read',
            'count': updated
        })

    @action(detail=False, methods=['delete'])
    def delete_all_read(self, request):
        """Delete all read notifications"""
        deleted_count, _ = self.get_queryset().filter(is_read=True).delete()
        return Response({
            'message': f'{deleted_count} notifications deleted',
            'count': deleted_count
        })

    @action(detail=False, methods=['post'])
    def broadcast(self, request):
        """
        Admin-only: send a notification to many users at once.

        Body:
          - title (str, required)
          - message (str, required)
          - audience (str): 'farmers' | 'vets' | 'all'  (default 'all')
          - urgency (str): 'normal' | 'important' | 'urgent'  (default 'normal')
          - link (str, optional): URL the recipient lands on when they click
        """
        if getattr(request.user, 'role', None) != 'admin':
            return Response(
                {'success': False, 'error': 'Only admins can broadcast notifications'},
                status=status.HTTP_403_FORBIDDEN,
            )

        title = (request.data.get('title') or '').strip()
        message = (request.data.get('message') or '').strip()
        audience = (request.data.get('audience') or 'all').strip().lower()
        urgency = (request.data.get('urgency') or 'normal').strip().lower()
        link = request.data.get('link') or None

        if not title or not message:
            return Response(
                {'success': False, 'error': 'title and message are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if audience not in ('all', 'farmers', 'vets'):
            return Response(
                {'success': False, 'error': "audience must be 'all', 'farmers', or 'vets'"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if urgency not in ('normal', 'important', 'urgent'):
            urgency = 'normal'

        # Resolve recipients (only approved farmers/vets, never the admin themselves)
        from authentication.models import CustomUser
        if audience == 'farmers':
            qs = CustomUser.objects.filter(role='farmer')
        elif audience == 'vets':
            qs = CustomUser.objects.filter(role='vet')
        else:
            qs = CustomUser.objects.filter(role__in=['farmer', 'vet'])
        qs = qs.filter(status='approved').exclude(id=request.user.id)

        # Optional: prefix urgent/important titles for instant visual distinction
        prefix_map = {
            'urgent': '🚨 URGENT: ',
            'important': '⚠️ Important: ',
            'normal': '',
        }
        decorated_title = f"{prefix_map[urgency]}{title}"

        sent = 0
        for user in qs.iterator():
            create_notification(
                recipient=user,
                sender=request.user,
                notification_type='system',
                title=decorated_title,
                message=message,
                link=link,
                data={
                    'urgency': urgency,
                    'audience': audience,
                    'broadcast': True,
                },
            )
            sent += 1

        return Response({
            'success': True,
            'message': f'Broadcast delivered to {sent} user(s).',
            'count': sent,
            'audience': audience,
            'urgency': urgency,
        }, status=status.HTTP_200_OK)
