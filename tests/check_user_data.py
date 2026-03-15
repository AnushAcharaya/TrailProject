import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock
from medical.models import Treatment
from vaccination.models import Vaccination

User = get_user_model()

print("=" * 60)
print("USER DATA CHECK")
print("=" * 60)

# Check farmer user
farmer = User.objects.filter(username='papu').first()
if farmer:
    print(f"\nFarmer: {farmer.username}")
    print(f"  Email: {farmer.email}")
    print(f"  Role: {farmer.role}")
    print(f"  Full Name: {farmer.get_full_name() or 'Not set'}")
    print(f"  First Name: {farmer.first_name}")
    print(f"  Last Name: {farmer.last_name}")
    
    # Check livestock
    livestock = Livestock.objects.filter(user=farmer)
    print(f"\n  Livestock Count: {livestock.count()}")
    if livestock.exists():
        for animal in livestock[:3]:
            print(f"    - {animal.tag_id} ({animal.species.name if animal.species else 'No species'})")
    
    # Check treatments
    treatments = Treatment.objects.filter(livestock__user=farmer)
    print(f"\n  Treatment Records: {treatments.count()}")
    
    # Check vaccinations
    vaccinations = Vaccination.objects.filter(livestock__user=farmer)
    print(f"  Vaccination Records: {vaccinations.count()}")
else:
    print("\nFarmer 'papu' not found!")

# Check vet user
vet = User.objects.filter(role='vet').first()
if vet:
    print(f"\n\nVet: {vet.username}")
    print(f"  Email: {vet.email}")
    print(f"  Role: {vet.role}")
    print(f"  Full Name: {vet.get_full_name() or 'Not set'}")
