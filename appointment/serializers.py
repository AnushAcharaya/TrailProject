# appointment/serializers.py
from rest_framework import serializers
from .models import Appointment
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for appointments"""
    full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'phone']
    
    def get_full_name(self, obj):
        """Get full name or fallback to username"""
        full_name = obj.get_full_name() if hasattr(obj, 'get_full_name') else ''
        return full_name if full_name else obj.username


class AppointmentSerializer(serializers.ModelSerializer):
    farmer_details = UserBasicSerializer(source='farmer', read_only=True)
    veterinarian_details = UserBasicSerializer(source='veterinarian', read_only=True)
    
    # Write-only fields for creating appointments - accept either ID or username
    veterinarian_id = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'farmer', 'farmer_details', 'veterinarian', 'veterinarian_id',
            'veterinarian_details', 'animal_type', 'reason', 'preferred_date',
            'preferred_time', 'status', 'vet_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['farmer', 'veterinarian', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set farmer from request user
        validated_data['farmer'] = self.context['request'].user
        
        # Get veterinarian from veterinarian_id (can be ID or username)
        vet_identifier = validated_data.pop('veterinarian_id', None)
        if vet_identifier:
            try:
                # Try to get by ID first (if it's numeric)
                if str(vet_identifier).isdigit():
                    veterinarian = User.objects.get(id=int(vet_identifier), role='vet')
                else:
                    # Otherwise try by username
                    veterinarian = User.objects.get(username=vet_identifier, role='vet')
                validated_data['veterinarian'] = veterinarian
            except User.DoesNotExist:
                raise serializers.ValidationError({"veterinarian_id": "Invalid veterinarian ID or username"})
        
        return super().create(validated_data)
    
    def validate(self, data):
        # Ensure veterinarian_id is provided for new appointments
        if not self.instance:
            if 'veterinarian_id' not in data and 'veterinarian' not in data:
                raise serializers.ValidationError({"veterinarian_id": "Veterinarian is required"})
        
        return data


class AppointmentStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointment status"""
    
    class Meta:
        model = Appointment
        fields = ['status', 'vet_notes']
    
    def validate_status(self, value):
        valid_transitions = {
            'Pending': ['Approved', 'Declined'],
            'Approved': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': [],
            'Declined': [],
        }
        
        if self.instance:
            current_status = self.instance.status
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}"
                )
        
        return value
