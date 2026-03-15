import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointment.models import Appointment

User = get_user_model()

# Check the user who's trying to create appointments
print("=" * 60)
print("CHECKING USER ACCOUNTS")
print("=" * 60)

# Find users with phone number 9813451005 (from the logs)
users = User.objects.filter(phone='9813451005')
print(f"\nFound {users.count()} user(s) with phone 9813451005:")
for user in users:
    print(f"\n  Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Role: {user.role}")
    print(f"  Is Staff: {user.is_staff}")
    print(f"  Is Active: {user.is_active}")

# Check all farmers
print("\n" + "=" * 60)
print("ALL FARMER ACCOUNTS")
print("=" * 60)
farmers = User.objects.filter(role='farmer')
print(f"\nTotal farmers: {farmers.count()}")
for farmer in farmers[:5]:  # Show first 5
    print(f"\n  Username: {farmer.username}")
    print(f"  Email: {farmer.email}")
    print(f"  Phone: {farmer.phone}")
    print(f"  Role: {farmer.role}")

# Check all vets
print("\n" + "=" * 60)
print("ALL VET ACCOUNTS")
print("=" * 60)
vets = User.objects.filter(role='vet')
print(f"\nTotal vets: {vets.count()}")
for vet in vets[:5]:  # Show first 5
    print(f"\n  Username: {vet.username}")
    print(f"  Email: {vet.email}")
    print(f"  Phone: {vet.phone}")
    print(f"  Role: {vet.role}")

# Check existing appointments
print("\n" + "=" * 60)
print("EXISTING APPOINTMENTS")
print("=" * 60)
appointments = Appointment.objects.all()
print(f"\nTotal appointments: {appointments.count()}")
for apt in appointments[:3]:  # Show first 3
    print(f"\n  ID: {apt.id}")
    print(f"  Farmer: {apt.farmer.username} (role: {apt.farmer.role})")
    print(f"  Vet: {apt.veterinarian.username} (role: {apt.veterinarian.role})")
    print(f"  Status: {apt.status}")
    print(f"  Date: {apt.preferred_date}")
