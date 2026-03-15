import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointment.models import Appointment

User = get_user_model()

print("=" * 60)
print("VET APPOINTMENTS TEST")
print("=" * 60)

# Get all vets
vets = User.objects.filter(role='vet')
print(f"\nTotal Vets in system: {vets.count()}")

for vet in vets:
    print(f"\n--- Vet: {vet.username} ({vet.get_full_name() or 'No name'}) ---")
    
    # Get appointments for this vet
    vet_appointments = Appointment.objects.filter(veterinarian=vet)
    print(f"Total appointments: {vet_appointments.count()}")
    
    if vet_appointments.exists():
        print("\nAppointments:")
        for apt in vet_appointments:
            print(f"  - ID: {apt.id}")
            print(f"    Farmer: {apt.farmer.username} ({apt.farmer.get_full_name() or 'No name'})")
            print(f"    Animal: {apt.animal_type}")
            print(f"    Status: {apt.status}")
            print(f"    Date: {apt.preferred_date} at {apt.preferred_time}")
            print(f"    Reason: {apt.reason[:50]}...")
            print()

# Get all appointments
all_appointments = Appointment.objects.all()
print(f"\n{'=' * 60}")
print(f"TOTAL APPOINTMENTS IN SYSTEM: {all_appointments.count()}")
print(f"{'=' * 60}")

if all_appointments.exists():
    print("\nAll Appointments:")
    for apt in all_appointments:
        print(f"  - ID: {apt.id}")
        print(f"    Farmer: {apt.farmer.username}")
        print(f"    Vet: {apt.veterinarian.username if apt.veterinarian else 'None'}")
        print(f"    Status: {apt.status}")
        print()
