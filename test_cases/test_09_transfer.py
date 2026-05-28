"""
Test Plan: Ownership Transfer (profileTransfer)
Test IDs : TP-9.1 to TP-9.10
API Prefix: /api/v1/profile-transfer/transfers/
"""

from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import CustomUser
from livestockcrud.models import Species, Breed, Livestock
from profileTransfer.models import Transfer


def make_user(username, email, phone, role='farmer', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Transfer User', address='Kathmandu', role=role, password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


def make_livestock(farmer, tag_id='TR-001'):
    species = Species.objects.get_or_create(name='Horse')[0]
    breed = Breed.objects.get_or_create(name='Arabian', species=species)[0]
    return Livestock.objects.create(
        user=farmer, tag_id=tag_id, species=species, breed=breed,
        date_of_birth=date.today() - timedelta(days=800), gender='Male',
    )


class TP9_TransferTests(TestCase):
    """TP-9.1 to TP-9.10 — Livestock ownership transfer"""

    def setUp(self):
        self.client = APIClient()
        self.sender = make_user('transfersender', 'sender@gmail.com', '9800000013')
        self.receiver = make_user('transferreceiver', 'receiver@gmail.com', '9800000014')
        self.admin = make_user('transferadmin', 'transferadmin@gmail.com', '9800000015', role='admin')

        self.sender_token = get_token(self.client, self.sender)
        self.receiver_token = get_token(self.client, self.receiver)
        self.admin_token = get_token(self.client, self.admin)

        self.livestock = make_livestock(self.sender)
        self.url = '/api/v1/profile-transfer/transfers/'
        self._auth_sender()

    def _auth_sender(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.sender_token}')

    def _auth_receiver(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.receiver_token}')

    def _auth_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')

    # TP-9.1 Initiate transfer with valid data → status=Pending
    def test_tp9_1_initiate_transfer(self):
        response = self.client.post(self.url, {
            'livestock': self.livestock.id,
            'receiver': self.receiver.id,
            'reason': 'Selling animal',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Transfer.objects.filter(
            sender=self.sender, receiver=self.receiver, livestock=self.livestock
        ).exists())

    # TP-9.2 Transfer to self → 400
    def test_tp9_2_transfer_to_self(self):
        response = self.client.post(self.url, {
            'livestock': self.livestock.id,
            'receiver': self.sender.id,
            'reason': 'Self transfer',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-9.3 Transfer animal not owned by sender → 400
    def test_tp9_3_transfer_unowned_animal(self):
        other_livestock = make_livestock(self.receiver, 'TR-OTHER')
        response = self.client.post(self.url, {
            'livestock': other_livestock.id,
            'receiver': self.sender.id,
            'reason': 'Not mine',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-9.4 Duplicate pending transfer for same animal → 400
    def test_tp9_4_duplicate_pending_transfer(self):
        Transfer.objects.create(
            livestock=self.livestock, sender=self.sender,
            receiver=self.receiver, reason='First', status='Pending',
        )
        response = self.client.post(self.url, {
            'livestock': self.livestock.id,
            'receiver': self.receiver.id,
            'reason': 'Second',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-9.5 Receiver accepts transfer → status=Receiver Approved
    def test_tp9_5_receiver_accepts_transfer(self):
        transfer = Transfer.objects.create(
            livestock=self.livestock, sender=self.sender,
            receiver=self.receiver, reason='Accept me', status='Pending',
        )
        self._auth_receiver()
        response = self.client.post(f'{self.url}{transfer.id}/receiver_approve/', {
            'receiver_notes': 'I accept',
        }, format='json')
        self.assertIn(response.status_code, [200, 201])
        transfer.refresh_from_db()
        self.assertEqual(transfer.status, 'Receiver Approved')

    # TP-9.6 Receiver rejects transfer → status=Rejected
    def test_tp9_6_receiver_rejects_transfer(self):
        transfer = Transfer.objects.create(
            livestock=self.livestock, sender=self.sender,
            receiver=self.receiver, reason='Reject me', status='Pending',
        )
        self._auth_receiver()
        response = self.client.post(f'{self.url}{transfer.id}/receiver_reject/', {
            'receiver_notes': 'Not interested',
        }, format='json')
        self.assertIn(response.status_code, [200, 201])
        transfer.refresh_from_db()
        self.assertEqual(transfer.status, 'Rejected')

    # TP-9.7 Admin approves transfer → status='Admin Approved'
    def test_tp9_7_admin_approves_transfer(self):
        transfer = Transfer.objects.create(
            livestock=self.livestock, sender=self.sender,
            receiver=self.receiver, reason='Admin approve',
            status='Receiver Approved',
        )
        self._auth_admin()
        response = self.client.post(f'{self.url}{transfer.id}/admin_approve/', {
            'admin_notes': 'Approved',
        }, format='json')
        self.assertIn(response.status_code, [200, 201])
        transfer.refresh_from_db()
        self.assertEqual(transfer.status, 'Admin Approved')

    # TP-9.8 Transfer list accessible by sender
    def test_tp9_8_transfer_list(self):
        self._auth_sender()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    # TP-9.9 Transfer detail accessible
    def test_tp9_9_transfer_detail(self):
        transfer = Transfer.objects.create(
            livestock=self.livestock, sender=self.sender,
            receiver=self.receiver, reason='Detail check', status='Pending',
        )
        response = self.client.get(f'{self.url}{transfer.id}/')
        self.assertEqual(response.status_code, 200)

    # TP-9.10 Unauthenticated access to transfers → 401
    def test_tp9_10_unauthenticated_transfer(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)
