from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import FriendRequest, Friendship
from .serializers import FriendRequestSerializer, FriendshipSerializer

User = get_user_model()


class FriendRequestViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for friends
    
    def get_queryset(self):
        user = self.request.user
        return FriendRequest.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )
    
    def create(self, request):
        receiver_username = request.data.get('receiver_username')
        
        if not receiver_username:
            return Response(
                {'error': 'receiver_username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if receiver == request.user:
            return Response(
                {'error': 'Cannot send friend request to yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already friends
        if Friendship.objects.filter(
            Q(user1=request.user, user2=receiver) | Q(user1=receiver, user2=request.user)
        ).exists():
            return Response(
                {'error': 'Already friends'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if request already exists (only pending requests)
        if FriendRequest.objects.filter(
            Q(sender=request.user, receiver=receiver) | Q(sender=receiver, receiver=request.user),
            status='pending'
        ).exists():
            return Response(
                {'error': 'Friend request already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friend_request = FriendRequest.objects.create(
            sender=request.user,
            receiver=receiver
        )
        
        serializer = self.get_serializer(friend_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        
        if friend_request.receiver != request.user:
            return Response(
                {'error': 'You can only accept requests sent to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if friend_request.status != 'pending':
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friend_request.status = 'accepted'
        friend_request.save()
        
        # Create friendship
        Friendship.objects.create(
            user1=friend_request.sender,
            user2=friend_request.receiver
        )
        
        serializer = self.get_serializer(friend_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friend_request = self.get_object()
        
        if friend_request.receiver != request.user:
            return Response(
                {'error': 'You can only reject requests sent to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if friend_request.status != 'pending':
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friend_request.status = 'rejected'
        friend_request.save()
        
        serializer = self.get_serializer(friend_request)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        requests = FriendRequest.objects.filter(
            receiver=request.user,
            status='pending'
        )
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        requests = FriendRequest.objects.filter(
            sender=request.user,
            status='pending'
        )
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)


class FriendshipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for friends
    
    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            Q(user1=user) | Q(user2=user)
        )
    
    @action(detail=True, methods=['delete'])
    def remove(self, request, pk=None):
        friendship = self.get_object()
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
