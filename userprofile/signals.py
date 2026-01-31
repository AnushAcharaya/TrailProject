from django.db.models.signals import post_save
from django.dispatch import receiver
from authentication.models import CustomUser
from .models import UserProfile


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a new CustomUser is created.
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the UserProfile whenever the CustomUser is saved.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
