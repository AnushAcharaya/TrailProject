from rest_framework import serializers
from .models import FriendRequest, Friendship
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'role', 'phone', 'profile_image_url']
    
    def get_profile_image_url(self, obj):
        """Return full URL for profile image from UserProfile"""
        print(f"[UserBasicSerializer] Getting profile image for user: {obj.username}")
        try:
            if hasattr(obj, 'profile'):
                print(f"[UserBasicSerializer] User has profile attribute")
                profile = obj.profile
                print(f"[UserBasicSerializer] Profile image field: {profile.profile_image}")
                if profile.profile_image:
                    request = self.context.get('request')
                    print(f"[UserBasicSerializer] Request context: {request}")
                    if request:
                        url = request.build_absolute_uri(profile.profile_image.url)
                        print(f"[UserBasicSerializer] Built absolute URL: {url}")
                        return url
                    url = profile.profile_image.url
                    print(f"[UserBasicSerializer] Relative URL: {url}")
                    return url
                else:
                    print(f"[UserBasicSerializer] Profile image is empty")
            else:
                print(f"[UserBasicSerializer] User does not have profile attribute")
        except Exception as e:
            print(f"[UserBasicSerializer] Exception: {e}")
        return None


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)
    receiver_username = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'receiver_username', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'status', 'created_at', 'updated_at']
    
    def validate_receiver_username(self, value):
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value


class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = ['id', 'friend', 'created_at']
    
    def get_friend(self, obj):
        request_user = self.context.get('request').user
        friend = obj.user2 if obj.user1 == request_user else obj.user1
        return UserBasicSerializer(friend, context=self.context).data
