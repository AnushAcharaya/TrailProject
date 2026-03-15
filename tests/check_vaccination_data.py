#!/usr/bin/env python
"""Check vaccination data in database"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vaccination.models import Vaccination
from django.utils import timezone

print("=" * 60)
print("VACCINATION DATA CHECK")
print("=" * 60)

vaccinations = Vaccination.objects.all()
print(f"\nTotal vaccinations: {vaccinations.count()}")

today = timezone.now().date()
print(f"Today's date: {today}")

for v in vaccinations:
    print(f"\nID: {v.id}")
    print(f"  Vaccine: {v.vaccine_name}")
    print(f"  Livestock: {v.livestock.tag_id}")
    print(f"  Date Given: {v.date_given}")
    print(f"  Next Due: {v.next_due_date}")
    print(f"  Status: {v.get_status()}")
    print(f"  Days until due: {v.days_until_due()}")
    
print("\n" + "=" * 60)
print("COUNTS")
print("=" * 60)
upcoming = Vaccination.objects.filter(next_due_date__gt=today).count()
overdue = Vaccination.objects.filter(next_due_date__lt=today).count()
due_today = Vaccination.objects.filter(next_due_date=today).count()

print(f"Upcoming (next_due_date > today): {upcoming}")
print(f"Overdue (next_due_date < today): {overdue}")
print(f"Due today (next_due_date = today): {due_today}")
