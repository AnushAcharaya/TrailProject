#!/usr/bin/env python
"""Debug vaccination GET endpoint"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vaccination.models import Vaccination
from vaccination.serializers import VaccinationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("DEBUG VACCINATION GET")
print("=" * 60)

# Get a vaccination
vaccination = Vaccination.objects.first()
if not vaccination:
    print("❌ No vaccination found")
    exit(1)

print(f"\nVaccination ID: {vaccination.id}")
print(f"Vaccine: {vaccination.vaccine_name}")
print(f"Livestock: {vaccination.livestock.tag_id}")
print(f"Livestock Species: {vaccination.livestock.species}")

# Serialize it
from rest_framework.request import Request
from django.test import RequestFactory

factory = RequestFactory()
request = factory.get('/')
request.user = vaccination.user

serializer = VaccinationSerializer(vaccination, context={'request': request})
data = serializer.data

print("\n" + "=" * 60)
print("SERIALIZED DATA")
print("=" * 60)
import json
print(json.dumps(data, indent=2, default=str))
