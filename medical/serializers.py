# medical/serializers.py
from rest_framework import serializers
from .models import Treatment, Medicine
from livestockcrud.models import Livestock

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'dosage', 'frequency', 'duration', 'schedule_type', 'start_time', 'interval_hours', 'exact_times']
        extra_kwargs = {
            'id': {'read_only': True}
        }

class LivestockSerializer(serializers.ModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    
    class Meta:
        model = Livestock
        fields = ['id', 'tag_id', 'species_name', 'breed_name']

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
            if request and request.user != livestock.user:
                raise serializers.ValidationError("You can only treat your own livestock")
            return value
        except Livestock.DoesNotExist:
            raise serializers.ValidationError("Livestock not found")
    
    def create(self, validated_data):
        livestock_tag = validated_data.pop('livestock_tag')
        livestock = Livestock.objects.get(tag_id=livestock_tag)
        validated_data['livestock'] = livestock
        validated_data['user'] = self.context['request'].user
        
        medicines_data = validated_data.pop('medicines', [])
        treatment = Treatment.objects.create(**validated_data)
        
        print(f"[TreatmentSerializer.create] About to create {len(medicines_data)} medicines")
        for i, med_data in enumerate(medicines_data):
            print(f"[TreatmentSerializer.create] Medicine {i+1}: {med_data}")
            try:
                # Use MedicineSerializer to properly validate and convert data types
                medicine_serializer = MedicineSerializer(data=med_data)
                if medicine_serializer.is_valid(raise_exception=True):
                    medicine_serializer.save(treatment=treatment)
                    print(f"[TreatmentSerializer.create]   ✓ Medicine {i+1} saved successfully")
            except Exception as e:
                print(f"[TreatmentSerializer.create]   ✗ Error saving medicine {i+1}: {e}")
                raise
        
        print(f"[TreatmentSerializer.create] Final medicines count: {treatment.medicines.count()}")
        return treatment
    
    def update(self, instance, validated_data):
        medicines_data = validated_data.pop('medicines', None)
        if medicines_data is not None:
            instance.medicines.all().delete()
            print(f"[TreatmentSerializer.update] About to update {len(medicines_data)} medicines")
            for i, med_data in enumerate(medicines_data):
                try:
                    # Use MedicineSerializer to properly validate and convert data types
                    medicine_serializer = MedicineSerializer(data=med_data)
                    if medicine_serializer.is_valid(raise_exception=True):
                        medicine_serializer.save(treatment=instance)
                        print(f"[TreatmentSerializer.update]   ✓ Medicine {i+1} saved successfully")
                except Exception as e:
                    print(f"[TreatmentSerializer.update]   ✗ Error saving medicine {i+1}: {e}")
                    raise
        
        return super().update(instance, validated_data)
