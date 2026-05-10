import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.
    If the channel-layer backend (Redis) is unreachable, the connection is
    closed cleanly with a single warning log instead of crashing every time.
    """

    async def connect(self):
        # Get user from scope (set by auth middleware)
        self.user = self.scope.get('user')

        # Reject anonymous users
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Create a unique group name for this user
        self.user_group_name = f'notifications_{self.user.id}'

        # Join user's notification group. If the channel layer is down
        # (e.g. Redis isn't running), close the socket cleanly instead of
        # propagating a giant traceback for every reconnect.
        try:
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "WebSocket rejected — channel layer unavailable (is Redis running?): %s",
                exc,
            )
            del self.user_group_name
            await self.close(code=1011)  # 1011 = internal error
            return

        await self.accept()

        try:
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to notification system'
            }))
        except Exception:  # noqa: BLE001
            pass

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'user_group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.user_group_name,
                    self.channel_name,
                )
            except Exception:  # noqa: BLE001
                # Channel layer might already be unreachable — nothing to do.
                pass

    async def receive(self, text_data):
        """Handle messages from WebSocket (client -> server)"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
            elif message_type == 'mark_read':
                # Mark notification as read
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
        except json.JSONDecodeError:
            pass

    async def notification_message(self, event):
        """
        Handle notification messages from channel layer (server -> client)
        This is called when a notification is sent to the user's group
        """
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read (database operation)"""
        from .models import Notification
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
