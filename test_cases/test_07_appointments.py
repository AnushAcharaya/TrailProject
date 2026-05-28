"""
Test Plan: Vet Appointment Booking
Test IDs : TP-7.1 to TP-7.10
API Prefix: /api/v1/appointments/
"""

from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import CustomUser
from livestockcrud.models import Species, Breed, Livestock
from appointment.models import Appointment


def make_user(username, email, phone, role='farmer', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Appt User', address='Kathmandu', role=role, password=password,
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
    species = Species.objects.get_or_create(name='Sheep')[0]
    breed = Breed.objects.get_or_create(name='Merino', species=species)[0]
    return Livestock.objects.create(
        user=farmer, tag_id='APPT-001', species=species, breed=breed,
        date_of_birth=date.today() - timedelta(days=600), gender='Female',
    )


class TP7_AppointmentTests(TestCase):
    """TP-7.1 to TP-7.10 — Appointment booking and management"""

    def setUp(self):
        self.client = APIClient()
        self.farmer = make_user('apptfarmer', 'apptfarmer@gmail.com', '9800000008')
        self.vet = make_user('apptvet', 'apptvet@gmail.com', '9800000009', role='vet')
        self.livestock = make_livestock(self.farmer)

        self.farmer_token = get_token(self.client, self.farmer)
        self.vet_token = get_token(self.client, self.vet)

        self.url = '/api/v1/appointments/'
        self._auth_farmer()

    def _auth_farmer(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.farmer_token}')

    def _auth_vet(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.vet_token}')

    def _valid_payload(self):
        return {
            'veterinarian_id': str(self.vet.id),
            'livestock_id': self.livestock.id,
            'animal_type': 'Sheep',
            'reason': 'Annual checkup',
            'preferred_date': str(date.today() + timedelta(days=3)),
            'preferred_time': '10:00:00',
        }

    # TP-7.1 Request appointment with valid data
    def test_tp7_1_request_appointment(self):
        response = self.client.post(self.url, self._valid_payload(), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Appointment.objects.filter(farmer=self.farmer, veterinarian=self.vet).exists())

    # TP-7.2 Past-date appointment — model validation (clean()) prevents this
    def test_tp7_2_request_past_date(self):
        from django.core.exceptions import ValidationError
        appt = Appointment(
            farmer=self.farmer, veterinarian=self.vet,
            livestock=self.livestock, animal_type='Sheep',
            reason='Past date test',
            preferred_date=date.today() - timedelta(days=1),
            preferred_time='10:00',
        )
        with self.assertRaises(ValidationError):
            appt.full_clean()

    # TP-7.3 Request appointment to self → 400
    def test_tp7_3_request_to_self(self):
        # Create a user who is both farmer and vet (same user)
        both = make_user('bothuser', 'bothuser@gmail.com', '9800000099', role='farmer')
        token = get_token(self.client, both)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        payload = self._valid_payload()
        payload['veterinarian_id'] = str(both.id)
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-7.6 Vet approves appointment
    def test_tp7_6_vet_approves_appointment(self):
        appt = Appointment.objects.create(
            farmer=self.farmer, veterinarian=self.vet,
            livestock=self.livestock, animal_type='Sheep',
            reason='Checkup', preferred_date=date.today() + timedelta(days=2),
            preferred_time='10:00', status='Pending',
        )
        self._auth_vet()
        response = self.client.patch(f'{self.url}{appt.id}/', {
            'status': 'Approved', 'vet_notes': 'Confirmed'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        appt.refresh_from_db()
        self.assertEqual(appt.status, 'Approved')

    # TP-7.7 Vet declines appointment
    def test_tp7_7_vet_declines_appointment(self):
        appt = Appointment.objects.create(
            farmer=self.farmer, veterinarian=self.vet,
            livestock=self.livestock, animal_type='Sheep',
            reason='Checkup 2', preferred_date=date.today() + timedelta(days=5),
            preferred_time='14:00', status='Pending',
        )
        self._auth_vet()
        response = self.client.patch(f'{self.url}{appt.id}/', {
            'status': 'Declined', 'vet_notes': 'Not available'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        appt.refresh_from_db()
        self.assertEqual(appt.status, 'Declined')

    # TP-7.8 Vet marks appointment as completed
    def test_tp7_8_mark_appointment_completed(self):
        appt = Appointment.objects.create(
            farmer=self.farmer, veterinarian=self.vet,
            livestock=self.livestock, animal_type='Sheep',
            reason='Treatment', preferred_date=date.today() + timedelta(days=1),
            preferred_time='09:00', status='Approved',
        )
        self._auth_vet()
        response = self.client.patch(f'{self.url}{appt.id}/', {'status': 'Completed'}, format='json')
        self.assertEqual(response.status_code, 200)
        appt.refresh_from_db()
        self.assertEqual(appt.status, 'Completed')

    # TP-7.9 Farmer cancels appointment via cancel action
    def test_tp7_9_farmer_cancels_appointment(self):
        appt = Appointment.objects.create(
            farmer=self.farmer, veterinarian=self.vet,
            livestock=self.livestock, animal_type='Sheep',
            reason='Cancel me', preferred_date=date.today() + timedelta(days=4),
            preferred_time='11:00', status='Pending',
        )
        self._auth_farmer()
        response = self.client.post(f'{self.url}{appt.id}/cancel/')
        self.assertEqual(response.status_code, 200)
        appt.refresh_from_db()
        self.assertEqual(appt.status, 'Cancelled')

    # TP-7.10 View appointment list
    def test_tp7_10_view_appointment_list(self):
        Appointment.objects.create(
            farmer=self.farmer, veterinarian=self.vet,
            livestock=self.livestock, animal_type='Sheep',
            reason='List test', preferred_date=date.today() + timedelta(days=6),
            preferred_time='12:00', status='Pending',
        )
        self._auth_farmer()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)
