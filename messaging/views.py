from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer
from friends.models import Friendship


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for messages
    
    def get_queryset(self):
        user = self.request.user
        friendship_id = self.request.query_params.get('friendship_id')
        
        # Get all friendships where user is involved
        user_friendships = Friendship.objects.filter(
            Q(user1=user) | Q(user2=user)
        )
        
        queryset = Message.objects.filter(friendship__in=user_friendships)
        
        # Filter by specific friendship if provided
        if friendship_id:
            queryset = queryset.filter(friendship_id=friendship_id)
        
        return queryset.order_by('created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def create(self, request):
        serializer = MessageCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        friendship_id = serializer.validated_data['friendship'].id
        
        # Verify user is part of this friendship
        try:
            friendship = Friendship.objects.get(
                Q(id=friendship_id) & (Q(user1=request.user) | Q(user2=request.user))
            )
        except Friendship.DoesNotExist:
            return Response(
                {'error': 'You are not part of this friendship'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create message
        message = Message.objects.create(
            friendship=friendship,
            sender=request.user,
            text=serializer.validated_data['text']
        )
        
        response_serializer = MessageSerializer(message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        
        # Only the receiver can mark as read
        if message.sender == request.user:
            return Response(
                {'error': 'Cannot mark your own message as read'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.is_read = True
        message.save()
        
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        friendship_id = request.data.get('friendship_id')
        
        if not friendship_id:
            return Response(
                {'error': 'friendship_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user is part of this friendship
        try:
            friendship = Friendship.objects.get(
                Q(id=friendship_id) & (Q(user1=request.user) | Q(user2=request.user))
            )
        except Friendship.DoesNotExist:
            return Response(
                {'error': 'You are not part of this friendship'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark all messages from the other user as read
        updated = Message.objects.filter(
            friendship=friendship,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        
        return Response({'marked_read': updated})
