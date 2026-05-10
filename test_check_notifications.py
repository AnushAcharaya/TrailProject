"""
Quick script to check if there are notifications in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

# Get all notifications
all_notifications = Notification.objects.all()
print(f"\n=== Total Notifications in Database: {all_notifications.count()} ===\n")

if all_notifications.exists():
    print("Recent notifications:")
    for notif in all_notifications.order_by('-created_at')[:10]:
        print(f"  - ID: {notif.id}")
        print(f"    Recipient: {notif.recipient.username}")
        print(f"    Title: {notif.title}")
        print(f"    Message: {notif.message}")
        print(f"    Type: {notif.notification_type}")
        print(f"    Read: {notif.is_read}")
        print(f"    Created: {notif.created_at}")
        print()
else:
    print("No notifications found in database!")
    print("\nLet's check users:")
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    if users.exists():
        print("\nUsers:")
        for user in users[:5]:
            print(f"  - {user.username} (ID: {user.id}, Role: {user.role})")
