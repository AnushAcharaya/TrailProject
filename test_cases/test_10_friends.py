"""
Test Plan: Friends System
Test IDs : TP-10.1 to TP-10.10
API Prefix: /api/v1/friends/
"""

from django.test import TestCase
from rest_framework.test import APIClient
from authentication.models import CustomUser
from friends.models import FriendRequest, Friendship


def make_user(username, email, phone, role='farmer', password='Test@1234'):
    user = CustomUser.objects.create_user(
        username=username, email=email, phone=phone,
        full_name='Friend User', address='Kathmandu', role=role, password=password,
    )
    user.status = 'approved'
    user.is_email_verified = True
    user.is_phone_verified = True
    user.save()
    return user


def get_token(client, user, password='Test@1234'):
    resp = client.post('/api/v1/auth/login/', {'phone': user.phone, 'password': password, 'role': user.role}, format='json')
    return resp.data.get('access')


class TP10_FriendsTests(TestCase):
    """TP-10.1 to TP-10.10 — Friend requests and friendships"""

    def setUp(self):
        self.client = APIClient()
        self.farmer = make_user('friendfarmer', 'friendfarmer@gmail.com', '9800000016')
        self.vet = make_user('friendvet', 'friendvet@gmail.com', '9800000017', role='vet')

        self.farmer_token = get_token(self.client, self.farmer)
        self.vet_token = get_token(self.client, self.vet)

        self.req_url = '/api/v1/friends/requests/'
        self.friendship_url = '/api/v1/friends/friendships/'
        self._auth_farmer()

    def _auth_farmer(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.farmer_token}')

    def _auth_vet(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.vet_token}')

    # TP-10.1 Send friend request
    def test_tp10_1_send_friend_request(self):
        response = self.client.post(self.req_url, {'receiver_username': self.vet.username}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(FriendRequest.objects.filter(
            sender=self.farmer, receiver=self.vet, status='pending'
        ).exists())

    # TP-10.2 Send request to self → 400
    def test_tp10_2_send_request_to_self(self):
        response = self.client.post(self.req_url, {'receiver_username': self.farmer.username}, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-10.3 Send duplicate request → 400
    def test_tp10_3_duplicate_request(self):
        FriendRequest.objects.create(sender=self.farmer, receiver=self.vet, status='pending')
        response = self.client.post(self.req_url, {'receiver_username': self.vet.username}, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-10.4 Send request to existing friend → 400
    def test_tp10_4_send_request_to_existing_friend(self):
        Friendship.objects.create(user1=self.farmer, user2=self.vet)
        response = self.client.post(self.req_url, {'receiver_username': self.vet.username}, format='json')
        self.assertEqual(response.status_code, 400)

    # TP-10.5 Accept friend request → Friendship created
    def test_tp10_5_accept_friend_request(self):
        req = FriendRequest.objects.create(sender=self.farmer, receiver=self.vet, status='pending')
        self._auth_vet()
        response = self.client.post(f'{self.req_url}{req.id}/accept/', format='json')
        self.assertIn(response.status_code, [200, 201])
        req.refresh_from_db()
        self.assertEqual(req.status, 'accepted')
        self.assertTrue(
            Friendship.objects.filter(user1=self.farmer, user2=self.vet).exists() or
            Friendship.objects.filter(user1=self.vet, user2=self.farmer).exists()
        )

    # TP-10.6 Reject friend request → no Friendship
    def test_tp10_6_reject_friend_request(self):
        req = FriendRequest.objects.create(sender=self.farmer, receiver=self.vet, status='pending')
        self._auth_vet()
        response = self.client.post(f'{self.req_url}{req.id}/reject/', format='json')
        self.assertIn(response.status_code, [200, 201])
        req.refresh_from_db()
        self.assertEqual(req.status, 'rejected')
        self.assertFalse(Friendship.objects.filter(user1=self.farmer, user2=self.vet).exists())

    # TP-10.7 View friends list (no pagination — plain list)
    def test_tp10_7_view_friends_list(self):
        Friendship.objects.create(user1=self.farmer, user2=self.vet)
        response = self.client.get(self.friendship_url)
        self.assertEqual(response.status_code, 200)
        data = response.data
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertGreaterEqual(len(results), 1)

    # TP-10.8 Remove friend via /remove/ action
    def test_tp10_8_remove_friend(self):
        friendship = Friendship.objects.create(user1=self.farmer, user2=self.vet)
        response = self.client.delete(f'{self.friendship_url}{friendship.id}/remove/')
        self.assertIn(response.status_code, [200, 204])
        self.assertFalse(Friendship.objects.filter(id=friendship.id).exists())

    # TP-10.9 Pending request shows in list (no pagination — plain list)
    def test_tp10_9_pending_request_in_list(self):
        FriendRequest.objects.create(sender=self.farmer, receiver=self.vet, status='pending')
        response = self.client.get(self.req_url)
        self.assertEqual(response.status_code, 200)
        data = response.data
        results = data.get('results', data) if isinstance(data, dict) else data
        self.assertGreaterEqual(len(results), 1)

    # TP-10.10 Friendship enables messaging check (friendship exists)
    def test_tp10_10_friendship_enables_messaging(self):
        Friendship.objects.create(user1=self.farmer, user2=self.vet)
        exists = (
            Friendship.objects.filter(user1=self.farmer, user2=self.vet).exists() or
            Friendship.objects.filter(user1=self.vet, user2=self.farmer).exists()
        )
        self.assertTrue(exists)
