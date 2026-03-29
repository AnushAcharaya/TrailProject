"""
Test ID: UR-M-001 to UR-M-010, EV-M-001 to EV-M-007, PV-M-001 to PV-M-007, 
         LO-M-001 to LO-M-007, PR-M-001 to PR-M-008
Test Module: Authentication Models Testing
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import timedelta
from authentication.models import (
    CustomUser, EmailVerificationToken, PhoneOTP, 
    PasswordResetToken, LoginOTP
)

User = get_user_model()


class CustomUserModelTests(TestCase):
    """Test cases for CustomUser model (UR-M-001 to UR-M-010)"""
    
    def setUp(self):
        """Set up test data"""
        self.farmer_data = {
            'username': 'farmer1',
            'email': 'farmer1@test.com',
            'full_name': 'Test Farmer',
            'address': '123 Farm Road',
            'phone': '+1234567890',
            'role': 'farmer',
            'farm_name': 'Test Farm',
        }
        
        self.vet_data = {
            'username': 'vet1',
            'email': 'vet1@test.com',
            'full_name': 'Test Vet',
            'address': '456 Vet Street',
            'phone': '+0987654321',
            'role': 'vet',
            'specialization': 'Large Animals',
        }
    
    def test_create_farmer_user(self):
        """UR-M-001: Create a user with role='farmer'"""
        user = User.objects.create_user(password='testpass123', **self.farmer_data)
        
        self.assertEqual(user.username, 'farmer1')
        self.assertEqual(user.email, 'farmer1@test.com')
        self.assertEqual(user.role, 'farmer')
        self.assertEqual(user.status, 'pending')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_email_verified)
        self.assertFalse(user.is_phone_verified)
    
    def test_create_vet_user(self):
        """UR-M-002: Create a user with role='vet'"""
        user = User.objects.create_user(password='testpass123', **self.vet_data)
        
        self.assertEqual(user.username, 'vet1')
        self.assertEqual(user.email, 'vet1@test.com')
        self.assertEqual(user.role, 'vet')
        self.assertEqual(user.status, 'pending')
        self.assertTrue(user.is_active)
    
    def test_create_admin_user(self):
        """UR-M-003: Create a user with role='admin'"""
        admin_data = {
            'username': 'admin1',
            'email': 'admin@test.com',
            'full_name': 'Test Admin',
            'address': '789 Admin Ave',
            'phone': '+1122334455',
            'role': 'admin',
        }
        user = User.objects.create_user(password='adminpass123', **admin_data)
        
        self.assertEqual(user.role, 'admin')
        self.assertEqual(user.status, 'pending')
    
    def test_unique_email_constraint(self):
        """UR-M-004: Attempt to create two users with same email"""
        User.objects.create_user(password='testpass123', **self.farmer_data)
        
        duplicate_data = self.farmer_data.copy()
        duplicate_data['username'] = 'farmer2'
        duplicate_data['phone'] = '+9999999999'
        
        with self.assertRaises(IntegrityError):
            User.objects.create_user(password='testpass123', **duplicate_data)
    
    def test_unique_phone_constraint(self):
        """UR-M-005: Attempt to create two users with same phone"""
        User.objects.create_user(password='testpass123', **self.farmer_data)
        
        duplicate_data = self.farmer_data.copy()
        duplicate_data['username'] = 'farmer2'
        duplicate_data['email'] = 'farmer2@test.com'
        duplicate_data['farm_name'] = 'Another Farm'
        
        with self.assertRaises(IntegrityError):
            User.objects.create_user(password='testpass123', **duplicate_data)
    
    def test_unique_farm_name_constraint(self):
        """UR-M-006: Attempt to create two farmers with same farm_name"""
        User.objects.create_user(password='testpass123', **self.farmer_data)
        
        duplicate_data = self.farmer_data.copy()
        duplicate_data['username'] = 'farmer2'
        duplicate_data['email'] = 'farmer2@test.com'
        duplicate_data['phone'] = '+9999999999'
        
        with self.assertRaises(IntegrityError):
            User.objects.create_user(password='testpass123', **duplicate_data)
    
    def test_default_status_value(self):
        """UR-M-007: Create user without specifying status"""
        user = User.objects.create_user(password='testpass123', **self.farmer_data)
        self.assertEqual(user.status, 'pending')
    
    def test_default_verification_flags(self):
        """UR-M-008: Create user without specifying verification flags"""
        user = User.objects.create_user(password='testpass123', **self.farmer_data)
        self.assertFalse(user.is_email_verified)
        self.assertFalse(user.is_phone_verified)
    
    def test_user_string_representation(self):
        """UR-M-009: Create user and call __str__() method"""
        user = User.objects.create_user(password='testpass123', **self.farmer_data)
        self.assertEqual(str(user), 'farmer1')
    
    def test_password_hashing(self):
        """UR-M-010: Create user with password and verify it's hashed"""
        user = User.objects.create_user(password='testpass123', **self.farmer_data)
        
        # Password should not be stored in plain text
        self.assertNotEqual(user.password, 'testpass123')
        # Password should be hashed
        self.assertTrue(user.password.startswith('pbkdf2_sha256$'))
        # check_password should work
        self.assertTrue(user.check_password('testpass123'))


class EmailVerificationTokenModelTests(TestCase):
    """Test cases for EmailVerificationToken model (EV-M-001 to EV-M-007)"""
    
    def setUp(self):
        """Set up test data"""
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
    
    def test_token_creation(self):
        """EV-M-001: Create EmailVerificationToken for user"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertIsNotNone(token.token)
        self.assertIsNotNone(token.code)
        self.assertEqual(len(token.code), 6)
        self.assertTrue(token.code.isdigit())
    
    def test_auto_generate_code(self):
        """EV-M-002: Create token without code"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertIsNotNone(token.code)
        self.assertEqual(len(token.code), 6)
        self.assertTrue(token.code.isdigit())
    
    def test_token_expiration_check_expired(self):
        """EV-M-003: Create token and check is_expired() after 11 minutes"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        # Manually set created_at to 11 minutes ago
        token.created_at = timezone.now() - timedelta(minutes=11)
        token.save()
        
        self.assertTrue(token.is_expired())
    
    def test_token_valid_check(self):
        """EV-M-004: Create token and check is_expired() within 10 minutes"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertFalse(token.is_expired())
    
    def test_default_used_flag(self):
        """EV-M-005: Create token without specifying used"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertFalse(token.used)
    
    def test_unique_token_constraint(self):
        """EV-M-006: Verify token UUID is unique"""
        token1 = EmailVerificationToken.objects.create(user=self.user)
        token2 = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertNotEqual(token1.token, token2.token)
    
    def test_user_relationship(self):
        """EV-M-007: Create token and verify user foreign key"""
        token = EmailVerificationToken.objects.create(user=self.user)
        
        self.assertEqual(token.user, self.user)
        self.assertIn(token, self.user.email_tokens.all())


class PhoneOTPModelTests(TestCase):
    """Test cases for PhoneOTP model (PV-M-001 to PV-M-007)"""
    
    def setUp(self):
        """Set up test data"""
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
    
    def test_otp_creation(self):
        """PV-M-001: Create PhoneOTP for user"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        self.assertIsNotNone(otp.code)
        self.assertEqual(len(otp.code), 6)
        self.assertTrue(otp.code.isdigit())
    
    def test_auto_generate_code(self):
        """PV-M-002: Create OTP without code"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        self.assertIsNotNone(otp.code)
        self.assertEqual(len(otp.code), 6)
    
    def test_otp_expiration_check_expired(self):
        """PV-M-003: Create OTP and check is_expired() after 11 minutes"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        otp.created_at = timezone.now() - timedelta(minutes=11)
        otp.save()
        
        self.assertTrue(otp.is_expired())
    
    def test_otp_valid_check(self):
        """PV-M-004: Create OTP and check is_expired() within 10 minutes"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        self.assertFalse(otp.is_expired())
    
    def test_default_used_flag(self):
        """PV-M-005: Create OTP without specifying used"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        self.assertFalse(otp.used)
    
    def test_user_relationship(self):
        """PV-M-006: Create OTP and verify user foreign key"""
        otp = PhoneOTP.objects.create(user=self.user)
        
        self.assertEqual(otp.user, self.user)
        self.assertIn(otp, self.user.phone_otps.all())
    
    def test_multiple_otps_per_user(self):
        """PV-M-007: Create multiple OTPs for same user"""
        otp1 = PhoneOTP.objects.create(user=self.user)
        otp2 = PhoneOTP.objects.create(user=self.user)
        
        self.assertEqual(self.user.phone_otps.count(), 2)
        self.assertNotEqual(otp1.code, otp2.code)


class LoginOTPModelTests(TestCase):
    """Test cases for LoginOTP model (LO-M-001 to LO-M-007)"""
    
    def setUp(self):
        """Set up test data"""
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
    
    def test_login_otp_creation(self):
        """LO-M-001: Create LoginOTP for user"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        self.assertIsNotNone(login_otp.email_code)
        self.assertIsNotNone(login_otp.phone_code)
        self.assertEqual(len(login_otp.email_code), 6)
        self.assertEqual(len(login_otp.phone_code), 6)
    
    def test_auto_generate_email_code(self):
        """LO-M-002: Create LoginOTP without email_code"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        self.assertIsNotNone(login_otp.email_code)
        self.assertEqual(len(login_otp.email_code), 6)
        self.assertTrue(login_otp.email_code.isdigit())
    
    def test_auto_generate_phone_code(self):
        """LO-M-003: Create LoginOTP without phone_code"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        self.assertIsNotNone(login_otp.phone_code)
        self.assertEqual(len(login_otp.phone_code), 6)
        self.assertTrue(login_otp.phone_code.isdigit())
    
    def test_otp_expiration_check(self):
        """LO-M-004: Create LoginOTP and check is_expired() after 11 minutes"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        login_otp.created_at = timezone.now() - timedelta(minutes=11)
        login_otp.save()
        
        self.assertTrue(login_otp.is_expired())
    
    def test_otp_valid_check(self):
        """LO-M-005: Create LoginOTP and check is_expired() within 10 minutes"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        self.assertFalse(login_otp.is_expired())
    
    def test_default_flags(self):
        """LO-M-006: Create LoginOTP without specifying flags"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        self.assertFalse(login_otp.email_verified)
        self.assertFalse(login_otp.phone_verified)
        self.assertFalse(login_otp.used)
    
    def test_user_relationship(self):
        """LO-M-007: Create LoginOTP and verify user foreign key"""
        login_otp = LoginOTP.objects.create(user=self.user)
        
        self.assertEqual(login_otp.user, self.user)
        self.assertIn(login_otp, self.user.login_otps.all())


class PasswordResetTokenModelTests(TestCase):
    """Test cases for PasswordResetToken model (PR-M-001 to PR-M-008)"""
    
    def setUp(self):
        """Set up test data"""
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
    
    def test_token_creation(self):
        """PR-M-001: Create PasswordResetToken for user"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertIsNotNone(token.token)
        self.assertEqual(len(token.token), 6)
        self.assertTrue(token.token.isdigit())
    
    def test_auto_generate_token(self):
        """PR-M-002: Create token without token value"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertIsNotNone(token.token)
        self.assertEqual(len(token.token), 6)
    
    def test_token_validity_check(self):
        """PR-M-003: Create token and check is_valid() within 30 minutes"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertTrue(token.is_valid())
    
    def test_token_expiration_check(self):
        """PR-M-004: Create token and check is_valid() after 31 minutes"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        token.created_at = timezone.now() - timedelta(minutes=31)
        token.save()
        
        self.assertFalse(token.is_valid())
    
    def test_used_token_check(self):
        """PR-M-005: Create token, mark as used, check is_valid()"""
        token = PasswordResetToken.objects.create(user=self.user)
        token.used = True
        token.save()
        
        self.assertFalse(token.is_valid())
    
    def test_mark_used_method(self):
        """PR-M-006: Call mark_used() on token"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertFalse(token.used)
        token.mark_used()
        self.assertTrue(token.used)
    
    def test_default_used_flag(self):
        """PR-M-007: Create token without specifying used"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertFalse(token.used)
    
    def test_user_relationship(self):
        """PR-M-008: Create token and verify user foreign key"""
        token = PasswordResetToken.objects.create(user=self.user)
        
        self.assertEqual(token.user, self.user)
        self.assertIn(token, self.user.password_reset_tokens.all())
