"""
Test the vet dashboard alerts endpoint
"""
import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from appointment.models import Appointment
from vaccination.models import Vaccination
from medical.models import Treatment

User = get_user_model()

# Get a vet user
try:
    vet = User.objects.filter(role='vet').first()
    if not vet:
        print("❌ No vet user found!")
        exit(1)
    
    print(f"✓ Testing with vet: {vet.username}")
    
    today = timezone.now().date()
    seven_days_from_now = today + timedelta(days=7)
    
    # Get farmers this vet has worked with
    print("\n1. Checking vet's appointments...")
    vet_farmers = Appointment.objects.filter(
        veterinarian=vet,
        status__in=['Approved', 'Completed']
    ).values_list('farmer', flat=True).distinct()
    
    print(f"   Farmers this vet has worked with: {list(vet_farmers)}")
    
    # Check pending appointments
    print("\n2. Checking pending appointments...")
    pending_appointments = Appointment.objects.filter(
        veterinarian=vet,
        status='Pending'
    )
    print(f"   Pending appointments: {pending_appointments.count()}")
    for apt in pending_appointments:
        print(f"     - {apt.id}: {apt.farmer.username} on {apt.preferred_date}")
    
    # Check overdue vaccinations
    print("\n3. Checking overdue vaccinations...")
    try:
        overdue_vaccinations = Vaccination.objects.filter(
            user__in=vet_farmers,
            next_due_date__lt=today
        )
        print(f"   Overdue vaccinations: {overdue_vaccinations.count()}")
        for vac in overdue_vaccinations:
            print(f"     - {vac.id}: {vac.vaccine_name} for {vac.livestock.tag_id}")
    except Exception as e:
        print(f"   ❌ Error checking vaccinations: {e}")
        traceback.print_exc()
    
    # Check upcoming treatments
    print("\n4. Checking upcoming treatments...")
    try:
        upcoming_treatments = Treatment.objects.filter(
            user__in=vet_farmers,
            next_treatment_date__lte=seven_days_from_now,
            next_treatment_date__gte=today,
            status='In Progress'
        )
        print(f"   Upcoming treatments: {upcoming_treatments.count()}")
        for treatment in upcoming_treatments:
            print(f"     - {treatment.id}: {treatment.treatment_name} for {treatment.livestock.tag_id}")
    except Exception as e:
        print(f"   ❌ Error checking treatments: {e}")
        traceback.print_exc()
    
    print("\n✅ Test completed!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    traceback.print_exc()
