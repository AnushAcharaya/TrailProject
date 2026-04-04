from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_name', 'user_full_name',
            'transaction_uuid', 'amount', 'tax_amount', 'total_amount',
            'product_code', 'product_description', 'status',
            'esewa_ref_id', 'payment_method',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'user', 'transaction_uuid', 'status',
            'esewa_ref_id', 'created_at', 'updated_at', 'completed_at'
        ]
    
    def get_user_full_name(self, obj):
        """Get user's full name if available"""
        if hasattr(obj.user, 'profile') and obj.user.profile.full_name:
            return obj.user.profile.full_name
        return obj.user.username


class PaymentInitiateSerializer(serializers.Serializer):
    """Serializer for initiating payment"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
    product_code = serializers.ChoiceField(choices=Payment.PRODUCT_CHOICES)
    product_description = serializers.CharField(required=False, allow_blank=True)
    tax_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        required=False
    )
    
    def validate_amount(self, value):
        """Validate amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer for verifying payment"""
    transaction_uuid = serializers.CharField(max_length=100)
    ref_id = serializers.CharField(max_length=100, required=False)
    oid = serializers.CharField(max_length=100, required=False)
    amt = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    refId = serializers.CharField(max_length=100, required=False)
    
    def validate(self, data):
        """Validate that we have ref_id from either field"""
        ref_id = data.get('ref_id') or data.get('refId')
        if not ref_id:
            raise serializers.ValidationError("ref_id or refId is required")
        data['ref_id'] = ref_id
        return data


class PaymentHistorySerializer(serializers.ModelSerializer):
    """Simplified serializer for payment history"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_uuid', 'amount', 'total_amount',
            'product_code', 'status', 'esewa_ref_id',
            'created_at', 'completed_at', 'user_name'
        ]
