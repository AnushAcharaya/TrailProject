"""
Test Plan: User Profile Management
Test IDs : TP-2.1 to TP-2.10
API Prefix: /api/v1/profile/
"""

import io
from PIL import Image
from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from authentication.models import CustomUser
from userprofile.models import UserProfile


def make_user(username='farmer2', email='farmer2@gmail.com',
              phone='9800000002', role='farmer', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Profile Farmer', address='Pokhara',
        role=role, password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


def make_image_file(name='test.jpg', fmt='JPEG'):
    """Return a valid in-memory image as SimpleUploadedFile."""
    buf = io.BytesIO()
    Image.new('RGB', (100, 100), color='blue').save(buf, format=fmt)
    buf.seek(0)
    content_type = 'image/jpeg' if fmt == 'JPEG' else 'image/png'
    return SimpleUploadedFile(name, buf.read(), content_type=content_type)


class TP2_ProfileViewTests(TestCase):
    """TP-2.1 — View profile (auto-create on first access)"""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        token = get_token(self.client, self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # TP-2.1 Profile auto-created and returned on first GET
    def test_tp2_1_view_profile_first_time(self):
        response = self.client.get('/api/v1/profile/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('success'))
        self.assertTrue(UserProfile.objects.filter(user=self.user).exists())


class TP2_ProfileEditTests(TestCase):
    """TP-2.2 to TP-2.5 — Edit profile, photo upload/delete"""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='edit_farmer', email='editfarmer@gmail.com', phone='9800000050')
        token = get_token(self.client, self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        UserProfile.objects.get_or_create(user=self.user)

    # TP-2.2 Edit profile with valid data
    def test_tp2_2_edit_profile_valid(self):
        response = self.client.patch('/api/v1/profile/update/', {
            'bio': 'I am a farmer',
            'location': 'Chitwan',
            'gender': 'male',
        }, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('success'))

    # TP-2.3 Upload valid profile photo
    def test_tp2_3_upload_profile_photo(self):
        img = make_image_file('avatar.jpg')
        response = self.client.patch('/api/v1/profile/update/', {
            'profile_image': img,
        }, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.user.profile.refresh_from_db()
        self.assertTrue(bool(self.user.profile.profile_image))

    # TP-2.4 Upload invalid file type (.txt) as profile photo
    def test_tp2_4_upload_invalid_file_type(self):
        bad_file = SimpleUploadedFile('doc.txt', b'hello world', content_type='text/plain')
        response = self.client.patch('/api/v1/profile/update/', {
            'profile_image': bad_file,
        }, format='multipart')
        self.assertEqual(response.status_code, 400)

    # TP-2.5 Delete profile photo
    def test_tp2_5_delete_profile_photo(self):
        # First upload a photo
        img = make_image_file('del.jpg')
        self.client.patch('/api/v1/profile/update/', {'profile_image': img}, format='multipart')
        # Then delete it
        response = self.client.delete('/api/v1/profile/delete-image/')
        self.assertIn(response.status_code, [200, 204])


class TP2_PasswordTests(TestCase):
    """TP-2.6 & TP-2.7 — Change password"""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='pass_farmer', email='passfarmer@gmail.com', phone='9800000060')
        token = get_token(self.client, self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # TP-2.6 Change password with correct old password
    def test_tp2_6_change_password_correct(self):
        response = self.client.post('/api/v1/profile/change-password/', {
            'old_password': 'Test@1234',
            'new_password': 'NewPass@5678',
            'confirm_password': 'NewPass@5678',
        }, format='json')
        self.assertEqual(response.status_code, 200)

    # TP-2.7 Change password with wrong old password
    def test_tp2_7_change_password_wrong_old(self):
        response = self.client.post('/api/v1/profile/change-password/', {
            'old_password': 'WrongPass!',
            'new_password': 'NewPass@5678',
            'confirm_password': 'NewPass@5678',
        }, format='json')
        self.assertEqual(response.status_code, 400)


class TP2_PreferencesTests(TestCase):
    """TP-2.8 & TP-2.9 — Theme and language preferences"""

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(username='pref_farmer', email='preffarmer@gmail.com', phone='9800000070')
        token = get_token(self.client, self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        UserProfile.objects.get_or_create(user=self.user)

    # TP-2.8 Switch theme to dark
    def test_tp2_8_switch_theme_dark(self):
        response = self.client.patch('/api/v1/profile/preferences/', {'theme': 'dark'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.theme, 'dark')

    # TP-2.9 Change language to Nepali
    def test_tp2_9_change_language_nepali(self):
        response = self.client.patch('/api/v1/profile/preferences/', {'language': 'np'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.language, 'np')


class TP2_VetConsultationFeeTests(TestCase):
    """TP-2.10 — Vet sets consultation fee"""

    def setUp(self):
        self.client = APIClient()
        self.vet = make_user(username='vet2', email='vet2@gmail.com', phone='9800000080', role='vet')
        token = get_token(self.client, self.vet)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        UserProfile.objects.get_or_create(user=self.vet)

    # TP-2.10 Vet sets consultation fee
    def test_tp2_10_vet_set_consultation_fee(self):
        response = self.client.patch('/api/v1/profile/update/', {
            'consultation_fee': '500.00',
        }, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.vet.profile.refresh_from_db()
        self.assertEqual(str(self.vet.profile.consultation_fee), '500.00')
