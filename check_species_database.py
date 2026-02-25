import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from livestockcrud.models import Species, Breed

print("="*60)
print("CHECKING SPECIES AND BREEDS IN DATABASE")
print("="*60)

# Check species
species_count = Species.objects.count()
print(f"\nTotal Species in database: {species_count}")

if species_count > 0:
    print("\nSpecies List:")
    for species in Species.objects.all():
        print(f"  - ID: {species.id}, Name: {species.name}")
else:
    print("\n⚠️  NO SPECIES FOUND IN DATABASE!")
    print("   Run: python manage.py populate_species_breeds")

# Check breeds
breed_count = Breed.objects.count()
print(f"\nTotal Breeds in database: {breed_count}")

if breed_count > 0:
    print("\nBreeds List (grouped by species):")
    for species in Species.objects.all():
        breeds = Breed.objects.filter(species=species)
        if breeds.exists():
            print(f"\n  {species.name}:")
            for breed in breeds:
                print(f"    - ID: {breed.id}, Name: {breed.name}")
else:
    print("\n⚠️  NO BREEDS FOUND IN DATABASE!")
    print("   Run: python manage.py populate_species_breeds")

print("\n" + "="*60)
