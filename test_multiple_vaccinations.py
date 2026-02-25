#!/usr/bin/env python
"""Test that one animal can have multiple vaccinations"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vaccination.models import Vaccination
from livestockcrud.models import Livestock
from django.contrib.auth import get_user_model
from datetime import date, timedelta

User = get_user_model()

print("=" * 60)
print("TESTING MULTIPLE VACCINATIONS PER ANIMAL")
print("=" * 60)

# Get a farmer and their livestock
user = User.objects.filter(role='farmer').first()
if not user:
    print("❌ No farmer found")
    exit(1)

livestock = Livestock.objects.filter(user=user).first()
if not livestock:
    print("❌ No livestock found")
    exit(1)

print(f"\nTesting with:")
print(f"  Farmer: {user.email}")
print(f"  Livestock: {livestock.tag_id} ({livestock.species})")

# Create multiple vaccinations for the same animal
print("\n" + "=" * 60)
print("CREATING MULTIPLE VACCINATIONS")
print("=" * 60)

vaccinations_data = [
    {
        'vaccine_name': 'FMD Vaccine',
        'vaccine_type': 'Viral Vaccine',
        'date_given': date.today() - timedelta(days=30),
        'next_due_date': date.today() + timedelta(days=335),
    },
    {
        'vaccine_name': 'Anthrax Vaccine',
        'vaccine_type': 'Bacterial Vaccine',
        'date_given': date.today() - timedelta(days=15),
        'next_due_date': date.today() + timedelta(days=350),
    },
    {
        'vaccine_name': 'Blackleg Vaccine',
        'vaccine_type': 'Clostridial Vaccine',
        'date_given': date.today(),
        'next_due_date': date.today() + timedelta(days=180),
    },
]

created_ids = []
for vac_data in vaccinations_data:
    vac = Vaccination.objects.create(
        livestock=livestock,
        user=user,
        notes=f"Test vaccination for {livestock.tag_id}",
        **vac_data
    )
    created_ids.append(vac.id)
    print(f"✓ Created: {vac.vaccine_name} (ID: {vac.id})")

# Verify all vaccinations exist for this animal
print("\n" + "=" * 60)
print("VERIFYING VACCINATIONS")
print("=" * 60)

all_vaccinations = Vaccination.objects.filter(livestock=livestock)
print(f"\nTotal vaccinations for {livestock.tag_id}: {all_vaccinations.count()}")

for vac in all_vaccinations:
    print(f"\n  ID: {vac.id}")
    print(f"  Vaccine: {vac.vaccine_name}")
    print(f"  Type: {vac.vaccine_type}")
    print(f"  Status: {vac.get_status()}")
    print(f"  Days until due: {vac.days_until_due()}")

# Clean up test data
print("\n" + "=" * 60)
print("CLEANING UP TEST DATA")
print("=" * 60)

for vac_id in created_ids:
    Vaccination.objects.filter(id=vac_id).delete()
    print(f"✓ Deleted vaccination ID: {vac_id}")

print("\n" + "=" * 60)
print("✅ TEST COMPLETE")
print("=" * 60)
print("\nOne animal can have multiple vaccinations!")
print("The system correctly supports one-to-many relationship.")
