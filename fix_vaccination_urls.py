#!/usr/bin/env python
"""
Script to diagnose and fix vaccination URL issues
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from django.urls import get_resolver
from django.core.management import call_command

print("=" * 70)
print("VACCINATION APP DIAGNOSTIC AND FIX")
print("=" * 70)

# 1. Check if vaccination is in INSTALLED_APPS
print("\n1. Checking INSTALLED_APPS...")
if 'vaccination' in settings.INSTALLED_APPS:
    print("   ✓ 'vaccination' is in INSTALLED_APPS")
else:
    print("   ✗ 'vaccination' is NOT in INSTALLED_APPS")
    print("   Please add 'vaccination' to INSTALLED_APPS in backend/settings.py")
    sys.exit(1)

# 2. Check if migrations exist
print("\n2. Checking migrations...")
try:
    from vaccination.models import Vaccination
    print("   ✓ Vaccination model can be imported")
except Exception as e:
    print(f"   ✗ Error importing Vaccination model: {e}")

# 3. Run migrations
print("\n3. Running migrations...")
try:
    call_command('makemigrations', 'vaccination')
    call_command('migrate', 'vaccination')
    print("   ✓ Migrations completed")
except Exception as e:
    print(f"   ⚠ Migration warning: {e}")

# 4. Check URL patterns
print("\n4. Checking URL patterns...")
resolver = get_resolver()
vaccination_urls_found = False

def check_urls(urlpatterns, prefix=''):
    global vaccination_urls_found
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            new_prefix = prefix + str(pattern.pattern)
            if 'vaccination' in new_prefix:
                vaccination_urls_found = True
                print(f"   ✓ Found vaccination URL pattern: {new_prefix}")
            check_urls(pattern.url_patterns, new_prefix)

check_urls(resolver.url_patterns)

if not vaccination_urls_found:
    print("   ✗ No vaccination URL patterns found!")
    print("   The vaccination URLs should be at: api/vaccination/")
else:
    print("   ✓ Vaccination URLs are configured")

# 5. Test ViewSet
print("\n5. Testing VaccinationViewSet...")
try:
    from vaccination.views import VaccinationViewSet
    from vaccination.serializers import VaccinationSerializer
    print(f"   ✓ VaccinationViewSet: {VaccinationViewSet}")
    print(f"   ✓ VaccinationSerializer: {VaccinationSerializer}")
    print(f"   ✓ Queryset method: {VaccinationViewSet.get_queryset}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "=" * 70)
print("DIAGNOSTIC COMPLETE")
print("=" * 70)
print("\nIf all checks passed, restart your Django server:")
print("  1. Stop the server (Ctrl+C)")
print("  2. Run: python manage.py runserver")
print("=" * 70)
