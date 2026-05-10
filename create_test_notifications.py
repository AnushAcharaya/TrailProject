"""
Create test notifications for testing the notification dropdown
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

# Get a farmer user (you can change this to your logged-in user)
try:
    # Try to get user 'raja' (farmer)
    user = User.objects.get(username='raja')
    print(f"Creating notifications for user: {user.username} (ID: {user.id})")
    
    # Create some test notifications
    notifications_data = [
        {
            'title': 'Appointment Confirmed',
            'message': 'Your appointment with Dr. Kamal Dhital has been confirmed for tomorrow at 10:00 AM',
            'notification_type': 'appointment',
            'link': '/farmerappointment',
        },
        {
            'title': 'Vaccination Due',
            'message': 'Your cow (Tag: C001) is due for vaccination next week',
            'notification_type': 'vaccination',
            'link': '/vaccination',
        },
        {
            'title': 'Insurance Claim Update',
            'message': 'Your insurance claim #12345 has been approved',
            'notification_type': 'insurance',
            'link': '/farmerinsurancetrackclaim',
        },
        {
            'title': 'New Message',
            'message': 'You have a new message from Dr. Binod Basnet',
            'notification_type': 'message',
            'link': '/messages',
        },
        {
            'title': 'Friend Request',
            'message': 'John Doe sent you a friend request',
            'notification_type': 'friend',
            'link': '/farmer/friends/requests',
        },
    ]
    
    created_count = 0
    for notif_data in notifications_data:
        notification = Notification.objects.create(
            recipient=user,
            **notif_data
        )
        print(f"  ✓ Created: {notification.title}")
        created_count += 1
    
    print(f"\n✅ Successfully created {created_count} test notifications!")
    print(f"\nNow refresh your browser and click the notification bell to see them.")
    
except User.DoesNotExist:
    print("❌ User 'raja' not found. Please update the script with your username.")
    print("\nAvailable users:")
    for user in User.objects.all():
        print(f"  - {user.username} (Role: {user.role})")
