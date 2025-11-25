import os
from django.core.exceptions import ValidationError

ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB


def validate_image_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError('Unsupported file extension.')


def validate_image_size(value):
    if value.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError('Image file too large ( > 2MB ).')