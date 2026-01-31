from django.db import models
from authentication.models import CustomUser
from authentication.validators import validate_image_size, validate_image_extension


class UserProfile(models.Model):
    """
    Extended profile information for users.
    Fields from registration (username, email, full_name, phone, address, role) 
    are stored in CustomUser model and displayed here.
    Additional editable fields are stored in this model.
    """
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('np', 'Nepali'),
    ]
    
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Profile Information (editable)
    bio = models.TextField(blank=True, null=True, max_length=500)
    location = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    profile_image = models.ImageField(
        upload_to='profile_images/', 
        blank=True, 
        null=True,
        validators=[validate_image_extension, validate_image_size]
    )
    
    # Preferences (editable)
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
