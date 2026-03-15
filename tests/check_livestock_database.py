import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from livestockcrud.models import Livestock
from authentication.models import CustomUser

print("=" * 60)
print("LIVESTOCK DATABASE CHECK")
print("=" * 60)

# Check all livestock
all_livestock = Livestock.objects.all()
print(f"\nTotal livestock in database: {all_livestock.count()}")

if all_livestock.exists():
    print("\nLivestock records:")
    for livestock in all_livestock:
        print(f"  - ID: {livestock.id}")
        print(f"    Tag ID: {livestock.tag_id}")
        print(f"    Species: {livestock.species.name}")
        print(f"    Breed: {livestock.breed.name}")
        print(f"    User: {livestock.user.username} (ID: {livestock.user.id})")
        print(f"    User Full Name: {livestock.user.full_name}")
        print(f"    Is Active: {livestock.is_active}")
        print(f"    Created: {livestock.created_at}")
        print()

# Check all users
all_users = CustomUser.objects.all()
print(f"\nTotal users in database: {all_users.count()}")

if all_users.exists():
    print("\nUser records:")
    for user in all_users:
        print(f"  - ID: {user.id}")
        print(f"    Username: {user.username}")
        print(f"    Full Name: {user.full_name}")
        print(f"    Role: {user.role}")
        print(f"    Livestock count: {user.livestock.count()}")
        print()

print("=" * 60)
