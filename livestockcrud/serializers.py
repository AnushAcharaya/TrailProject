from rest_framework import serializers
from django.core.validators import FileExtensionValidator
from .models import Livestock, Species, Breed

class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ['id', 'name']

class BreedSerializer(serializers.ModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)
    
    class Meta:
        model = Breed
        fields = ['id', 'name', 'species', 'species_name']

class LivestockSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    image_preview = serializers.SerializerMethodField()
    species_name = serializers.CharField(source='species.name', read_only=True)
    breed_name = serializers.CharField(source='breed.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Livestock
        fields = [
            'id', 'tag_id', 'species', 'species_name', 'breed', 'breed_name',
            'date_of_birth', 'age', 'gender', 'color', 'weight', 'health_status',
            'remarks', 'image', 'image_preview',
            'is_active', 'user', 'user_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tag_id', 'age', 'created_at', 'updated_at', 'user']
        
    def validate_image(self, value):
        if value:
            validator = FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
            validator(value)
            if value.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("Image size must be less than 5MB")
        return value

    def get_image_preview(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else None
        return None
