# insurance/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InsurancePlan, Enrollment, Claim
from livestockcrud.models import Livestock

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for nested serialization"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'role']
        read_only_fields = fields


class LivestockBasicSerializer(serializers.ModelSerializer):
    """Basic livestock info for nested serialization"""
    species_name = serializers.CharField(source='species.name', read_only=True)
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    
    class Meta:
        model = Livestock
        fields = ['id', 'tag_id', 'species_name', 'breed_name', 'age', 'health_status']
        read_only_fields = fields


class InsurancePlanSerializer(serializers.ModelSerializer):
    """Serializer for insurance plans"""
    coverage_details = serializers.SerializerMethodField()
    
    class Meta:
        model = InsurancePlan
        fields = [
            'id', 'name', 'plan_type', 'coverage_amount', 'premium_amount',
            'description', 'coverage_details', 'waiting_period_days', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_coverage_details(self, obj):
        """Return coverage details as a list"""
        details = []
        if obj.covers_death:
            details.append('Death')
        if obj.covers_theft:
            details.append('Theft')
        if obj.covers_disease:
            details.append('Disease')
        if obj.covers_accident:
            details.append('Accident')
        if obj.covers_natural_disaster:
            details.append('Natural Disaster')
        return details


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for livestock insurance enrollment"""
    farmer_details = UserBasicSerializer(source='farmer', read_only=True)
    livestock_details = LivestockBasicSerializer(source='livestock', read_only=True)
    plan_details = InsurancePlanSerializer(source='plan', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'farmer', 'farmer_details', 'livestock', 'livestock_details',
            'plan', 'plan_details', 'status', 'enrollment_date', 'start_date',
            'end_date', 'premium_paid', 'payment_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['farmer', 'enrollment_date', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate enrollment data"""
        # Get the farmer from context (set by the view)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            farmer = request.user
            
            # Only validate livestock ownership for farmers, not admins
            if farmer.role == 'farmer' and 'livestock' in data:
                if data['livestock'].user != farmer:
                    raise serializers.ValidationError({
                        "livestock": "You can only enroll your own livestock"
                    })
                
                # Check for duplicate enrollment
                if 'plan' in data and 'start_date' in data:
                    existing = Enrollment.objects.filter(
                        livestock=data['livestock'],
                        plan=data['plan'],
                        start_date=data['start_date']
                    ).exists()
                    
                    if existing:
                        raise serializers.ValidationError({
                            "non_field_errors": [
                                f"This livestock is already enrolled in {data['plan'].name} starting on {data['start_date']}. "
                                "Please choose a different plan or start date."
                            ]
                        })
        
        # Check if plan is active
        if 'plan' in data and not data['plan'].is_active:
            raise serializers.ValidationError({
                "plan": "Selected insurance plan is not active"
            })
        
        return data


class ClaimSerializer(serializers.ModelSerializer):
    """Serializer for insurance claims"""
    farmer_details = UserBasicSerializer(source='farmer', read_only=True)
    enrollment_details = EnrollmentSerializer(source='enrollment', read_only=True)
    livestock_details = LivestockBasicSerializer(source='enrollment.livestock', read_only=True)
    plan_details = InsurancePlanSerializer(source='enrollment.plan', read_only=True)
    
    # Override file fields to return absolute URLs
    incident_image = serializers.SerializerMethodField()
    vaccination_history = serializers.SerializerMethodField()
    medical_history = serializers.SerializerMethodField()
    
    class Meta:
        model = Claim
        fields = [
            'id', 'enrollment', 'enrollment_details', 'farmer', 'farmer_details',
            'livestock_details', 'plan_details',
            'claim_type', 'claim_amount', 'incident_date', 'incident_location',
            'description', 'status', 'incident_image', 'vaccination_history', 
            'medical_history', 'admin_notes', 
            'decision_date', 'approved_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'farmer', 'decision_date',
            'created_at', 'updated_at'
        ]
    
    def get_incident_image(self, obj):
        """Return absolute URL for incident image"""
        if obj.incident_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.incident_image.url)
            return obj.incident_image.url
        return None
    
    def get_vaccination_history(self, obj):
        """Return absolute URL for vaccination history"""
        if obj.vaccination_history:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.vaccination_history.url)
            return obj.vaccination_history.url
        return None
    
    def get_medical_history(self, obj):
        """Return absolute URL for medical history"""
        if obj.medical_history:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.medical_history.url)
            return obj.medical_history.url
        return None
    
    def validate(self, data):
        """Validate claim data"""
        # Check if enrollment is active
        if 'enrollment' in data:
            if data['enrollment'].status != 'Active':
                raise serializers.ValidationError(
                    "Can only submit claims for active enrollments"
                )
        
        # Check if claim amount is within coverage
        if 'claim_amount' in data and 'enrollment' in data:
            if data['claim_amount'] > data['enrollment'].plan.coverage_amount:
                raise serializers.ValidationError(
                    f"Claim amount cannot exceed coverage of NPR {data['enrollment'].plan.coverage_amount}"
                )
        
        return data
    
    def create(self, validated_data):
        """Handle file uploads during creation"""
        # Extract file fields from initial_data if present
        request = self.context.get('request')
        if request and request.FILES:
            if 'incident_image' in request.FILES:
                validated_data['incident_image'] = request.FILES['incident_image']
            if 'vaccination_history' in request.FILES:
                validated_data['vaccination_history'] = request.FILES['vaccination_history']
            if 'medical_history' in request.FILES:
                validated_data['medical_history'] = request.FILES['medical_history']
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Handle file uploads during update"""
        # Extract file fields from initial_data if present
        request = self.context.get('request')
        if request and request.FILES:
            if 'incident_image' in request.FILES:
                validated_data['incident_image'] = request.FILES['incident_image']
            if 'vaccination_history' in request.FILES:
                validated_data['vaccination_history'] = request.FILES['vaccination_history']
            if 'medical_history' in request.FILES:
                validated_data['medical_history'] = request.FILES['medical_history']
        
        return super().update(instance, validated_data)


class ClaimStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating claim status"""
    status = serializers.ChoiceField(
        choices=['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid']
    )
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    approved_amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        min_value=0
    )


class ClaimStatsSerializer(serializers.Serializer):
    """Serializer for claim statistics"""
    total_claims = serializers.IntegerField()
    pending_claims = serializers.IntegerField()
    approved_claims = serializers.IntegerField()
    rejected_claims = serializers.IntegerField()
    total_claim_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_approved_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
