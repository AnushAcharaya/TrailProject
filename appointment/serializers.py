# appointment/serializers.py
from rest_framework import serializers
from .models import Appointment
from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock

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

    # Write-only fields for creating appointments
    veterinarian_id = serializers.CharField(write_only=True, required=True)
    livestock_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'farmer', 'farmer_details', 'veterinarian', 'veterinarian_id',
            'veterinarian_details', 'livestock', 'livestock_id', 'animal_type',
            'reason', 'preferred_date', 'preferred_time', 'status', 'vet_notes',
            'created_at', 'updated_at', 'payment', 'payment_status', 'appointment_fee'
        ]
        read_only_fields = ['farmer', 'veterinarian', 'livestock', 'created_at', 'updated_at', 'payment', 'payment_status']

    def create(self, validated_data):
        validated_data['farmer'] = self.context['request'].user

        # Resolve veterinarian
        vet_identifier = validated_data.pop('veterinarian_id', None)
        veterinarian = None
        if vet_identifier:
            try:
                if str(vet_identifier).isdigit():
                    veterinarian = User.objects.get(id=int(vet_identifier), role='vet')
                else:
                    veterinarian = User.objects.get(username=vet_identifier, role='vet')
                validated_data['veterinarian'] = veterinarian
            except User.DoesNotExist:
                raise serializers.ValidationError({"veterinarian_id": "Invalid veterinarian ID or username"})

        # Resolve livestock and auto-fill animal_type from species name
        livestock_id = validated_data.pop('livestock_id', None)
        if livestock_id:
            try:
                livestock = Livestock.objects.select_related('species').get(
                    id=livestock_id,
                    user=validated_data['farmer']
                )
                validated_data['livestock'] = livestock
                if not validated_data.get('animal_type'):
                    validated_data['animal_type'] = livestock.species.name if livestock.species else ''
            except Livestock.DoesNotExist:
                raise serializers.ValidationError({"livestock_id": "Invalid livestock ID or not owned by you"})

        # Fee resolution
        if validated_data.get('appointment_fee') is None and veterinarian is not None:
            profile = getattr(veterinarian, 'profile', None)
            if profile and profile.consultation_fee is not None:
                validated_data['appointment_fee'] = profile.consultation_fee

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
