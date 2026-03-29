"""
Authentication API Tests
Test Module: Authentication API/Views Testing
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from authentication.models import EmailVerificationToken, PhoneOTP, PasswordResetToken, LoginOTP
from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class RegisterAPITests(TestCase):
    """Test cases for Register API endpoint"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.url = '/api/v1/auth/register/'
        
        # Create test image
        self.test_image = SimpleUploadedFile(
            name='test.jpg',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01\x44\x00\x3b',
            content_type='image/jpeg'
        )
        
        self.farmer_data = {
            'username': 'testfarmer',
            'email': 'farmer@test.com',
            'full_name': 'Test Farmer',
            'address': '123 Farm Road',
            'password': 'StrongPass123!',
            'role': 'farmer',
            'phone': '+1234567890',
            'farm_name': 'Test Farm',
            'nid_photo': self.test_image,
        }
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_successful_farmer_registration(self, mock_sms, mock_email):
        """Test successful farmer registration"""
        response = self.client.post(self.url, self.farmer_data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('registered', response.data['message'].lower())
        
        # Verify user created
        self.assertTrue(User.objects.filter(email='farmer@test.com').exists())
    
    def test_registration_missing_required_field(self):
        """Test registration with missing required field"""
        data = self.farmer_data.copy()
        del data['email']
        
        response = self.client.post(self.url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        # Create first user
        User.objects.create_user(
            username='existing',
            email='farmer@test.com',
            password='pass123',
            full_name='Existing',
            address='Address',
            phone='+9999999999',
            role='farmer',
            farm_name='Existing Farm'
        )
        
        response = self.client.post(self.url, self.farmer_data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])


class LoginAPITests(TestCase):
    """Test cases for Login API endpoint"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.url = '/api/v1/auth/login/'
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm',
            status='approved',
            is_email_verified=True
        )
    
    def test_successful_login(self):
        """Test successful login with valid credentials"""
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        data = {
            'phone': '+1234567890',
            'password': 'wrongpassword',
            'role': 'farmer'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_wrong_role(self):
        """Test login with wrong role"""
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'vet'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_pending_user(self):
        """Test login with pending approval status"""
        self.user.status = 'pending'
        self.user.save()
        
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class EmailVerificationAPITests(TestCase):
    """Test cases for Email Verification API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.verify_url = '/api/v1/auth/verify-email/'
        self.resend_url = '/api/v1/auth/resend-verification/'
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm'
        )
    
    def test_successful_email_verification(self):
        """Test successful email verification"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        data = {
            'email': 'test@test.com',
            'code': token.code
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify user email verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)
    
    def test_email_verification_invalid_code(self):
        """Test email verification with invalid code"""
        data = {
            'email': 'test@test.com',
            'code': '999999'
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_email_verification_expired_code(self):
        """Test email verification with expired code"""
        token = EmailVerificationToken.objects.create(user=self.user)
        token.created_at = timezone.now() - timedelta(minutes=11)
        token.save()
        
        data = {
            'email': 'test@test.com',
            'code': token.code
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data['message'].lower())
    
    @patch('authentication.views.send_email_sync')
    def test_resend_verification_email(self, mock_send):
        """Test resending verification email"""
        data = {'email': 'test@test.com'}
        
        response = self.client.post(self.resend_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(mock_send.called)




class PhoneVerificationAPITests(TestCase):
    """Test cases for Phone Verification API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.send_url = '/api/v1/auth/phone/send-otp/'
        self.verify_url = '/api/v1/auth/phone/verify-otp/'
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm'
        )
    
    def test_send_phone_otp_success(self):
        """Test sending phone OTP successfully"""
        data = {'phone': '+1234567890'}
        
        response = self.client.post(self.send_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('otp', response.data)  # Dev mode returns OTP
    
    def test_send_phone_otp_nonexistent_user(self):
        """Test sending OTP to non-existent phone"""
        data = {'phone': '+9999999999'}
        
        response = self.client.post(self.send_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])
    
    @patch.dict('os.environ', {'SMS_DEV_MODE': 'True'})
    def test_verify_phone_otp_success(self):
        """Test verifying phone OTP successfully"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        data = {
            'phone': '+1234567890',
            'code': otp.code
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify user phone verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_phone_verified)
    
    @patch.dict('os.environ', {'SMS_DEV_MODE': 'True'})
    def test_verify_phone_otp_invalid_code(self):
        """Test verifying phone with invalid OTP"""
        data = {
            'phone': '+1234567890',
            'code': '999999'
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])


class PasswordResetAPITests(TestCase):
    """Test cases for Password Reset API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.forgot_url = '/api/v1/auth/forgot-password/'
        self.verify_token_url = '/api/v1/auth/verify-token/'
        self.reset_url = '/api/v1/auth/reset-password/'
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='oldpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm'
        )
    
    @patch('authentication.views.send_email_sync')
    def test_forgot_password_success(self, mock_send):
        """Test forgot password request"""
        data = {'email': 'test@test.com'}
        
        response = self.client.post(self.forgot_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(mock_send.called)
        
        # Verify token created
        self.assertTrue(PasswordResetToken.objects.filter(user=self.user).exists())
    
    def test_forgot_password_nonexistent_email(self):
        """Test forgot password with non-existent email"""
        data = {'email': 'nonexistent@test.com'}
        
        response = self.client.post(self.forgot_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_verify_token_valid(self):
        """Test verifying valid reset token"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        data = {
            'email': 'test@test.com',
            'token': token.token
        }
        
        response = self.client.post(self.verify_token_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_verify_token_invalid(self):
        """Test verifying invalid reset token"""
        data = {
            'email': 'test@test.com',
            'token': '999999'
        }
        
        response = self.client.post(self.verify_token_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_reset_password_success(self):
        """Test successful password reset"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        data = {
            'email': 'test@test.com',
            'token': token.token,
            'new_password': 'NewStrongPass123!',
            'confirm_password': 'NewStrongPass123!'
        }
        
        response = self.client.post(self.reset_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewStrongPass123!'))
        
        # Verify token marked as used
        token.refresh_from_db()
        self.assertTrue(token.used)


class AdminAPITests(TestCase):
    """Test cases for Admin API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.list_url = '/api/v1/auth/admin/users/'
        
        # Create admin user
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
            full_name='Admin User',
            address='Admin Address',
            phone='+1111111111',
            role='admin',
            is_email_verified=True
        )
        
        # Create regular user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm'
        )
    
    def test_admin_list_users_success(self):
        """Test admin can list users"""
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('users', response.data)
    
    def test_admin_list_users_non_admin(self):
        """Test non-admin cannot list users"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_list_users_unauthenticated(self):
        """Test unauthenticated user cannot list users"""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_approve_user_success(self):
        """Test admin can approve user"""
        self.client.force_authenticate(user=self.admin)
        approve_url = f'/api/v1/auth/admin/users/{self.user.id}/approve/'
        
        response = self.client.post(approve_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify user approved
        self.user.refresh_from_db()
        self.assertEqual(self.user.status, 'approved')
        self.assertTrue(self.user.is_active)
    
    def test_decline_user_success(self):
        """Test admin can decline user"""
        self.client.force_authenticate(user=self.admin)
        decline_url = f'/api/v1/auth/admin/users/{self.user.id}/decline/'
        
        response = self.client.post(decline_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify user declined
        self.user.refresh_from_db()
        self.assertEqual(self.user.status, 'declined')
        self.assertFalse(self.user.is_active)


class LoginOTPAPITests(TestCase):
    """Test cases for Login OTP API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.send_url = '/api/v1/auth/login/send-otp/'
        self.verify_url = '/api/v1/auth/login/verify-otp/'
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm',
            status='approved',
            is_email_verified=True
        )
    
    @patch('authentication.views.send_email_sync')
    def test_send_login_otp_success(self, mock_send):
        """Test sending login OTP successfully"""
        data = {
            'email': 'test@test.com',
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        response = self.client.post(self.send_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(mock_send.called)
        
        # Verify LoginOTP created
        self.assertTrue(LoginOTP.objects.filter(user=self.user).exists())
    
    def test_send_login_otp_wrong_password(self):
        """Test sending login OTP with wrong password"""
        data = {
            'email': 'test@test.com',
            'phone': '+1234567890',
            'password': 'wrongpassword',
            'role': 'farmer'
        }
        
        response = self.client.post(self.send_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_verify_login_otp_success(self):
        """Test verifying login OTP successfully"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        data = {
            'email': 'test@test.com',
            'email_code': login_otp.email_code,
            'role': 'farmer'
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_verify_login_otp_invalid_code(self):
        """Test verifying login OTP with invalid code"""
        LoginOTP.objects.create(user=self.user)
        
        data = {
            'email': 'test@test.com',
            'email_code': '999999',
            'role': 'farmer'
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_verify_login_otp_expired(self):
        """Test verifying expired login OTP"""
        login_otp = LoginOTP.objects.create(user=self.user)
        login_otp.created_at = timezone.now() - timedelta(minutes=11)
        login_otp.save()
        
        data = {
            'email': 'test@test.com',
            'email_code': login_otp.email_code,
            'role': 'farmer'
        }
        
        response = self.client.post(self.verify_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data['error'].lower())
