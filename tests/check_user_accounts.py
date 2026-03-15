import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser
from userprofile.models import UserProfile

print("=" * 80)
print("CHECKING ALL USER ACCOUNTS IN DATABASE")
print("=" * 80)

users = CustomUser.objects.all()

print(f"\nTotal users in database: {users.count()}\n")

for user in users:
    print("-" * 80)
    print(f"ID: {user.id}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Phone: {user.phone}")
    print(f"Role: {user.role}")
    print(f"First Name: {user.first_name}")
    print(f"Last Name: {user.last_name}")
    print(f"Full Name: {user.get_full_name()}")
    print(f"Is Active: {user.is_active}")
    
    # Check if user has a profile
    try:
        profile = UserProfile.objects.get(user=user)
        print(f"\nProfile exists:")
        print(f"  - Bio: {profile.bio[:50] if profile.bio else 'None'}...")
        print(f"  - Location: {profile.location}")
        print(f"  - Gender: {profile.gender}")
        print(f"  - Profile Image: {profile.profile_image}")
    except UserProfile.DoesNotExist:
        print(f"\nNo UserProfile found for this user")
    
    print()

print("=" * 80)
print("SUMMARY")
print("=" * 80)

farmers = CustomUser.objects.filter(role='farmer')
vets = CustomUser.objects.filter(role='vet')
admins = CustomUser.objects.filter(role='admin')

print(f"Farmers: {farmers.count()}")
for farmer in farmers:
    print(f"  - {farmer.email} ({farmer.get_full_name()})")

print(f"\nVets: {vets.count()}")
for vet in vets:
    print(f"  - {vet.email} ({vet.get_full_name()})")

print(f"\nAdmins: {admins.count()}")
for admin in admins:
    print(f"  - {admin.email} ({admin.get_full_name()})")

print("\n" + "=" * 80)
