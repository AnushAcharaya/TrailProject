# vaccination/serializers.py
from rest_framework import serializers
from .models import Vaccination
from livestockcrud.models import Livestock

class LivestockSerializer(serializers.ModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    
    class Meta:
        model = Livestock
        fields = ['id', 'tag_id', 'species_name', 'breed_name']

class VaccinationSerializer(serializers.ModelSerializer):
    livestock = LivestockSerializer(read_only=True)
    livestock_tag = serializers.CharField(write_only=True)
    status = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Vaccination
        fields = [
            'id', 'livestock', 'livestock_tag', 'vaccine_name', 'vaccine_type',
            'date_given', 'next_due_date', 'notes', 'status', 'days_until_due',
            'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'days_until_due', 'status_display']

    def validate_livestock_tag(self, value):
        try:
            livestock = Livestock.objects.get(tag_id=value)
            # Check ownership - allow vets to access any livestock, farmers can only access their own
            request = self.context.get('request')
            if request:
                user = request.user
                # If user is a vet, allow access to any livestock
                if user.role == 'vet':
                    return value
                # If user is a farmer, only allow their own livestock
                elif user != livestock.user:
                    raise serializers.ValidationError("You can only access your own livestock")
            return value
        except Livestock.DoesNotExist:
            raise serializers.ValidationError("Livestock not found")

    def create(self, validated_data):
        livestock_tag = validated_data.pop('livestock_tag')
        livestock = Livestock.objects.get(tag_id=livestock_tag)
        validated_data['livestock'] = livestock
        # Store with the livestock owner's user ID (so farmer can see vet's records)
        validated_data['user'] = livestock.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        livestock_tag = validated_data.pop('livestock_tag', None)
        if livestock_tag:
            livestock = Livestock.objects.get(tag_id=livestock_tag)
            validated_data['livestock'] = livestock
        return super().update(instance, validated_data)

    def get_status(self, obj):
        status = obj.get_status()
        # Only treat due_today as completed (when user marks it as completed)
        if status == 'due_today':
            return 'completed'
        return status

    def get_days_until_due(self, obj):
        return obj.days_until_due()

    def get_status_display(self, obj):
        status = obj.get_status()
        if status == 'overdue':
            days = abs(obj.days_until_due())
            return f"Overdue by {days} days"
        elif status == 'due_today':
            return "Due today"
        else:
            return f"Due in {obj.days_until_due()} days"
