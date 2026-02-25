from django.core.management.base import BaseCommand
from livestockcrud.models import Species, Breed


class Command(BaseCommand):
    help = 'Populate database with default species and breeds'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating species and breeds...')

        # Define species and their breeds
        species_breeds = {
            'Cattle': ['Holstein', 'Jersey', 'Angus', 'Hereford', 'Brahman', 'Simmental', 'Charolais'],
            'Buffalo': ['Murrah', 'Jaffarabadi', 'Mehsana', 'Surti', 'Nili-Ravi', 'Bhadawari'],
            'Goat': ['Boer', 'Saanen', 'Alpine', 'Nubian', 'Toggenburg', 'LaMancha', 'Kiko'],
            'Sheep': ['Merino', 'Suffolk', 'Dorper', 'Hampshire', 'Rambouillet', 'Texel', 'Katahdin'],
            'Pig': ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace', 'Berkshire', 'Chester White'],
            'Chicken': ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Brahma', 'Orpington', 'Sussex'],
            'Duck': ['Pekin', 'Muscovy', 'Khaki Campbell', 'Indian Runner', 'Rouen', 'Cayuga'],
            'Horse': ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Morgan', 'Appaloosa', 'Mustang'],
        }

        created_species = 0
        created_breeds = 0

        for species_name, breeds in species_breeds.items():
            # Create or get species
            species, created = Species.objects.get_or_create(name=species_name)
            if created:
                created_species += 1
                self.stdout.write(self.style.SUCCESS(f'Created species: {species_name}'))

            # Create breeds for this species
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
