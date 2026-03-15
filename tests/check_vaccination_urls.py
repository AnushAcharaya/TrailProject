#!/usr/bin/env python
"""
Check if vaccination URLs are properly configured
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import get_resolver
from django.conf import settings

print("=" * 60)
print("VACCINATION URL CONFIGURATION CHECK")
print("=" * 60)

# Check if vaccination is in INSTALLED_APPS
print("\n1. Checking INSTALLED_APPS...")
if 'vaccination' in settings.INSTALLED_APPS:
    print("   ✓ 'vaccination' is in INSTALLED_APPS")
else:
    print("   ✗ 'vaccination' is NOT in INSTALLED_APPS")

# Get all URL patterns
print("\n2. Checking URL patterns...")
resolver = get_resolver()

def print_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # This is an included URLconf
            new_prefix = prefix + str(pattern.pattern)
            print_urls(pattern.url_patterns, new_prefix)
        else:
            # This is a regular URL pattern
            full_pattern = prefix + str(pattern.pattern)
            if 'vaccination' in full_pattern:
                print(f"   ✓ Found: {full_pattern}")

print_urls(resolver.url_patterns)

print("\n3. Testing vaccination app import...")
try:
    from vaccination import views, models, serializers
    print("   ✓ Vaccination app imports successfully")
    print(f"   ✓ VaccinationViewSet: {views.VaccinationViewSet}")
    print(f"   ✓ Vaccination model: {models.Vaccination}")
except Exception as e:
    print(f"   ✗ Error importing vaccination app: {e}")

print("\n" + "=" * 60)
print("CHECK COMPLETE")
print("=" * 60)
