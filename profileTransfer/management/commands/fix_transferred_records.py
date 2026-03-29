# profileTransfer/management/commands/fix_transferred_records.py
from django.core.management.base import BaseCommand
from profileTransfer.models import Transfer
from vaccination.models import Vaccination
from medical.models import Treatment


class Command(BaseCommand):
    help = 'Fix vaccination and treatment records for already completed transfers'

    def handle(self, *args, **kwargs):
        # Get all completed transfers
        completed_transfers = Transfer.objects.filter(status='Completed')
        
        fixed_vaccinations = 0
        fixed_treatments = 0
        
        for transfer in completed_transfers:
            livestock = transfer.livestock
            receiver = transfer.receiver
            
            # Update vaccination records
            vaccinations = Vaccination.objects.filter(livestock=livestock).exclude(user=receiver)
            count = vaccinations.update(user=receiver)
            fixed_vaccinations += count
            
            # Update treatment records
            treatments = Treatment.objects.filter(livestock=livestock).exclude(user=receiver)
            count = treatments.update(user=receiver)
            fixed_treatments += count
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Fixed records for {livestock.tag_id}: '
                    f'{count} vaccinations, {count} treatments'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nTotal fixed: {fixed_vaccinations} vaccinations, {fixed_treatments} treatments'
            )
        )
