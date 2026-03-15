import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser
from livestockcrud.models import Livestock
from vaccination.models import Vaccination
from medical.models import Treatment

print("=" * 80)
print("CHECKING FARMER DATA (Prashant - ID: 3)")
print("=" * 80)

# Get the farmer user
try:
    farmer = CustomUser.objects.get(id=3, role='farmer')
    print(f"\nFarmer found:")
    print(f"  Username: {farmer.username}")
    print(f"  Email: {farmer.email}")
    print(f"  Full Name: {farmer.get_full_name()}")
    
    # Check livestock
    livestock = Livestock.objects.filter(user=farmer)
    print(f"\nLivestock count: {livestock.count()}")
    if livestock.exists():
        for animal in livestock:
            # Check what fields exist
            species_name = animal.species.name if hasattr(animal, 'species') and animal.species else 'No species'
            animal_id = animal.id if hasattr(animal, 'id') else 'No ID'
            print(f"  - ID: {animal_id}, Species: {species_name}")
    else:
        print("  No livestock found for this farmer")
    
    # Check vaccinations
    vaccinations = Vaccination.objects.filter(livestock__user=farmer)
    print(f"\nVaccination count: {vaccinations.count()}")
    if vaccinations.exists():
        for vacc in vaccinations:
            livestock_id = vacc.livestock.id if vacc.livestock else 'No livestock'
            print(f"  - {vacc.vaccine_name} for livestock ID: {livestock_id}")
    else:
        print("  No vaccinations found for this farmer's livestock")
    
    # Check treatments
    treatments = Treatment.objects.filter(livestock__user=farmer)
    print(f"\nTreatment count: {treatments.count()}")
    if treatments.exists():
        for treatment in treatments:
            livestock_id = treatment.livestock.id if treatment.livestock else 'No livestock'
            print(f"  - {treatment.diagnosis} for livestock ID: {livestock_id}")
    else:
        print("  No treatments found for this farmer's livestock")
    
except CustomUser.DoesNotExist:
    print("\nFarmer with ID 3 not found!")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("\nThe farmer 'Prashant' needs to:")
print("1. Add livestock animals first")
print("2. Then add vaccinations for those animals")
print("3. Then add medical treatments for those animals")
print("\nAll pages will be empty until data is added!")
print("=" * 80)
