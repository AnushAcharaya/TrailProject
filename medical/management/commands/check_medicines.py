from django.core.management.base import BaseCommand
from medical.models import Treatment, Medicine

class Command(BaseCommand):
    help = 'Check medicines in all treatments'

    def handle(self, *args, **options):
        treatments = Treatment.objects.all().order_by('-created_at')
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'Total treatments: {treatments.count()}'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
        
        for treatment in treatments[:10]:  # Show last 10
            medicines_count = treatment.medicines.count()
            
            self.stdout.write(f'\nTreatment ID: {treatment.id}')
            self.stdout.write(f'  Name: {treatment.treatment_name}')
            self.stdout.write(f'  Livestock: {treatment.livestock.tag_id}')
            self.stdout.write(f'  Date: {treatment.treatment_date}')
            self.stdout.write(f'  Medicines count: {medicines_count}')
            
            if medicines_count > 0:
                self.stdout.write(self.style.SUCCESS('  Medicines:'))
                for med in treatment.medicines.all():
                    self.stdout.write(self.style.SUCCESS(
                        f'    - {med.name} | Dosage: {med.dosage} | '
                        f'Frequency: {med.frequency}x/day | Duration: {med.duration} days'
                    ))
            else:
                self.stdout.write(self.style.WARNING('  ⚠️ NO MEDICINES!'))
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS('Check complete!'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
