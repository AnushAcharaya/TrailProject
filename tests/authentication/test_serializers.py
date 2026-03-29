"""
Test ID: UR-S-001 to UR-S-013, LG-S-001 to LG-S-013, LO-S-001 to LO-S-008, 
         PR-S-001 to PR-S-010, AD-S-001 to AD-S-008
Test Module: Authentication Serializers Testing
"""
from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from authentication.serializers import (
    RegistrationSerializer, LoginSerializer, EmailVerifySerializer,
    PhoneSendOTPSerializer, PhoneVerifySerializer,
    SendLoginOTPSerializer, VerifyLoginOTPSerializer,
    ForgotPasswordEmailSerializer, ForgotPasswordTokenSerializer,
    ResetPasswordSerializer, AdminUserListSerializer
)
from authentication.models import EmailVerificationToken, PhoneOTP, PasswordResetToken
from unittest.mock import patch, MagicMock

User = get_user_model()


class RegistrationSerializerTests(TestCase):
    """Test cases for RegistrationSerializer (UR-S-001 to UR-S-013)"""
    
    def setUp(self):
        """Set up test data"""
        # Create a simple 1x1 pixel image for testing
        self.test_image = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01\x44\x00\x3b',
            content_type='image/jpeg'
        )
        
        self.farmer_data = {
            'username': 'farmer1',
            'email': 'farmer1@test.com',
            'full_name': 'Test Farmer',
            'address': '123 Farm Road',
            'password': 'StrongPass123!',
            'role': 'farmer',
            'phone': '+1234567890',
            'farm_name': 'Test Farm',
            'nid_photo': self.test_image,
        }
        
        self.vet_data = {
            'username': 'vet1',
            'email': 'vet1@test.com',
            'full_name': 'Test Vet',
            'address': '456 Vet Street',
            'password': 'StrongPass123!',
            'role': 'vet',
            'phone': '+0987654321',
            'specialization': 'Large Animals',
            'certificate_photo': self.test_image,
        }
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_valid_farmer_registration(self, mock_sms, mock_email):
        """UR-S-001: Provide all required fields for farmer role"""
        serializer = RegistrationSerializer(data=self.farmer_data)
        
        self.assertTrue(serializer.is_valid())
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_valid_vet_registration(self, mock_sms, mock_email):
        """UR-S-002: Provide all required fields for vet role"""
        serializer = RegistrationSerializer(data=self.vet_data)
        
        self.assertTrue(serializer.is_valid())
    
    def test_missing_address_field(self):
        """UR-S-004: Omit address field from registration data"""
        data = self.farmer_data.copy()
        del data['address']
        
        serializer = RegistrationSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('address', serializer.errors)
    
    def test_farmer_missing_farm_name(self):
        """UR-S-005: Farmer registration without farm_name"""
        data = self.farmer_data.copy()
        del data['farm_name']
        
        serializer = RegistrationSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('farm_name', serializer.errors)
    
    def test_farmer_missing_nid_photo(self):
        """UR-S-006: Farmer registration without nid_photo"""
        data = self.farmer_data.copy()
        del data['nid_photo']
        
        serializer = RegistrationSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('nid_photo', serializer.errors)
    
    def test_vet_missing_specialization(self):
        """UR-S-007: Vet registration without specialization"""
        data = self.vet_data.copy()
        del data['specialization']
        
        serializer = RegistrationSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('specialization', serializer.errors)
    
    def test_vet_missing_certificate(self):
        """UR-S-008: Vet registration without certificate_photo"""
        data = self.vet_data.copy()
        del data['certificate_photo']
        
        serializer = RegistrationSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('certificate_photo', serializer.errors)
    
    def test_weak_password(self):
        """UR-S-009: Provide password that doesn't meet strength requirements"""
        data = self.farmer_data.copy()
        data['password'] = '123'  # Too short
        
        serializer = RegistrationSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        # Password validation errors can be in 'password' or 'non_field_errors'
        self.assertTrue('password' in serializer.errors or 'non_field_errors' in serializer.errors)
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_password_hashing_on_create(self, mock_sms, mock_email):
        """UR-S-010: Call serializer.save() and verify password is hashed"""
        serializer = RegistrationSerializer(data=self.farmer_data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        self.assertNotEqual(user.password, 'StrongPass123!')
        self.assertTrue(user.check_password('StrongPass123!'))
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_email_token_creation(self, mock_sms, mock_email):
        """UR-S-011: Call serializer.save() and verify EmailVerificationToken created"""
        serializer = RegistrationSerializer(data=self.farmer_data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        self.assertTrue(EmailVerificationToken.objects.filter(user=user).exists())
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_phone_otp_creation(self, mock_sms, mock_email):
        """UR-S-012: Call serializer.save() and verify PhoneOTP created"""
        serializer = RegistrationSerializer(data=self.farmer_data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        self.assertTrue(PhoneOTP.objects.filter(user=user).exists())
    
    @patch('authentication.serializers.send_verification_email.delay')
    @patch('authentication.serializers.send_sms_otp.delay')
    def test_celery_task_triggered(self, mock_sms, mock_email):
        """UR-S-013: Call serializer.save() and verify email task triggered"""
        serializer = RegistrationSerializer(data=self.farmer_data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        self.assertTrue(mock_email.called)


class LoginSerializerTests(TestCase):
    """Test cases for LoginSerializer (LG-S-001 to LG-S-013)"""
    
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
            farm_name='Test Farm',
            status='approved',
            is_email_verified=True
        )
    
    def test_valid_login_data(self):
        """LG-S-001: Provide valid phone, password, role"""
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
    
    def test_missing_phone_field(self):
        """LG-S-002: Omit phone from login data"""
        data = {
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_missing_password_field(self):
        """LG-S-003: Omit password from login data"""
        data = {
            'phone': '+1234567890',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_missing_role_field(self):
        """LG-S-004: Omit role from login data"""
        data = {
            'phone': '+1234567890',
            'password': 'testpass123'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_non_existent_phone(self):
        """LG-S-005: Provide phone that doesn't exist"""
        data = {
            'phone': '+9999999999',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('Invalid credentials', str(serializer.errors))
    
    def test_wrong_password(self):
        """LG-S-006: Provide correct phone but wrong password"""
        data = {
            'phone': '+1234567890',
            'password': 'wrongpassword',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('Invalid credentials', str(serializer.errors))
    
    def test_inactive_user(self):
        """LG-S-007: Login with inactive user account"""
        self.user.is_active = False
        self.user.save()
        
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('inactive', str(serializer.errors))
    
    def test_unverified_account(self):
        """LG-S-008: Login with unverified email and phone"""
        self.user.is_email_verified = False
        self.user.is_phone_verified = False
        self.user.save()
        
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('not verified', str(serializer.errors))
    
    def test_wrong_role(self):
        """LG-S-009: Login with correct credentials but wrong role"""
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'vet'  # User is farmer
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('do not have access', str(serializer.errors))
    
    def test_pending_approval(self):
        """LG-S-010: Login with pending status (non-admin)"""
        self.user.status = 'pending'
        self.user.save()
        
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('pending', str(serializer.errors))
    
    def test_declined_account(self):
        """LG-S-011: Login with declined status"""
        self.user.status = 'declined'
        self.user.save()
        
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('declined', str(serializer.errors))
    
    def test_jwt_token_generation(self):
        """LG-S-012: Valid login generates JWT tokens"""
        data = {
            'phone': '+1234567890',
            'password': 'testpass123',
            'role': 'farmer'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        self.assertIn('access', serializer.validated_data)
        self.assertIn('refresh', serializer.validated_data)
    
    def test_admin_bypass_approval(self):
        """LG-S-013: Admin user can login without approval"""
        admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
            full_name='Admin User',
            address='Admin Address',
            phone='+1111111111',
            role='admin',
            status='pending',  # Even with pending status
            is_email_verified=True
        )
        
        data = {
            'phone': '+1111111111',
            'password': 'adminpass123',
            'role': 'admin'
        }
        
        serializer = LoginSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())


class PasswordResetSerializerTests(TestCase):
    """Test cases for Password Reset Serializers (PR-S-001 to PR-S-010)"""
    
    def setUp(self):
        """Set up test data"""
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
    
    def test_valid_email(self):
        """PR-S-001: Provide valid email address"""
        data = {'email': 'test@test.com'}
        
        serializer = ForgotPasswordEmailSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_email_format(self):
        """PR-S-002: Provide invalid email format"""
        data = {'email': 'invalid-email'}
        
        serializer = ForgotPasswordEmailSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_missing_email(self):
        """PR-S-003: Omit email field"""
        data = {}
        
        serializer = ForgotPasswordEmailSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_valid_token_data(self):
        """PR-S-004: Provide valid email and token"""
        data = {
            'email': 'test@test.com',
            'token': '123456'
        }
        
        serializer = ForgotPasswordTokenSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
    
    def test_missing_token(self):
        """PR-S-005: Omit token field"""
        data = {'email': 'test@test.com'}
        
        serializer = ForgotPasswordTokenSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_valid_reset_data(self):
        """PR-S-007: Provide email, token, matching passwords"""
        data = {
            'email': 'test@test.com',
            'token': '123456',
            'new_password': 'NewStrongPass123!',
            'confirm_password': 'NewStrongPass123!'
        }
        
        serializer = ResetPasswordSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
    
    def test_password_mismatch(self):
        """PR-S-008: Provide non-matching passwords"""
        data = {
            'email': 'test@test.com',
            'token': '123456',
            'new_password': 'NewStrongPass123!',
            'confirm_password': 'DifferentPass123!'
        }
        
        serializer = ResetPasswordSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('do not match', str(serializer.errors))
    
    def test_weak_password(self):
        """PR-S-009: Provide password that doesn't meet requirements"""
        data = {
            'email': 'test@test.com',
            'token': '123456',
            'new_password': '123',
            'confirm_password': '123'
        }
        
        serializer = ResetPasswordSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
    
    def test_missing_fields(self):
        """PR-S-010: Omit required fields"""
        data = {'email': 'test@test.com'}
        
        serializer = ResetPasswordSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())


class AdminUserListSerializerTests(TestCase):
    """Test cases for AdminUserListSerializer (AD-S-001 to AD-S-008)"""
    
    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        self.request = self.factory.get('/')
        
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
    
    def test_serialize_user_data(self):
        """AD-S-001: Serialize CustomUser object"""
        serializer = AdminUserListSerializer(self.user, context={'request': self.request})
        
        self.assertIn('id', serializer.data)
        self.assertIn('name', serializer.data)
        self.assertIn('role', serializer.data)
    
    def test_field_name_mapping(self):
        """AD-S-002: Verify full_name mapped to name"""
        serializer = AdminUserListSerializer(self.user, context={'request': self.request})
        
        self.assertEqual(serializer.data['name'], 'Test User')
    
    def test_farm_name_mapping(self):
        """AD-S-003: Verify farm_name mapped to farmName"""
        serializer = AdminUserListSerializer(self.user, context={'request': self.request})
        
        self.assertEqual(serializer.data['farmName'], 'Test Farm')
    
    def test_date_format(self):
        """AD-S-004: Verify date_joined formatted correctly"""
        serializer = AdminUserListSerializer(self.user, context={'request': self.request})
        
        self.assertIn('submittedDate', serializer.data)
        # Check format matches '%B %d, %Y' (e.g., "January 01, 2024")
        self.assertRegex(serializer.data['submittedDate'], r'^[A-Z][a-z]+ \d{2}, \d{4}$')
    
    def test_multiple_users(self):
        """AD-S-008: Serialize queryset with many=True"""
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@test.com',
            password='testpass123',
            full_name='Test User 2',
            address='Test Address 2',
            phone='+0987654321',
            role='vet',
            specialization='Small Animals'
        )
        
        users = User.objects.all()
        serializer = AdminUserListSerializer(users, many=True, context={'request': self.request})
        
        self.assertEqual(len(serializer.data), 2)
