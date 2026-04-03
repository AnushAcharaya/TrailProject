#!/usr/bin/env python
"""
Quick test script to check dashboard statistics
Run with: python test_dashboard_stats.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from appointment.models import Appointment
from medical.models import Treatment
from authentication.models import CustomUser

# Get the vet user (assuming username is 'vet' or similar)
print("=" * 60)
print("DASHBOARD STATISTICS DEBUG")
print("=" * 60)

# List all vets
vets = CustomUser.objects.filter(role='vet')
print(f"\nFound {vets.count()} vet(s):")
for vet in vets:
    print(f"  - {vet.username} (ID: {vet.id})")

if vets.exists():
    vet = vets.first()
    print(f"\nChecking stats for vet: {vet.username}")
    print("-" * 60)
    
    # Check appointments
    print("\n1. ALL APPOINTMENTS for this vet:")
    all_appointments = Appointment.objects.filter(veterinarian=vet)
    print(f"   Total: {all_appointments.count()}")
    for apt in all_appointments:
        print(f"   - ID: {apt.id}, Farmer: {apt.farmer.username}, Status: '{apt.status}', Date: {apt.preferred_date}")
    
    # Check pending appointments
    print("\n2. PENDING APPOINTMENTS (status='Pending'):")
    pending = Appointment.objects.filter(veterinarian=vet, status='Pending')
    print(f"   Count: {pending.count()}")
    for apt in pending:
        print(f"   - ID: {apt.id}, Farmer: {apt.farmer.username}, Status: '{apt.status}'")
    
    # Check approved/completed appointments
    print("\n3. APPROVED/COMPLETED APPOINTMENTS:")
    approved = Appointment.objects.filter(veterinarian=vet, status__in=['Approved', 'Completed'])
    print(f"   Count: {approved.count()}")
    for apt in approved:
        print(f"   - ID: {apt.id}, Farmer: {apt.farmer.username}, Status: '{apt.status}'")
    
    # Check farmers treated
    print("\n4. FARMERS TREATED (unique farmers with Approved/Completed appointments):")
    farmers_with_appointments = Appointment.objects.filter(
        veterinarian=vet,
        status__in=['Approved', 'Completed']
    ).values('farmer').distinct().count()
    print(f"   Count: {farmers_with_appointments}")
    
    # Check treatments
    print("\n5. TREATMENTS:")
    vet_farmers = Appointment.objects.filter(
        veterinarian=vet,
        status__in=['Approved', 'Completed']
    ).values_list('farmer', flat=True).distinct()
    print(f"   Farmers this vet has worked with: {list(vet_farmers)}")
    
    all_treatments = Treatment.objects.filter(user__in=vet_farmers)
    print(f"   Total treatments for these farmers: {all_treatments.count()}")
    for treatment in all_treatments:
        print(f"   - ID: {treatment.id}, Animal: {treatment.livestock.tag_id}, Status: '{treatment.status}'")
    
    completed_treatments = Treatment.objects.filter(
        user__in=vet_farmers,
        status='Completed'
    )
    print(f"   Completed treatments: {completed_treatments.count()}")
    
    animals_treated = Treatment.objects.filter(
        user__in=vet_farmers,
        status='Completed'
    ).values('livestock').distinct().count()
    print(f"   Unique animals with completed treatments: {animals_treated}")

print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
if vets.exists():
    vet = vets.first()
    pending_count = Appointment.objects.filter(veterinarian=vet, status='Pending').count()
    farmers_count = Appointment.objects.filter(
        veterinarian=vet,
        status__in=['Approved', 'Completed']
    ).values('farmer').distinct().count()
    
    vet_farmers = Appointment.objects.filter(
        veterinarian=vet,
        status__in=['Approved', 'Completed']
    ).values_list('farmer', flat=True).distinct()
    
    animals_count = Treatment.objects.filter(
        user__in=vet_farmers,
        status='Completed'
    ).values('livestock').distinct().count()
    
    print(f"Farmers Treated: {farmers_count}")
    print(f"Animals Treated: {animals_count}")
    print(f"Pending Appointments: {pending_count}")
    print(f"Today's Accepted: (not calculated in this script)")
else:
    print("No vets found in database!")

print("=" * 60)
