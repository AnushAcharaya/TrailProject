# medical/serializers.py
from rest_framework import serializers
from .models import Treatment, Medicine
from livestockcrud.models import Livestock

class MedicineSerializer(serializers.ModelSerializer):
    # Override exact_times to handle string time values from frontend
    exact_times = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'dosage', 'frequency', 'duration', 'schedule_type', 'start_time', 'interval_hours', 'exact_times']
        extra_kwargs = {
            'id': {'read_only': True},
            'start_time': {'required': True},
            'interval_hours': {'required': False, 'allow_null': True}
        }
    
    def validate(self, data):
        """Validate medicine data before saving"""
        schedule_type = data.get('schedule_type')
        interval_hours = data.get('interval_hours')
        exact_times = data.get('exact_times')
        frequency = data.get('frequency')
        
        # Validate interval schedule
        if schedule_type == 'interval' and not interval_hours:
            raise serializers.ValidationError({
                'interval_hours': 'Interval hours required for interval schedule'
            })
        
        # Validate exact schedule
        if schedule_type == 'exact':
            if not exact_times:
                raise serializers.ValidationError({
                    'exact_times': f'Exactly {frequency} exact times required for exact schedule'
                })
            if len(exact_times) != frequency:
                raise serializers.ValidationError({
                    'exact_times': f'Exactly {frequency} exact times required, but {len(exact_times)} provided'
                })
        
        return data

class LivestockSerializer(serializers.ModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    
    class Meta:
        model = Livestock
        fields = ['id', 'tag_id', 'species_name', 'breed_name', 'age', 'gender', 'weight']

class TreatmentSerializer(serializers.ModelSerializer):
    livestock = LivestockSerializer(read_only=True)
    livestock_tag = serializers.CharField(write_only=True)
    medicines = MedicineSerializer(many=True, required=False)
    days_until_next = serializers.ReadOnlyField()
    status_display = serializers.ReadOnlyField(source='get_status_display')
    is_active_tracking = serializers.ReadOnlyField()
    
    class Meta:
        model = Treatment
        fields = [
            'id', 'livestock', 'livestock_tag', 'treatment_name', 'diagnosis', 
            'vet_name', 'treatment_date', 'next_treatment_date', 'status', 
            'document', 'medicines', 'days_until_next', 'status_display',
            'is_active_tracking', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'days_until_next', 'status_display', 'is_active_tracking']
    
    def validate_livestock_tag(self, value):
        try:
            livestock = Livestock.objects.get(tag_id=value)
            request = self.context.get('request')
            if request:
                user = request.user
                # If user is a vet, allow access to any livestock
                if user.role == 'vet':
                    return value
                # If user is a farmer, only allow their own livestock
                elif user != livestock.user:
                    raise serializers.ValidationError("You can only treat your own livestock")
            return value
        except Livestock.DoesNotExist:
            raise serializers.ValidationError("Livestock not found")
    
    def create(self, validated_data):
        print(f"\n[TreatmentSerializer.create] ========== START ==========")
        print(f"[TreatmentSerializer.create] validated_data keys: {validated_data.keys()}")
        print(f"[TreatmentSerializer.create] 'medicines' in validated_data: {'medicines' in validated_data}")
        if 'medicines' in validated_data:
            print(f"[TreatmentSerializer.create] medicines value: {validated_data['medicines']}")
            print(f"[TreatmentSerializer.create] medicines length: {len(validated_data['medicines'])}")
        else:
            print(f"[TreatmentSerializer.create] ⚠️ NO 'medicines' KEY IN validated_data!")
        
        livestock_tag = validated_data.pop('livestock_tag')
        livestock = Livestock.objects.get(tag_id=livestock_tag)
        validated_data['livestock'] = livestock
        # Store with the livestock owner's user ID (so farmer can see vet's records)
        validated_data['user'] = livestock.user
        
        medicines_data = validated_data.pop('medicines', [])
        print(f"[TreatmentSerializer.create] After pop - medicines_data: {medicines_data}")
        print(f"[TreatmentSerializer.create] After pop - medicines_data length: {len(medicines_data)}")
        treatment = Treatment.objects.create(**validated_data)
        
        # Create medicines with proper validation
        for i, med_data in enumerate(medicines_data):
            try:
                medicine_serializer = MedicineSerializer(data=med_data)
                if medicine_serializer.is_valid(raise_exception=True):
                    medicine_serializer.save(treatment=treatment)
            except serializers.ValidationError as e:
                # Clean up the treatment if medicine validation fails
                treatment.delete()
                raise serializers.ValidationError({
                    'medicines': f'Medicine {i+1} validation failed: {e.detail}'
                })
        
        return treatment
    
    def update(self, instance, validated_data):
        medicines_data = validated_data.pop('medicines', None)
        if medicines_data is not None:
            instance.medicines.all().delete()
            for i, med_data in enumerate(medicines_data):
                try:
                    medicine_serializer = MedicineSerializer(data=med_data)
                    if medicine_serializer.is_valid(raise_exception=True):
                        medicine_serializer.save(treatment=instance)
                except serializers.ValidationError as e:
                    raise serializers.ValidationError({
                        'medicines': f'Medicine {i+1} validation failed: {e.detail}'
                    })
        
        return super().update(instance, validated_data)
