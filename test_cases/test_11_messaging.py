"""
Test Plan: Messaging System
Test IDs : TP-11.1 to TP-11.10
API Prefix: /api/v1/messages/
"""

from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import CustomUser
from friends.models import Friendship
from messaging.models import Message


def make_user(username, email, phone, role='farmer', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Msg User', address='Kathmandu', role=role, password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


class TP11_MessagingTests(TestCase):
    """TP-11.1 to TP-11.10 — Messaging system"""

    def setUp(self):
        self.client = APIClient()
        self.farmer = make_user('msgfarmer', 'msgfarmer@gmail.com', '9800000018')
        self.vet = make_user('msgvet', 'msgvet@gmail.com', '9800000019', role='vet')
        self.stranger = make_user('stranger', 'stranger@gmail.com', '9800000020')

        self.farmer_token = get_token(self.client, self.farmer)
        self.vet_token = get_token(self.client, self.vet)

        # Create friendship between farmer and vet
        self.friendship = Friendship.objects.create(user1=self.farmer, user2=self.vet)

        self.url = '/api/v1/messages/'
        self._auth_farmer()

    def _auth_farmer(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.farmer_token}')

    def _auth_vet(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.vet_token}')

    # TP-11.1 Send text message to a friend
    def test_tp11_1_send_text_message(self):
        response = self.client.post(self.url, {
            'friendship': self.friendship.id,
            'text': 'Hello Doctor!',
            'message_type': 'text',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Message.objects.filter(
            friendship=self.friendship, text='Hello Doctor!'
        ).exists())

    # TP-11.2 Send message to non-friend (no friendship) → 403 or 400
    def test_tp11_2_send_to_non_friend(self):
        stranger_friendship_id = 99999  # non-existent friendship
        response = self.client.post(self.url, {
            'friendship': stranger_friendship_id,
            'text': 'You are not my friend',
            'message_type': 'text',
        }, format='json')
        self.assertNotEqual(response.status_code, 201)

    # TP-11.3 Send appointment card message
    def test_tp11_3_send_appointment_card(self):
        response = self.client.post(self.url, {
            'friendship': self.friendship.id,
            'text': '{"appointment_id": 1, "date": "2026-06-01", "time": "10:00"}',
            'message_type': 'appointment_card',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        msg = Message.objects.get(friendship=self.friendship, message_type='appointment_card')
        self.assertEqual(msg.message_type, 'appointment_card')

    # TP-11.4 Message history returns chronological order
    def test_tp11_4_message_history_ordered(self):
        Message.objects.create(friendship=self.friendship, sender=self.farmer, text='First')
        Message.objects.create(friendship=self.friendship, sender=self.vet, text='Second')
        response = self.client.get(self.url, {'friendship_id': self.friendship.id})
        self.assertEqual(response.status_code, 200)
        messages = response.data
        if len(messages) >= 2:
            self.assertLessEqual(messages[0]['created_at'], messages[1]['created_at'])

    # TP-11.5 View all messages for a friendship
    def test_tp11_5_view_message_history(self):
        Message.objects.create(friendship=self.friendship, sender=self.farmer, text='Test message 1')
        response = self.client.get(self.url, {'friendship_id': self.friendship.id})
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    # TP-11.6 Mark message as read
    def test_tp11_6_mark_message_as_read(self):
        msg = Message.objects.create(
            friendship=self.friendship, sender=self.farmer,
            text='Please read me', is_read=False
        )
        self._auth_vet()  # receiver marks as read
        response = self.client.post(f'{self.url}{msg.id}/mark_read/')
        self.assertIn(response.status_code, [200, 201])
        msg.refresh_from_db()
        self.assertTrue(msg.is_read)

    # TP-11.7 Message list requires authentication
    def test_tp11_7_unauthenticated_cannot_access_messages(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    # TP-11.8 Sender cannot mark own message as read
    def test_tp11_8_sender_cannot_mark_own_read(self):
        msg = Message.objects.create(
            friendship=self.friendship, sender=self.farmer,
            text='My own message', is_read=False
        )
        # Farmer tries to mark their own message
        response = self.client.post(f'{self.url}{msg.id}/mark_read/')
        self.assertEqual(response.status_code, 400)

    # TP-11.9 Empty chat returns empty list
    def test_tp11_9_empty_chat_state(self):
        new_farmer = make_user('emptyfarmer', 'emptyfarmer@gmail.com', '9800000021')
        new_vet = make_user('emptyvet', 'emptyvet@gmail.com', '9800000022', role='vet')
        empty_friendship = Friendship.objects.create(user1=new_farmer, user2=new_vet)

        token = get_token(self.client, new_farmer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.url, {'friendship_id': empty_friendship.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    # TP-11.10 Cannot send empty message text
    def test_tp11_10_empty_message_rejected(self):
        response = self.client.post(self.url, {
            'friendship': self.friendship.id,
            'text': '',
            'message_type': 'text',
        }, format='json')
        self.assertEqual(response.status_code, 400)
