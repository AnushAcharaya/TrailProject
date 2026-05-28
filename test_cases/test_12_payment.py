"""
TP-12: Payment System Tests (eSewa Integration)
Tests use unittest.mock to simulate eSewa API calls — no real network needed.
"""
import uuid
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from payment.models import Payment

User = get_user_model()


def make_user(username, email, phone, role='farmer', password='TestPass123!'):
    """Create an approved and verified user."""
    user = User.objects.create_user(
        username=username, email=email, phone=phone,
        role=role, password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='TestPass123!'):
    """Obtain JWT access token for a user."""
    response = client.post('/api/v1/auth/login/', {
        'phone': user.phone,
        'password': password,
        'role': user.role,
    }, format='json')
    return response.data.get('access') or response.data.get('access_token')


def auth(client, user, password='TestPass123!'):
    """Set Authorization header on client."""
    token = get_token(client, user, password)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')


class PaymentTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Farmer user
        self.farmer = make_user('pay_farmer', 'pay_farmer@test.com', '9811111111')

        # Another farmer (for isolation tests)
        self.other_farmer = make_user('pay_other', 'pay_other@test.com', '9822222222')

        auth(self.client, self.farmer)

    # ------------------------------------------------------------------ #
    # TP-12.1: Initiate payment — success
    # ------------------------------------------------------------------ #
    def test_01_initiate_payment_success(self):
        """POST /initiate/ creates a Payment record and returns eSewa form data."""
        response = self.client.post('/api/v1/payment/payments/initiate/', {
            'amount': '1000.00',
            'product_code': 'INSURANCE_PREMIUM',
            'product_description': 'Test insurance premium',
            'tax_amount': '0',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertTrue(data['success'])
        self.assertIn('payment_id', data)
        self.assertIn('transaction_uuid', data)
        self.assertIn('payment_data', data)
        self.assertIn('esewa_url', data)

        # Payment record created in DB
        self.assertTrue(Payment.objects.filter(id=data['payment_id']).exists())
        payment = Payment.objects.get(id=data['payment_id'])
        self.assertEqual(payment.status, 'pending')
        self.assertEqual(payment.user, self.farmer)

    # ------------------------------------------------------------------ #
    # TP-12.2: Initiate payment — missing required fields
    # ------------------------------------------------------------------ #
    def test_02_initiate_payment_missing_fields(self):
        """POST /initiate/ without required fields returns 400."""
        response = self.client.post('/api/v1/payment/payments/initiate/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('errors', response.data)

    # ------------------------------------------------------------------ #
    # TP-12.3: Initiate payment — invalid amount (zero)
    # ------------------------------------------------------------------ #
    def test_03_initiate_payment_invalid_amount(self):
        """POST /initiate/ with amount=0 returns 400."""
        response = self.client.post('/api/v1/payment/payments/initiate/', {
            'amount': '0',
            'product_code': 'APPOINTMENT_FEE',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------ #
    # TP-12.4: Verify payment — eSewa returns COMPLETE (mock)
    # ------------------------------------------------------------------ #
    def test_04_verify_payment_success(self):
        """POST /verify/ with mocked eSewa COMPLETE marks payment as completed."""
        # Create a pending payment in DB
        payment = Payment.objects.create(
            user=self.farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='500.00',
            tax_amount='0',
            total_amount='500.00',
            product_code='APPOINTMENT_FEE',
            status='pending',
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'product_code': 'EPAYTEST',
            'transaction_uuid': payment.transaction_uuid,
            'total_amount': 500.0,
            'status': 'COMPLETE',
            'ref_id': 'MOCK_REF_001',
        }

        with patch('payment.views.requests.get', return_value=mock_response):
            response = self.client.post('/api/v1/payment/payments/verify/', {
                'transaction_uuid': payment.transaction_uuid,
                'ref_id': 'MOCK_REF_001',
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['status'], 'completed')

        payment.refresh_from_db()
        self.assertEqual(payment.status, 'completed')
        self.assertEqual(payment.esewa_ref_id, 'MOCK_REF_001')
        self.assertIsNotNone(payment.completed_at)

    # ------------------------------------------------------------------ #
    # TP-12.5: Verify payment — eSewa returns non-COMPLETE status
    # ------------------------------------------------------------------ #
    def test_05_verify_payment_esewa_failed(self):
        """POST /verify/ when eSewa returns PENDING marks payment as failed."""
        payment = Payment.objects.create(
            user=self.farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='200.00',
            tax_amount='0',
            total_amount='200.00',
            product_code='CONSULTATION_FEE',
            status='pending',
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'status': 'PENDING',
            'transaction_uuid': payment.transaction_uuid,
        }

        with patch('payment.views.requests.get', return_value=mock_response):
            response = self.client.post('/api/v1/payment/payments/verify/', {
                'transaction_uuid': payment.transaction_uuid,
                'ref_id': 'bad_ref',
            })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

        payment.refresh_from_db()
        self.assertEqual(payment.status, 'failed')

    # ------------------------------------------------------------------ #
    # TP-12.6: Verify payment — already completed (idempotent)
    # ------------------------------------------------------------------ #
    def test_06_verify_already_completed(self):
        """POST /verify/ on an already-completed payment returns success without re-calling eSewa."""
        payment = Payment.objects.create(
            user=self.farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='300.00',
            tax_amount='0',
            total_amount='300.00',
            product_code='INSURANCE_PREMIUM',
            status='completed',
            esewa_ref_id='EXISTING_REF',
        )

        # No mock needed — should short-circuit before calling eSewa
        response = self.client.post('/api/v1/payment/payments/verify/', {
            'transaction_uuid': payment.transaction_uuid,
            'ref_id': 'EXISTING_REF',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('already verified', response.data['message'].lower())

    # ------------------------------------------------------------------ #
    # TP-12.7: Verify payment — wrong user (ownership check)
    # ------------------------------------------------------------------ #
    def test_07_verify_payment_wrong_user(self):
        """POST /verify/ for another user's payment returns 403."""
        # Payment belongs to other_farmer
        payment = Payment.objects.create(
            user=self.other_farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='100.00',
            tax_amount='0',
            total_amount='100.00',
            product_code='APPOINTMENT_FEE',
            status='pending',
        )

        response = self.client.post('/api/v1/payment/payments/verify/', {
            'transaction_uuid': payment.transaction_uuid,
            'ref_id': 'some_ref',
        })

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------ #
    # TP-12.8: Payment history — only own payments returned
    # ------------------------------------------------------------------ #
    def test_08_payment_history(self):
        """GET /history/ returns only the authenticated user's payments."""
        # Create 2 payments for farmer, 1 for other_farmer
        Payment.objects.create(
            user=self.farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='100.00', tax_amount='0', total_amount='100.00',
            product_code='APPOINTMENT_FEE', status='completed',
        )
        Payment.objects.create(
            user=self.farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='200.00', tax_amount='0', total_amount='200.00',
            product_code='INSURANCE_PREMIUM', status='pending',
        )
        Payment.objects.create(
            user=self.other_farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='50.00', tax_amount='0', total_amount='50.00',
            product_code='OTHER', status='failed',
        )

        response = self.client.get('/api/v1/payment/payments/history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 2)
        returned_users = {p['user_name'] for p in response.data['payments']}
        self.assertEqual(returned_users, {'pay_farmer'})

    # ------------------------------------------------------------------ #
    # TP-12.9: Status check — returns correct payment status
    # ------------------------------------------------------------------ #
    def test_09_status_check(self):
        """GET /payments/{id}/status_check/ returns the payment status."""
        payment = Payment.objects.create(
            user=self.farmer,
            transaction_uuid=str(uuid.uuid4()),
            amount='750.00', tax_amount='0', total_amount='750.00',
            product_code='INSURANCE_PREMIUM', status='completed',
            esewa_ref_id='REF_STATUS_TEST',
        )

        response = self.client.get(f'/api/v1/payment/payments/{payment.id}/status_check/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['payment_id'], payment.id)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(str(response.data['transaction_uuid']), payment.transaction_uuid)

    # ------------------------------------------------------------------ #
    # TP-12.10: Unauthenticated access is denied
    # ------------------------------------------------------------------ #
    def test_10_unauthenticated_denied(self):
        """All payment endpoints require authentication."""
        unauthenticated_client = APIClient()

        r1 = unauthenticated_client.post('/api/v1/payment/payments/initiate/', {
            'amount': '100', 'product_code': 'OTHER',
        })
        self.assertEqual(r1.status_code, status.HTTP_401_UNAUTHORIZED)

        r2 = unauthenticated_client.get('/api/v1/payment/payments/history/')
        self.assertEqual(r2.status_code, status.HTTP_401_UNAUTHORIZED)

        r3 = unauthenticated_client.get('/api/v1/payment/payments/')
        self.assertEqual(r3.status_code, status.HTTP_401_UNAUTHORIZED)
