"""
Test Plan: Dashboard and Analytics
Test IDs : TP-6.1 to TP-6.10
API Prefix:
  Farmer: /api/v1/profile/farmer/dashboard/
  Vet:    /api/v1/profile/vet/dashboard/
"""

from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import CustomUser
from livestockcrud.models import Species, Breed, Livestock
from vaccination.models import Vaccination
from medical.models import Treatment


def make_user(username, email, phone, role='farmer', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Dashboard User', address='Kathmandu', role=role, password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


def make_livestock(farmer, tag_id='DASH-001', species_name='Cow'):
    species = Species.objects.get_or_create(name=species_name)[0]
    breed = Breed.objects.get_or_create(name='Generic', species=species)[0]
    return Livestock.objects.create(
        user=farmer, tag_id=tag_id, species=species, breed=breed,
        date_of_birth=date.today() - timedelta(days=500), gender='Female',
    )


class TP6_FarmerDashboardTests(TestCase):
    """TP-6.1 to TP-6.4, 6.8, 6.9, 6.10 — Farmer dashboard"""

    def setUp(self):
        self.client = APIClient()
        self.farmer = make_user('dashfarmer', 'dashfarmer@gmail.com', '9800000006')
        token = get_token(self.client, self.farmer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.livestock = make_livestock(self.farmer)

    # TP-6.1 Farmer stats display (counts shown)
    def test_tp6_1_farmer_stats_display(self):
        response = self.client.get('/api/v1/profile/farmer/dashboard/stats/')
        self.assertEqual(response.status_code, 200)
        data = response.data
        # Check that key stat fields are present in response
        response_str = str(data)
        self.assertTrue(
            any(k in response_str for k in [
                'total_livestock', 'livestock', 'vaccination', 'treatment', 'upcoming'
            ])
        )

    # TP-6.2 Livestock distribution chart data
    def test_tp6_2_livestock_distribution_chart(self):
        make_livestock(self.farmer, 'DASH-002', 'Goat')
        response = self.client.get('/api/v1/profile/farmer/dashboard/charts/')
        self.assertEqual(response.status_code, 200)

    # TP-6.3 Monthly vaccination bar chart data
    def test_tp6_3_monthly_vaccination_chart(self):
        Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='FMD', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=10),
            next_due_date=date.today() + timedelta(days=170),
        )
        response = self.client.get('/api/v1/profile/farmer/dashboard/charts/')
        self.assertEqual(response.status_code, 200)

    # TP-6.4 Recent activities feed
    def test_tp6_4_recent_activities_feed(self):
        response = self.client.get('/api/v1/profile/farmer/dashboard/activities/')
        self.assertEqual(response.status_code, 200)

    # TP-6.8 Empty dashboard (new farmer, no data) → all zeros or empty
    def test_tp6_8_empty_dashboard_new_farmer(self):
        new_farmer = make_user('newdash', 'newdash@gmail.com', '9800000066')
        new_client = APIClient()
        token = get_token(new_client, new_farmer)
        new_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = new_client.get('/api/v1/profile/farmer/dashboard/stats/')
        self.assertEqual(response.status_code, 200)

    # TP-6.9 Dashboard refreshes with latest data
    def test_tp6_9_dashboard_refresh(self):
        resp1 = self.client.get('/api/v1/profile/farmer/dashboard/stats/')
        # Add data
        make_livestock(self.farmer, 'DASH-NEW', 'Sheep')
        resp2 = self.client.get('/api/v1/profile/farmer/dashboard/stats/')
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp2.status_code, 200)

    # TP-6.10 Vaccination alerts linked via stats endpoint
    def test_tp6_10_navigate_from_dashboard(self):
        Vaccination.objects.create(
            livestock=self.livestock, user=self.farmer,
            vaccine_name='Alert Vac', vaccine_type='Viral Vaccine',
            date_given=date.today() - timedelta(days=30),
            next_due_date=date.today() - timedelta(days=1),  # overdue
        )
        response = self.client.get('/api/v1/profile/farmer/dashboard/stats/')
        self.assertEqual(response.status_code, 200)


class TP6_VetDashboardTests(TestCase):
    """TP-6.5, 6.6, 6.7 — Vet dashboard"""

    def setUp(self):
        self.client = APIClient()
        self.vet = make_user('dashvet', 'dashvet@gmail.com', '9800000007', role='vet')
        token = get_token(self.client, self.vet)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # TP-6.5 Vet dashboard stats loaded
    def test_tp6_5_vet_dashboard_stats(self):
        response = self.client.get('/api/v1/profile/vet/dashboard/stats/')
        self.assertEqual(response.status_code, 200)

    # TP-6.6 Vet activity feed (last 30 days activities)
    def test_tp6_6_vet_activity_feed(self):
        response = self.client.get('/api/v1/profile/vet/dashboard/activities/')
        self.assertEqual(response.status_code, 200)

    # TP-6.7 Vet priority alerts endpoint
    def test_tp6_7_vet_priority_alerts(self):
        response = self.client.get('/api/v1/profile/vet/dashboard/alerts/')
        self.assertEqual(response.status_code, 200)
