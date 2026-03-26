from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FriendRequestViewSet, FriendshipViewSet

router = DefaultRouter()
router.register(r'requests', FriendRequestViewSet, basename='friend-request')
router.register(r'friendships', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('', include(router.urls)),
]
