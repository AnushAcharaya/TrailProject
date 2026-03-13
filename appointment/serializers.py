# appointment/serializers.py
from rest_framework import serializers
from .models import Appointment
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for appointments"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number']
    
    def get_full_name(self, obj):
        return obj.get_full_name() if hasattr(obj, 'get_full_name') else obj.email


class AppointmentSerializer(serializers.ModelSerializer):
    farmer_details = UserBasicSerializer(source='farmer', read_only=True)
    veterinarian_details = UserBasicSerializer(source='veterinarian', read_only=True)
    
    # Write-only fields for creating appointments
    veterinarian_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'farmer', 'farmer_details', 'veterinarian', 'veterinarian_id',
            'veterinarian_details', 'animal_type', 'reason', 'preferred_date',
            'preferred_time', 'status', 'vet_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['farmer', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set farmer from request user
        validated_data['farmer'] = self.context['request'].user
        
        # Get veterinarian from veterinarian_id
        vet_id = validated_data.pop('veterinarian_id', None)
        if vet_id:
            try:
                veterinarian = User.objects.get(id=vet_id, user_type='vet')
                validated_data['veterinarian'] = veterinarian
            except User.DoesNotExist:
                raise serializers.ValidationError({"veterinarian_id": "Invalid veterinarian ID"})
        
        return super().create(validated_data)
    
    def validate(self, data):
        # Ensure veterinarian is provided for new appointments
        if not self.instance and 'veterinarian_id' not in data and 'veterinarian' not in data:
            raise serializers.ValidationError({"veterinarian": "Veterinarian is required"})
        
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
