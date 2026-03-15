import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser

print("\n=== ALL USERS IN DATABASE ===\n")
users = CustomUser.objects.all()

for user in users:
    print(f"Email: {user.email}")
    print(f"Username: {user.username}")
    print(f"Full Name: {user.get_full_name()}")
    print(f"Role: {user.role}")
    print(f"Phone: {user.phone}")
    print("-" * 50)

print(f"\nTotal users: {users.count()}")
print(f"Farmers: {CustomUser.objects.filter(role='farmer').count()}")
print(f"Vets: {CustomUser.objects.filter(role='vet').count()}")
