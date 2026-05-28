"""
Test Plan: Authentication System
Test IDs : TP-1.1 to TP-1.10
API Prefix: /api/v1/auth/
"""

import io
from django.test import TestCase, override_settings
from django.utils import timezone
from unittest.mock import patch
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from authentication.models import (
    CustomUser, EmailVerificationToken, PhoneOTP, PasswordResetToken
)


def make_nid_image(name='nid.jpg'):
    buf = io.BytesIO()
    Image.new('RGB', (100, 100), color='red').save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type='image/jpeg')


def make_user(username='farmer1', email='farmer1@gmail.com',
              phone='9800000001', role='farmer', status='approved',
              email_verified=True, phone_verified=True, password='Test@1234'):
    """Helper: create and return a fully verified, approved CustomUser."""
    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        phone=phone,
        full_name='Test Farmer',
        address='Kathmandu',
        role=role,
        password=password,
    )
    user.status = status
    user.is_email_verified = email_verified
    user.is_phone_verified = phone_verified
    user.save()
    return user


def get_token(client, phone, role, password='Test@1234'):
    """Login via phone+password+role and return JWT access token."""
    resp = client.post('/api/v1/auth/login/', {
        'phone': phone, 'password': password, 'role': role
    }, format='json')
    return resp.data.get('access')


class TP1_RegisterTests(TestCase):
    """TP-1.1 & TP-1.2 — Registration"""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/auth/register/'

    def _valid_payload(self, suffix='01', phone='9800000101'):
        return {
            'username': f'user{suffix}',
            'full_name': f'User {suffix}',
            'email': f'validuser{suffix}@gmail.com',
            'phone': phone,
            'address': 'Kathmandu',
            'role': 'farmer',
            'password': 'Test@1234',
            'farm_name': f'Farm {suffix}',
            'nid_photo': make_nid_image(f'nid{suffix}.jpg'),
        }

    # TP-1.1 Register with valid data
    def test_tp1_1_register_valid_data(self):
        response = self.client.post(self.url, self._valid_payload(), format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data.get('success'))
        self.assertTrue(CustomUser.objects.filter(email='validuser01@gmail.com').exists())

    # TP-1.2 Register with duplicate email
    def test_tp1_2_register_duplicate_email(self):
        make_user(email='validuser02@gmail.com', username='existing', phone='9800000090')
        payload = self._valid_payload('02', phone='9800000091')
        payload['username'] = 'newuser'
        response = self.client.post(self.url, payload, format='multipart')
        self.assertEqual(response.status_code, 400)


class TP1_EmailOTPTests(TestCase):
    """TP-1.3 & TP-1.4 — Email OTP verification"""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/auth/verify-email/'
        self.user = make_user(email_verified=False)

    # TP-1.3 Correct OTP within 10 minutes
    def test_tp1_3_email_otp_correct(self):
        token = EmailVerificationToken.objects.create(user=self.user)
        response = self.client.post(self.url, {'email': self.user.email, 'code': token.code}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)

    # TP-1.4 OTP expired (more than 10 minutes old)
    def test_tp1_4_email_otp_expired(self):
        token = EmailVerificationToken.objects.create(user=self.user)
        # Manually backdate the token's created_at by 11 minutes
        EmailVerificationToken.objects.filter(pk=token.pk).update(
            created_at=timezone.now() - timezone.timedelta(minutes=11)
        )
        token.refresh_from_db()
        response = self.client.post(self.url, {'email': self.user.email, 'code': token.code}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('expired', str(response.data).lower())


class TP1_PhoneOTPTests(TestCase):
    """TP-1.5 — Phone OTP verification"""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(phone_verified=False)

    # TP-1.5 Phone OTP verification with correct code
    @patch.dict('os.environ', {'SMS_DEV_MODE': 'True'})
    def test_tp1_5_phone_otp_correct(self):
        otp = PhoneOTP.objects.create(user=self.user, code='123456')
        response = self.client.post(
            '/api/v1/auth/phone/verify-otp/',
            {'phone': self.user.phone, 'code': '123456'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_phone_verified)


class TP1_AdminApprovalTests(TestCase):
    """TP-1.6 — Admin approves user"""

    def setUp(self):
        self.client = APIClient()
        self.admin = make_user(username='admin1', email='admin1@gmail.com',
                               phone='9800000010', role='admin')
        self.pending_user = make_user(username='pending1', email='pending1@gmail.com',
                                      phone='9800000011', status='pending')
        # Login admin using phone + role
        token = get_token(self.client, self.admin.phone, 'admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # TP-1.6 Admin approves pending user
    @patch('authentication.views._send_account_status_email')
    def test_tp1_6_admin_approves_user(self, mock_email):
        url = f'/api/v1/auth/admin/users/{self.pending_user.id}/approve/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.pending_user.refresh_from_db()
        self.assertEqual(self.pending_user.status, 'approved')


class TP1_LoginTests(TestCase):
    """TP-1.7 & TP-1.8 — Login"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/v1/auth/login/'

    # TP-1.7 Login returns JWT tokens for approved user (phone + role)
    def test_tp1_7_login_approved_user_returns_tokens(self):
        make_user(username='farmer_login', email='farmerlogin@gmail.com', phone='9800000020')
        response = self.client.post(self.login_url, {
            'phone': '9800000020', 'password': 'Test@1234', 'role': 'farmer'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    # TP-1.8 Login fails for unapproved account
    def test_tp1_8_login_unapproved_account(self):
        make_user(username='pending_farmer', email='pending@gmail.com',
                  phone='9800000021', status='pending')
        response = self.client.post(self.login_url, {
            'phone': '9800000021', 'password': 'Test@1234', 'role': 'farmer'
        }, format='json')
        self.assertNotEqual(response.status_code, 200)


class TP1_PasswordResetTests(TestCase):
    """TP-1.9 — Password reset flow"""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='reset_user', email='resetuser@gmail.com', phone='9800000030')

    # TP-1.9 Full password reset flow
    @patch('authentication.views.send_password_reset_email', return_value=None)
    def test_tp1_9_password_reset_flow(self, mock_email):
        # Step 1: Request reset
        resp1 = self.client.post('/api/v1/auth/forgot-password/', {'email': self.user.email}, format='json')
        self.assertEqual(resp1.status_code, 200)

        # Step 2: Verify token
        token_obj = PasswordResetToken.objects.filter(user=self.user, used=False).latest('created_at')
        resp2 = self.client.post('/api/v1/auth/verify-token/', {
            'email': self.user.email, 'token': token_obj.token
        }, format='json')
        self.assertEqual(resp2.status_code, 200)

        # Step 3: Reset password
        resp3 = self.client.post('/api/v1/auth/reset-password/', {
            'email': self.user.email,
            'token': token_obj.token,
            'new_password': 'NewPass@5678',
            'confirm_password': 'NewPass@5678',
        }, format='json')
        self.assertEqual(resp3.status_code, 200)

        # Verify token is marked used
        token_obj.refresh_from_db()
        self.assertTrue(token_obj.used)


class TP1_GoogleOAuthTests(TestCase):
    """TP-1.10 — Google OAuth new user redirected to complete profile"""

    def setUp(self):
        self.client = APIClient()

    # TP-1.10 Google OAuth new user → JWT tokens returned
    @override_settings(SOCIAL_AUTH_GOOGLE_OAUTH2_KEY='fake-test-client-id')
    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_tp1_10_google_oauth_new_user(self, mock_verify):
        mock_verify.return_value = {
            'email': 'newgoogleuser@gmail.com',
            'name': 'Google User',
            'given_name': 'Google',
            'family_name': 'User',
            'sub': 'google-uid-999',
            'aud': 'fake-test-client-id',
            'iss': 'accounts.google.com',
            'email_verified': True,
        }
        response = self.client.post('/api/v1/auth/google/', {
            'id_token': 'fake-google-token',
        }, format='json')
        # New user should be created and JWT tokens returned (200 or 201)
        self.assertIn(response.status_code, [200, 201])
