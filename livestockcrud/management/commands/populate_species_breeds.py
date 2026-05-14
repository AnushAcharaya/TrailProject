from django.core.management.base import BaseCommand
from livestockcrud.models import Species, Breed


class Command(BaseCommand):
    help = 'Populate database with default species and breeds (Nepal-relevant)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating species and breeds...')

        species_breeds = {
            'Cattle': [
                # Nepal local breeds
                'Lulu', 'Khari', 'Siri', 'Rana', 'Achhami', 'Pahadi',
                # Cross/exotic breeds common in Nepal
                'Holstein Friesian', 'Jersey', 'Brown Swiss', 'Sahiwal',
                'Gir', 'Tharparkar', 'Hariana',
            ],
            'Buffalo': [
                # Nepal/South Asian breeds
                'Lime', 'Parkote', 'Gaddi', 'Murrah', 'Jaffarabadi',
                'Mehsana', 'Surti', 'Nili-Ravi', 'Bhadawari',
            ],
            'Goat': [
                # Nepal local breeds
                'Chyangra', 'Khari', 'Sinhal', 'Jumli', 'Terai',
                # Common exotic/cross breeds
                'Boer', 'Saanen', 'Alpine', 'Nubian', 'Jamunapari',
                'Barbari', 'Beetal',
            ],
            'Sheep': [
                # Nepal local breeds
                'Baruwal', 'Bhyanglung', 'Kage', 'Lampuchhre', 'Maigra',
                'Jumli', 'Karnali',
                # Common breeds
                'Merino', 'Corriedale', 'Suffolk', 'Dorper',
            ],
            'Pig': [
                # Nepal local / South Asian
                'Hurra', 'Local Hill Pig',
                # Common commercial breeds
                'Large White Yorkshire', 'Landrace', 'Duroc',
                'Hampshire', 'Berkshire',
            ],
            'Chicken': [
                # Nepal / South Asian
                'Sakini', 'Pwankh Kauwa', 'Desi (Local)',
                # Commercial/exotic
                'Rhode Island Red', 'Plymouth Rock', 'Brahma',
                'Leghorn', 'Aseel', 'Kadaknath',
            ],
            'Duck': [
                'Khaki Campbell', 'Indian Runner', 'Muscovy',
                'Pekin', 'Rouen', 'Local Deshi',
            ],
            'Horse': [
                'Spiti', 'Zanskari', 'Marwari',
                'Arabian', 'Thoroughbred', 'Local Hill Horse',
            ],
            'Yak': [
                'Yak (Pure)', 'Chauri (Yak x Cattle)', 'Dimzo', 'Urang',
            ],
            'Rabbit': [
                'New Zealand White', 'Californian', 'Soviet Chinchilla',
                'Gray Giant', 'Local Deshi',
            ],
        }

        created_species = 0
        created_breeds = 0

        for species_name, breeds in species_breeds.items():
            species, created = Species.objects.get_or_create(name=species_name)
            if created:
                created_species += 1
                self.stdout.write(self.style.SUCCESS(f'Created species: {species_name}'))

            for breed_name in breeds:
                breed, created = Breed.objects.get_or_create(
                    name=breed_name,
                    species=species
                )
                if created:
                    created_breeds += 1
                    self.stdout.write(f'  - Created breed: {breed_name}')

        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Created {created_species} species and {created_breeds} breeds.'
        ))
