import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close()
            return

        self.friendship_id = self.scope['url_route']['kwargs']['friendship_id']
        self.room_group_name = f'chat_{self.friendship_id}'

        if not await self.user_in_friendship(user, self.friendship_id):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        user = self.scope.get('user')
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_text = data.get('text', '').strip()
        message_type = data.get('message_type', 'text')

        if not message_text:
            return

        message_data = await self.save_message(user, self.friendship_id, message_text, message_type)
        if not message_data:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_data,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def user_in_friendship(self, user, friendship_id):
        from friends.models import Friendship
        return Friendship.objects.filter(
            Q(id=friendship_id) & (Q(user1=user) | Q(user2=user))
        ).exists()

    @database_sync_to_async
    def save_message(self, user, friendship_id, text, message_type):
        from friends.models import Friendship
        from .models import Message
        try:
            friendship = Friendship.objects.get(
                Q(id=friendship_id) & (Q(user1=user) | Q(user2=user))
            )
            message = Message.objects.create(
                friendship=friendship,
                sender=user,
                text=text,
                message_type=message_type,
            )
            return {
                'id': message.id,
                'friendship': message.friendship_id,
                'sender': message.sender_id,
                'sender_username': user.username,
                'sender_full_name': getattr(user, 'full_name', '') or user.username,
                'text': message.text,
                'message_type': message.message_type,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read,
            }
        except Exception as e:
            print(f'[ChatConsumer] Error saving message: {e}')
            return None
