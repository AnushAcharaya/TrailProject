import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from insurance.models import Enrollment

enrollments = Enrollment.objects.all()
print(f'Total enrollments: {enrollments.count()}')
print()

for e in enrollments:
    print(f'ID: {e.id}')
    print(f'Farmer: {e.farmer.email}')
    print(f'Status: {e.status}')
    print(f'Livestock: {e.livestock}')
    print(f'Plan: {e.plan.name}')
    print(f'Start Date: {e.start_date}')
    print(f'End Date: {e.end_date}')
    print('-' * 50)
