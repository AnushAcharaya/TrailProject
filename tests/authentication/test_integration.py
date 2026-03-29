"""
Authentication Integration Tests
Test Module: Integration Testing for Complete Authentication Workflows
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


class RegistrationFlowIntegrationTests(TestCase):
    """Integration tests for complete user registration flow (INT-REG-001 to INT-REG-005)"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.verify_email_url = '/api/v1/auth/verify-email/'
        self.verify_phone_url = '/api/v1/auth/phone/verify-otp/'
        
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
    @patch.dict('os.environ', {'SMS_DEV_MODE': 'True'})
    def test_complete_farmer_registration_and_verification_flow(self, mock_sms, mock_email):
        """
        INT-REG-001: Complete registration flow
        Farmer registers → Email sent → Email verified → Phone OTP sent → Phone verified
        """
        # Step 1: Register farmer
        response = self.client.post(self.register_url, self.farmer_data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        # Verify user created in database
        user = User.objects.get(email='farmer@test.com')
        self.assertEqual(user.username, 'testfarmer')
        self.assertEqual(user.role, 'farmer')
        self.assertFalse(user.is_email_verified)
        self.assertFalse(user.is_phone_verified)
        
        # Verify email token created
        email_token = EmailVerificationToken.objects.filter(user=user, used=False).first()
        self.assertIsNotNone(email_token)
        
        # Verify phone OTP created
        phone_otp = PhoneOTP.objects.filter(user=user, used=False).first()
        self.assertIsNotNone(phone_otp)
        
        # Step 2: Verify email
        email_verify_data = {
            'email': 'farmer@test.com',
            'code': email_token.code
        }
        response = self.client.post(self.verify_email_url, email_verify_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify email verified flag updated
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        
        # Step 3: Verify phone
        phone_verify_data = {
            'phone': '+1234567890',
            'code': phone_otp.code
        }
        response = self.client.post(self.verify_phone_url, phone_verify_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify phone verified flag updated
        user.refresh_from_db()
        self.assertTrue(user.is_phone_verified)
        
        # Verify both verification flags are now True
        self.assertTrue(user.is_email_verified)
        self.assertTrue(user.is_phone_verified)


    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_registration_with_duplicate_email_prevents_creation(self, mock_sms, mock_email):
        """
        INT-REG-004: Duplicate email prevention
        User registers with duplicate email → Registration fails → Database unchanged
        """
        # Step 1: Create first user
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
        
        initial_user_count = User.objects.count()
        
        # Step 2: Try to register with same email
        response = self.client.post(self.register_url, self.farmer_data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        
        # Verify no new user created
        self.assertEqual(User.objects.count(), initial_user_count)
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_email_verification_expiration_and_resend(self, mock_sms, mock_email):
        """
        INT-REG-003: Email verification expiration
        User registers → Email verification expires → Resend verification → Verify successfully
        """
        # Step 1: Register user
        response = self.client.post(self.register_url, self.farmer_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(email='farmer@test.com')
        
        # Step 2: Expire the email token
        old_token = EmailVerificationToken.objects.filter(user=user).first()
        old_token.created_at = timezone.now() - timedelta(minutes=11)
        old_token.save()
        
        # Step 3: Try to verify with expired token
        verify_data = {
            'email': 'farmer@test.com',
            'code': old_token.code
        }
        response = self.client.post(self.verify_email_url, verify_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data['message'].lower())
        
        # Step 4: Resend verification
        resend_url = '/api/v1/auth/resend-verification/'
        with patch('authentication.views.send_email_sync'):
            response = self.client.post(resend_url, {'email': 'farmer@test.com'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 5: Get new token and verify
        new_token = EmailVerificationToken.objects.filter(user=user, used=False).order_by('-created_at').first()
        self.assertIsNotNone(new_token)
        self.assertNotEqual(old_token.code, new_token.code)
        
        verify_data = {
            'email': 'farmer@test.com',
            'code': new_token.code
        }
        response = self.client.post(self.verify_email_url, verify_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify email verified
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)


class LoginFlowIntegrationTests(TestCase):
    """Integration tests for complete login flow (INT-LOGIN-001 to INT-LOGIN-006)"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.verify_email_url = '/api/v1/auth/verify-email/'
        self.verify_phone_url = '/api/v1/auth/phone/verify-otp/'
        
        self.test_image = SimpleUploadedFile(
            name='test.jpg',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01\x44\x00\x3b',
            content_type='image/jpeg'
        )
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    @patch.dict('os.environ', {'SMS_DEV_MODE': 'True'})
    def test_complete_registration_to_login_flow(self, mock_sms, mock_email):
        """
        INT-LOGIN-001: Complete flow from registration to login
        User registers → Verifies email/phone → Admin approves → User logs in successfully
        """
        # Step 1: Register user
        farmer_data = {
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
        
        response = self.client.post(self.register_url, farmer_data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(email='farmer@test.com')
        
        # Step 2: Verify email
        email_token = EmailVerificationToken.objects.filter(user=user).first()
        response = self.client.post(self.verify_email_url, {
            'email': 'farmer@test.com',
            'code': email_token.code
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify email flag is set
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        
        # Step 3: Verify phone
        phone_otp = PhoneOTP.objects.filter(user=user).first()
        response = self.client.post(self.verify_phone_url, {
            'phone': '+1234567890',
            'code': phone_otp.code
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify phone flag is set
        user.refresh_from_db()
        self.assertTrue(user.is_phone_verified)
        
        # Step 4: Admin approves user
        user.status = 'approved'
        user.is_active = True
        user.save()
        
        # Step 5: User logs in
        login_data = {
            'phone': '+1234567890',
            'password': 'StrongPass123!',
            'role': 'farmer'
        }
        response = self.client.post(self.login_url, login_data)
        
        # Check if login succeeded or if there's an error
        if response.status_code != status.HTTP_200_OK:
            print(f"Login failed: {response.data}")
            print(f"User status: email_verified={user.is_email_verified}, phone_verified={user.is_phone_verified}, status={user.status}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)


    def test_login_fails_before_email_verification(self):
        """
        INT-LOGIN-002: Login validation before email verification
        User tries to login before email verification → Login fails → Verify email → Login succeeds
        """
        # Step 1: Create user without email verification
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm',
            status='approved',
            is_email_verified=False,  # Not verified
            is_phone_verified=False  # Also not verified
        )
        
        # Step 2: Try to login (should fail)
        login_data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not verified', str(response.data).lower())
        
        # Step 3: Verify both email and phone
        user.is_email_verified = True
        user.is_phone_verified = True
        user.save()
        
        # Step 4: Try to login again (should succeed)
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_login_fails_before_admin_approval(self):
        """
        INT-LOGIN-003: Login validation before admin approval
        User tries to login before admin approval → Login fails → Admin approves → Login succeeds
        """
        # Step 1: Create user with pending status
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm',
            status='pending',  # Not approved
            is_email_verified=True,
            is_phone_verified=True
        )
        
        # Step 2: Try to login (should fail)
        login_data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pending', str(response.data).lower())
        
        # Step 3: Admin approves
        user.status = 'approved'
        user.is_active = True
        user.save()
        
        # Step 4: Try to login again (should succeed)
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_admin_can_login_without_approval(self):
        """
        INT-LOGIN-006: Admin bypass for approval
        Admin logs in without approval → Login succeeds (admin bypass)
        """
        # Step 1: Create admin user with pending status
        admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
            full_name='Admin User',
            address='Admin Address',
            phone='+1111111111',
            role='admin',
            status='pending',  # Pending but should still work for admin
            is_email_verified=True
        )
        
        # Step 2: Admin logs in (should succeed despite pending status)
        login_data = {
            'phone': '+1111111111',
            'password': 'adminpass123',
            'role': 'admin'
        }
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)



class PasswordResetFlowIntegrationTests(TestCase):
    """Integration tests for password reset flow (INT-RESET-001 to INT-RESET-004)"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.forgot_url = '/api/v1/auth/forgot-password/'
        self.verify_token_url = '/api/v1/auth/verify-token/'
        self.reset_url = '/api/v1/auth/reset-password/'
        self.login_url = '/api/v1/auth/login/'
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='oldpass123',
            full_name='Test User',
            address='Test Address',
            phone='+1234567890',
            role='farmer',
            farm_name='Test Farm',
            status='approved',
            is_email_verified=True
        )
    
    @patch('authentication.views.send_email_sync')
    def test_complete_password_reset_flow(self, mock_send):
        """
        INT-RESET-001: Complete password reset flow
        User forgets password → Requests reset → Email sent → Verifies token → Resets password → Logs in with new password
        """
        # Step 1: Request password reset
        response = self.client.post(self.forgot_url, {'email': 'test@test.com'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(mock_send.called)
        
        # Verify token created
        token = PasswordResetToken.objects.filter(user=self.user).first()
        self.assertIsNotNone(token)
        self.assertFalse(token.used)
        
        # Step 2: Verify token
        verify_data = {
            'email': 'test@test.com',
            'token': token.token
        }
        response = self.client.post(self.verify_token_url, verify_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 3: Reset password
        reset_data = {
            'email': 'test@test.com',
            'token': token.token,
            'new_password': 'NewStrongPass123!',
            'confirm_password': 'NewStrongPass123!'
        }
        response = self.client.post(self.reset_url, reset_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify token marked as used
        token.refresh_from_db()
        self.assertTrue(token.used)
        
        # Step 4: Try to login with old password (should fail)
        login_data = {
            'phone': '+1234567890',
            'password': 'oldpass123',
            'role': 'farmer'
        }
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Step 5: Login with new password (should succeed)
        login_data['password'] = 'NewStrongPass123!'
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    @patch('authentication.views.send_email_sync')
    def test_password_reset_token_can_only_be_used_once(self, mock_send):
        """
        INT-RESET-003: Token single use validation
        User requests reset → Tries to use token twice → Second attempt fails
        """
        # Step 1: Request password reset
        response = self.client.post(self.forgot_url, {'email': 'test@test.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        token = PasswordResetToken.objects.filter(user=self.user).first()
        
        # Step 2: Reset password (first time)
        reset_data = {
            'email': 'test@test.com',
            'token': token.token,
            'new_password': 'NewPass123!',
            'confirm_password': 'NewPass123!'
        }
        response = self.client.post(self.reset_url, reset_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh token to get updated state
        token.refresh_from_db()
        self.assertTrue(token.used)
        
        # Step 3: Try to use same token again (should fail)
        reset_data['new_password'] = 'AnotherPass123!'
        reset_data['confirm_password'] = 'AnotherPass123!'
        response = self.client.post(self.reset_url, reset_data)
        
        # Should fail with 400 or 404
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])
    
    @patch('authentication.views.send_email_sync')
    def test_password_reset_token_expiration(self, mock_send):
        """
        INT-RESET-002: Token expiration handling
        User requests reset → Token expires → Requests new reset → Verifies new token → Resets password
        """
        # Step 1: Request password reset
        response = self.client.post(self.forgot_url, {'email': 'test@test.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        old_token = PasswordResetToken.objects.filter(user=self.user).first()
        
        # Step 2: Expire the token
        old_token.created_at = timezone.now() - timedelta(minutes=31)
        old_token.save()
        
        # Step 3: Try to reset with expired token (should fail)
        reset_data = {
            'email': 'test@test.com',
            'token': old_token.token,
            'new_password': 'NewPass123!',
            'confirm_password': 'NewPass123!'
        }
        response = self.client.post(self.reset_url, reset_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Step 4: Request new reset
        response = self.client.post(self.forgot_url, {'email': 'test@test.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 5: Get new token and reset password
        new_token = PasswordResetToken.objects.filter(user=self.user, used=False).order_by('-created_at').first()
        self.assertIsNotNone(new_token)
        
        reset_data['token'] = new_token.token
        response = self.client.post(self.reset_url, reset_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)



class AdminWorkflowIntegrationTests(TestCase):
    """Integration tests for admin approval workflow (INT-ADMIN-001 to INT-ADMIN-004)"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.list_url = '/api/v1/auth/admin/users/'
        self.login_url = '/api/v1/auth/login/'
        
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
        
        # Create pending farmer
        self.farmer = User.objects.create_user(
            username='farmer',
            email='farmer@test.com',
            password='farmerpass123',
            full_name='Test Farmer',
            address='Farmer Address',
            phone='+2222222222',
            role='farmer',
            farm_name='Test Farm',
            status='pending',
            is_email_verified=True,
            is_phone_verified=True
        )
    
    def test_admin_approval_workflow(self):
        """
        INT-ADMIN-001: Complete admin approval workflow
        Farmer registers → Admin lists pending users → Admin approves farmer → Farmer can login
        """
        # Step 1: Admin authenticates
        self.client.force_authenticate(user=self.admin)
        
        # Step 2: Admin lists users
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('users', response.data)
        
        # Step 3: Verify farmer is in pending status
        self.assertEqual(self.farmer.status, 'pending')
        
        # Step 4: Farmer tries to login (should fail)
        self.client.force_authenticate(user=None)  # Logout admin
        login_data = {
            'phone': '+2222222222',
            'password': 'farmerpass123',
            'role': 'farmer'
        }
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Step 5: Admin approves farmer
        self.client.force_authenticate(user=self.admin)
        approve_url = f'/api/v1/auth/admin/users/{self.farmer.id}/approve/'
        response = self.client.post(approve_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify farmer status changed
        self.farmer.refresh_from_db()
        self.assertEqual(self.farmer.status, 'approved')
        self.assertTrue(self.farmer.is_active)
        
        # Step 6: Farmer tries to login again (should succeed)
        self.client.force_authenticate(user=None)
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_admin_decline_and_reapprove_workflow(self):
        """
        INT-ADMIN-002: Admin decline and re-approve workflow
        Vet registers → Admin declines vet → Vet cannot login → Admin re-approves → Vet can login
        """
        # Create vet
        vet = User.objects.create_user(
            username='vet',
            email='vet@test.com',
            password='vetpass123',
            full_name='Test Vet',
            address='Vet Address',
            phone='+3333333333',
            role='vet',
            specialization='Large Animals',
            status='pending',
            is_email_verified=True,
            is_phone_verified=True
        )
        
        # Step 1: Admin declines vet
        self.client.force_authenticate(user=self.admin)
        decline_url = f'/api/v1/auth/admin/users/{vet.id}/decline/'
        response = self.client.post(decline_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify vet status changed
        vet.refresh_from_db()
        self.assertEqual(vet.status, 'declined')
        self.assertFalse(vet.is_active)
        
        # Step 2: Vet tries to login (should fail)
        self.client.force_authenticate(user=None)
        login_data = {
            'phone': '+3333333333',
            'password': 'vetpass123',
            'role': 'vet'
        }
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Step 3: Admin re-approves vet
        self.client.force_authenticate(user=self.admin)
        approve_url = f'/api/v1/auth/admin/users/{vet.id}/approve/'
        response = self.client.post(approve_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify vet status changed
        vet.refresh_from_db()
        self.assertEqual(vet.status, 'approved')
        self.assertTrue(vet.is_active)
        
        # Step 4: Vet tries to login (should succeed)
        self.client.force_authenticate(user=None)
        response = self.client.post(self.login_url, login_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_non_admin_cannot_access_admin_endpoints(self):
        """
        INT-ADMIN-004: Permission checking
        Non-admin user tries to access admin endpoints → Access denied
        """
        # Step 1: Farmer tries to access admin endpoint
        self.client.force_authenticate(user=self.farmer)
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Step 2: Unauthenticated user tries to access admin endpoint
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
