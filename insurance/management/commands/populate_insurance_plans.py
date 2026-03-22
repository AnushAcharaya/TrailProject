from django.core.management.base import BaseCommand
from insurance.models import InsurancePlan


class Command(BaseCommand):
    help = 'Populate database with sample insurance plans'

    def handle(self, *args, **kwargs):
        plans_data = [
            {
                'name': 'Basic Protection',
                'plan_type': 'basic',
                'coverage_amount': 50000.00,
                'premium_amount': 2500.00,
                'description': 'Essential coverage for livestock death',
                'covers_death': True,
                'covers_theft': False,
                'covers_disease': False,
                'covers_accident': False,
                'covers_natural_disaster': False,
                'waiting_period_days': 30,
                'is_active': True,
            },
            {
                'name': 'Standard Care',
                'plan_type': 'standard',
                'coverage_amount': 100000.00,
                'premium_amount': 5000.00,
                'description': 'Comprehensive coverage including death, theft, and disease',
                'covers_death': True,
                'covers_theft': True,
                'covers_disease': True,
                'covers_accident': False,
                'covers_natural_disaster': False,
                'waiting_period_days': 30,
                'is_active': True,
            },
            {
                'name': 'Premium Shield',
                'plan_type': 'premium',
                'coverage_amount': 200000.00,
                'premium_amount': 10000.00,
                'description': 'Extended protection with accident coverage',
                'covers_death': True,
                'covers_theft': True,
                'covers_disease': True,
                'covers_accident': True,
                'covers_natural_disaster': False,
                'waiting_period_days': 15,
                'is_active': True,
            },
            {
                'name': 'Complete Coverage',
                'plan_type': 'comprehensive',
                'coverage_amount': 300000.00,
                'premium_amount': 15000.00,
                'description': 'Full protection including natural disasters',
                'covers_death': True,
                'covers_theft': True,
                'covers_disease': True,
                'covers_accident': True,
                'covers_natural_disaster': True,
                'waiting_period_days': 15,
                'is_active': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for plan_data in plans_data:
            plan, created = InsurancePlan.objects.update_or_create(
                plan_type=plan_data['plan_type'],
                defaults=plan_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created plan: {plan.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated plan: {plan.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted! Created {created_count} plans, Updated {updated_count} plans'
            )
        )
