"""
Quick script to check if you have users in the database
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser

print("=" * 60)
print("CHECKING USERS IN DATABASE")
print("=" * 60)

users = CustomUser.objects.all()

if not users.exists():
    print("\n❌ No users found in database!")
    print("\nYou need to create a user first.")
    print("\nOptions:")
    print("1. Register via frontend: http://localhost:5173/create-account")
    print("2. Create superuser: python manage.py createsuperuser")
else:
    print(f"\n✓ Found {users.count()} user(s):\n")
    
    for user in users:
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Phone: {user.phone}")
        print(f"Role: {user.role}")
        print(f"Status: {user.status}")
        print(f"Email Verified: {user.is_email_verified}")
        print(f"Phone Verified: {user.is_phone_verified}")
        print(f"Active: {user.is_active}")
        print("-" * 60)

print("\n" + "=" * 60)
