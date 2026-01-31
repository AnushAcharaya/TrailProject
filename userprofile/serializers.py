from rest_framework import serializers
from .models import UserProfile
from authentication.models import CustomUser


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model with nested user data from CustomUser.
    Combines registration data (from CustomUser) with profile data (from UserProfile).
    """
    # Read-only fields from CustomUser (from registration)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    address = serializers.CharField(source='user.address', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    status = serializers.CharField(source='user.status', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    # Role-specific fields (read-only, from registration)
    farm_name = serializers.CharField(source='user.farm_name', read_only=True, allow_null=True)
    specialization = serializers.CharField(source='user.specialization', read_only=True, allow_null=True)
    
    # Profile image URL
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            # From CustomUser (read-only)
            'username',
            'email',
            'full_name',
            'phone',
            'address',
            'role',
            'status',
            'date_joined',
            'farm_name',
            'specialization',
            
            # From UserProfile (editable)
            'bio',
            'location',
            'gender',
            'profile_image',
            'profile_image_url',
            'theme',
            'language',
            'email_notifications',
            'push_notifications',
            
            # Metadata
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_profile_image_url(self, obj):
        """Return full URL for profile image"""
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for updating only editable profile fields.
    Does not allow updating CustomUser fields.
    """
    class Meta:
        model = UserProfile
        fields = [
            'bio',
            'location',
            'gender',
            'profile_image',
        ]
    
    def validate_bio(self, value):
        """Validate bio length"""
        if value and len(value) > 500:
            raise serializers.ValidationError("Bio must be 500 characters or less.")
        return value


class UpdatePreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user preferences/settings.
    """
    class Meta:
        model = UserProfile
        fields = [
            'theme',
            'language',
            'email_notifications',
            'push_notifications',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        """Validate password change data"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New password and confirm password do not match."
            })
        
        if data['new_password'] == data['old_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password."
            })
        
        return data
    
    def validate_new_password(self, value):
        """Validate new password strength"""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        # Add more password validation rules if needed
        # e.g., must contain uppercase, lowercase, numbers, special chars
        
        return value
