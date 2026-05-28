"""
Test Plan: Vaccination Scheduler and Reminder
Test IDs : TP-5.1 to TP-5.10
API Prefix: /api/v1/vaccination/
"""

from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import CustomUser
from livestockcrud.models import Species, Breed, Livestock
from vaccination.models import Vaccination


def make_farmer(username='vacfarmer', email='vacfarmer@gmail.com', phone='9800000005', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Vac Farmer', address='Bhaktapur', role='farmer', password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


def make_livestock(farmer):
    species = Species.objects.get_or_create(name='Goat')[0]
    breed = Breed.objects.get_or_create(name='Boer', species=species)[0]
    return Livestock.objects.create(
        user=farmer, tag_id='VAC-001', species=species, breed=breed,
        date_of_birth=date.today() - timedelta(days=400), gender='Male',
    )


class TP5_VaccinationTests(TestCase):
    """TP-5.1 to TP-5.10 — Vaccination CRUD and status logic"""

    def setUp(self):
        self.client = APIClient()
        self.farmer = make_farmer()
        token = get_token(self.client, self.farmer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.livestock = make_livestock(self.farmer)
        self.url = '/api/v1/vaccination/'

    def _valid_payload(self, tag_suffix=''):
        return {
            'livestock_tag': self.livestock.tag_id,
            'vaccine_name': f'FMD Vaccine{tag_suffix}',
            'vaccine_type': 'Viral Vaccine',
            'date_given': str(date.today() - timedelta(days=10)),
            'next_due_date': str(date.today() + timedelta(days=180)),
            'vet_name': 'Dr. Hari',
            'notes': 'First dose',
        }

    # TP-5.1 Add vaccination record with valid data
    def test_tp5_1_add_vaccination_valid(self):
        response = self.client.post(self.url, self._valid_payload(), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Vaccination.objects.filter(vaccine_name='FMD Vaccine').exists())

    # TP-5.2 next_due_date before date_given — model validation (clean()) prevents this
    def test_tp5_2_due_date_before_given_date(self):
        from django.core.exceptions import ValidationError
        vac = Vaccination(
            livestock=self.livestock,
            user=self.farmer,
            vaccine_name='Invalid Vac',
            vaccine_type='Viral Vaccine',
            date_given=date.today(),
            next_due_date=date.today() - timedelta(days=1),
        )
        with self.assertRaises(ValidationError):
            vac.full_clean()

    # TP-5.3 View vaccination history (list endpoint)
    def test_tp5_3_view_vaccination_history(self):
        Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='PPR Vaccine', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=90),
            next_due_date=date.today() + timedelta(days=90),
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    # TP-5.4 Edit vaccination record
    def test_tp5_4_edit_vaccination(self):
        vac = Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='Old Name', vaccine_type='Bacterial Vaccine',
            date_given=date.today() - timedelta(days=30),
            next_due_date=date.today() + timedelta(days=60),
        )
        response = self.client.patch(f'{self.url}{vac.id}/', {
            'vaccine_name': 'Updated Name',
            'next_due_date': str(date.today() + timedelta(days=90)),
        }, format='json')
        self.assertEqual(response.status_code, 200)
        vac.refresh_from_db()
        self.assertEqual(vac.vaccine_name, 'Updated Name')

    # TP-5.5 Delete vaccination record
    def test_tp5_5_delete_vaccination(self):
        vac = Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='To Delete', vaccine_type='Clostridial Vaccine',
            date_given=date.today() - timedelta(days=10),
            next_due_date=date.today() + timedelta(days=30),
        )
        response = self.client.delete(f'{self.url}{vac.id}/')
        self.assertIn(response.status_code, [200, 204])
        self.assertFalse(Vaccination.objects.filter(id=vac.id).exists())

    # TP-5.6 Status shows 'overdue' when next_due_date is in the past
    def test_tp5_6_status_overdue(self):
        vac = Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='Overdue Vac', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=60),
            next_due_date=date.today() - timedelta(days=5),
        )
        self.assertEqual(vac.get_status(), 'overdue')

    # TP-5.7 Status shows 'due_today' when next_due_date is today
    def test_tp5_7_status_due_today(self):
        vac = Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='Due Today Vac', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=30),
            next_due_date=date.today(),
        )
        self.assertEqual(vac.get_status(), 'due_today')

    # TP-5.8 Status shows 'upcoming' when next_due_date is in the future
    def test_tp5_8_status_upcoming(self):
        vac = Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='Upcoming Vac', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=10),
            next_due_date=date.today() + timedelta(days=5),
        )
        self.assertEqual(vac.get_status(), 'upcoming')

    # TP-5.9 Dashboard API returns upcoming_vaccinations count
    def test_tp5_9_dashboard_vaccination_count(self):
        Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='Upcoming 1', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=5),
            next_due_date=date.today() + timedelta(days=3),
        )
        response = self.client.get('/api/v1/profile/farmer/dashboard/stats/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('upcoming_vaccinations', str(response.data))

    # TP-5.10 Select vaccine_type=Clostridial saved correctly
    def test_tp5_10_vaccine_type_clostridial(self):
        payload = self._valid_payload(' B')
        payload['vaccine_type'] = 'Clostridial Vaccine'
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        vac = Vaccination.objects.get(vaccine_name='FMD Vaccine B')
        self.assertEqual(vac.vaccine_type, 'Clostridial Vaccine')
