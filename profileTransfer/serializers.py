# profileTransfer/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Transfer
from livestockcrud.models import Livestock

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for nested serialization"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number', 'role']
        read_only_fields = fields


class LivestockBasicSerializer(serializers.ModelSerializer):
    """Basic livestock info for nested serialization"""
    species_name = serializers.CharField(source='species.name', read_only=True)
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Livestock
        fields = [
            'id', 'tag_number', 'name', 'species_name', 'breed_name',
            'age', 'gender', 'health_status', 'owner', 'owner_name', 'image'
        ]
        read_only_fields = fields


class TransferSerializer(serializers.ModelSerializer):
    """Serializer for livestock ownership transfers"""
    sender_details = UserBasicSerializer(source='sender', read_only=True)
    receiver_details = UserBasicSerializer(source='receiver', read_only=True)
    admin_reviewer_details = UserBasicSerializer(source='admin_reviewer', read_only=True)
    livestock_details = LivestockBasicSerializer(source='livestock', read_only=True)
    
    # Computed fields
    animal_tag = serializers.CharField(read_only=True)
    animal_name = serializers.CharField(read_only=True)
    sender_name = serializers.CharField(read_only=True)
    receiver_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Transfer
        fields = [
            'id', 'livestock', 'livestock_details', 'sender', 'sender_details',
            'receiver', 'receiver_details', 'admin_reviewer', 'admin_reviewer_details',
            'reason', 'status', 'receiver_notes', 'admin_notes',
            'supporting_document', 'created_at', 'updated_at',
            'receiver_approved_at', 'admin_approved_at', 'completed_at',
            'animal_tag', 'animal_name', 'sender_name', 'receiver_name'
        ]
        read_only_fields = [
            'sender', 'admin_reviewer', 'status', 'receiver_approved_at',
            'admin_approved_at', 'completed_at', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate transfer data"""
        request = self.context.get('request')
        
        # For new transfers
        if not self.instance:
            # Check if livestock belongs to sender
            if 'livestock' in data:
                if data['livestock'].owner != request.user:
                    raise serializers.ValidationError(
                        "You can only transfer livestock you own"
                    )
            
            # Check if sender and receiver are different
            if 'receiver' in data:
                if data['receiver'] == request.user:
                    raise serializers.ValidationError(
                        "You cannot transfer livestock to yourself"
                    )
            
            # Check if livestock already has pending transfer
            if 'livestock' in data:
                existing_pending = Transfer.objects.filter(
                    livestock=data['livestock'],
                    status__in=['Pending', 'Receiver Approved']
                ).exists()
                if existing_pending:
                    raise serializers.ValidationError(
                        "This livestock already has a pending transfer"
                    )
        
        return data
    
    def create(self, validated_data):
        """Create transfer with sender set to current user"""
        request = self.context.get('request')
        validated_data['sender'] = request.user
        validated_data['status'] = 'Pending'
        return super().create(validated_data)


class TransferStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating transfer status"""
    status = serializers.ChoiceField(
        choices=['Receiver Approved', 'Rejected', 'Admin Approved', 'Completed']
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_status(self, value):
        """Validate status transition"""
        transfer = self.context.get('transfer')
        current_status = transfer.status
        
        # Define valid status transitions
        valid_transitions = {
            'Pending': ['Receiver Approved', 'Rejected'],
            'Receiver Approved': ['Admin Approved', 'Rejected'],
            'Admin Approved': ['Completed'],
        }
        
        if current_status not in valid_transitions:
            raise serializers.ValidationError(
                f"Cannot update transfer with status '{current_status}'"
            )
        
        if value not in valid_transitions[current_status]:
            raise serializers.ValidationError(
                f"Invalid status transition from '{current_status}' to '{value}'"
            )
        
        return value


class TransferStatsSerializer(serializers.Serializer):
    """Serializer for transfer statistics"""
    total_transfers = serializers.IntegerField()
    pending_transfers = serializers.IntegerField()
    receiver_approved_transfers = serializers.IntegerField()
    admin_approved_transfers = serializers.IntegerField()
    completed_transfers = serializers.IntegerField()
    rejected_transfers = serializers.IntegerField()


class FarmerSearchSerializer(serializers.Serializer):
    """Serializer for farmer search results"""
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    farm_name = serializers.CharField(required=False, allow_null=True)
