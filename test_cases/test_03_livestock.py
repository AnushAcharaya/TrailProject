"""
Test Plan: Livestock CRUD Module
Test IDs : TP-3.1 to TP-3.10
API Prefix: /api/v1/livestock/
"""

import io
from datetime import date, timedelta
from PIL import Image
from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from authentication.models import CustomUser
from livestockcrud.models import Species, Breed, Livestock


def make_farmer(username='farmer3', email='farmer3@gmail.com', phone='9800000003', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Livestock Farmer', address='Bhaktapur', role='farmer', password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


def make_image_file(name='cow.jpg'):
    buf = io.BytesIO()
    Image.new('RGB', (50, 50), color='brown').save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type='image/jpeg')


class TP3_LivestockCRUDTests(TestCase):
    """TP-3.1 to TP-3.10 — Livestock CRUD"""

    def setUp(self):
        self.client = APIClient()
        self.farmer = make_farmer()
        token = get_token(self.client, self.farmer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        self.species = Species.objects.create(name='Cow')
        self.breed = Breed.objects.create(name='Holstein', species=self.species)
        self.list_url = '/api/v1/livestock/livestock/'

    def _valid_payload(self):
        return {
            'species': self.species.id,
            'breed': self.breed.id,
            'date_of_birth': str(date.today() - timedelta(days=365)),
            'gender': 'Female',
            'weight': '350.00',
            'health_status': 'Healthy',
            'color': 'Black',
        }

    # TP-3.1 Add livestock with valid data
    def test_tp3_1_add_livestock_valid(self):
        count_before = Livestock.objects.filter(user=self.farmer).count()
        response = self.client.post(self.list_url, self._valid_payload(), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertGreater(Livestock.objects.filter(user=self.farmer).count(), count_before)

    # TP-3.2 Duplicate tag ID — auto-generated tag_id is always unique; verify 2 animals get different tags
    def test_tp3_2_unique_tag_ids_auto_generated(self):
        self.client.post(self.list_url, self._valid_payload(), format='json')
        self.client.post(self.list_url, self._valid_payload(), format='json')
        animals = Livestock.objects.filter(user=self.farmer)
        tag_ids = list(animals.values_list('tag_id', flat=True))
        self.assertEqual(len(tag_ids), len(set(tag_ids)))  # all unique

    # TP-3.3 Future date of birth — model validation (clean()) prevents future DOB
    def test_tp3_3_future_dob(self):
        from django.core.exceptions import ValidationError
        from datetime import date, timedelta
        species = Species.objects.get_or_create(name='Cow')[0]
        breed = Breed.objects.get_or_create(name='Holstein', species=species)[0]
        livestock = Livestock(
            user=self.farmer, species=species, breed=breed,
            tag_id='FUTURE-TEST',
            date_of_birth=date.today() + timedelta(days=10),
            gender='Male',
        )
        with self.assertRaises(ValidationError):
            livestock.full_clean()

    # TP-3.4 Filter livestock by species and health_status
    def test_tp3_4_filter_livestock(self):
        Livestock.objects.create(
            user=self.farmer, tag_id='TAG-004', species=self.species,
            breed=self.breed, date_of_birth=date.today() - timedelta(days=200),
            gender='Female', health_status='Healthy',
        )
        response = self.client.get(self.list_url, {
            'species': self.species.id, 'health_status': 'Healthy'
        })
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)
    # TP-3.5 Search livestock by tag ID
    def test_tp3_5_search_by_tag_id(self):
        Livestock.objects.create(
            user=self.farmer, tag_id='TAG-SEARCH', species=self.species,
            breed=self.breed, date_of_birth=date.today() - timedelta(days=100),
            gender='Male',
        )
        response = self.client.get(self.list_url, {'search': 'TAG-SEARCH'})
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        self.assertTrue(any('TAG-SEARCH' in str(r) for r in results))

    # TP-3.6 Edit livestock details
    def test_tp3_6_edit_livestock(self):
        livestock = Livestock.objects.create(
            user=self.farmer, tag_id='TAG-EDIT', species=self.species,
            breed=self.breed, date_of_birth=date.today() - timedelta(days=500),
            gender='Male', weight=200,
        )
        response = self.client.patch(
            f'/api/v1/livestock/livestock/{livestock.id}/',
            {'weight': '250.00', 'health_status': 'Healthy'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        livestock.refresh_from_db()
        self.assertEqual(str(livestock.weight), '250.00')

    # TP-3.7 Delete livestock record
    def test_tp3_7_delete_livestock(self):
        livestock = Livestock.objects.create(
            user=self.farmer, tag_id='TAG-DEL', species=self.species,
            breed=self.breed, date_of_birth=date.today() - timedelta(days=300),
            gender='Female',
        )
        livestock_id = livestock.id
        response = self.client.delete(f'/api/v1/livestock/livestock/{livestock_id}/')
        self.assertIn(response.status_code, [200, 204])
        self.assertFalse(Livestock.objects.filter(id=livestock_id).exists())

    # TP-3.8 Species-breed cascade: breed list filtered by species (no pagination)
    def test_tp3_8_breed_filters_by_species(self):
        goat_species = Species.objects.create(name='Goat')
        Breed.objects.create(name='Boer', species=goat_species)
        response = self.client.get('/api/v1/livestock/breeds/', {'species': self.species.id})
        self.assertEqual(response.status_code, 200)
        data = response.data
        if isinstance(data, dict):
            breed_names = [b['name'] for b in data.get('results', [])]
        else:
            breed_names = [b['name'] for b in data]
        self.assertIn('Holstein', breed_names)
        self.assertNotIn('Boer', breed_names)

    # TP-3.9 Preview auto-generated tag ID
    def test_tp3_9_preview_tag_id(self):
        response = self.client.get('/api/v1/livestock/livestock/preview-tag-id/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('tag_id', response.data)

    # TP-3.10 Deceased animal with is_active=True — model validation prevents this
    def test_tp3_10_deceased_active_validation(self):
        from django.core.exceptions import ValidationError
        livestock = Livestock(
            user=self.farmer, tag_id='DECEASED-TEST',
            species=self.species, breed=self.breed,
            date_of_birth=date.today() - timedelta(days=500),
            gender='Male', health_status='Deceased', is_active=True,
        )
        with self.assertRaises(ValidationError):
            livestock.full_clean()
