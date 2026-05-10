"""
Create test notifications for ALL users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

# Get all users
users = User.objects.all()

for user in users:
    print(f"\nCreating notifications for: {user.username} ({user.role})")
    
    # Create role-specific notifications
    if user.role == 'farmer':
        notifications_data = [
            {
                'title': 'Appointment Confirmed',
                'message': 'Your appointment with a veterinarian has been confirmed',
                'notification_type': 'appointment',
                'link': '/farmerappointment',
            },
            {
                'title': 'Vaccination Reminder',
                'message': 'Your livestock vaccination is due soon',
                'notification_type': 'vaccination',
                'link': '/vaccination',
            },
        ]
    elif user.role == 'vet':
        notifications_data = [
            {
                'title': 'New Appointment Request',
                'message': 'You have a new appointment request from a farmer',
                'notification_type': 'appointment',
                'link': '/vet/appointments',
            },
            {
                'title': 'Profile Update',
                'message': 'A farmer has updated their livestock profile',
                'notification_type': 'system',
                'link': '/vet/farmer-profiles',
            },
        ]
    else:  # admin
        notifications_data = [
            {
                'title': 'New User Registration',
                'message': 'A new user has registered and needs verification',
                'notification_type': 'account',
                'link': '/admin/account-verifications',
            },
        ]
    
    for notif_data in notifications_data:
        notification = Notification.objects.create(
            recipient=user,
            **notif_data
        )
        print(f"  ✓ {notification.title}")

print(f"\n✅ Done! Refresh your browser and check the notification bell.")
