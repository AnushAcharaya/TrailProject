# Friends System

A complete friend request and friendship management system for the livestock management platform.

## Features

- Send friend requests to other users (farmers can send to vets)
- Accept or reject friend requests
- View list of friends
- Remove friends
- Real-time friend request count in navigation

## API Endpoints

### Friend Requests

- `POST /api/v1/friends/requests/` - Send a friend request
  - Body: `{ "receiver_username": "username" }`
  
- `GET /api/v1/friends/requests/` - Get all friend requests (sent and received)

- `GET /api/v1/friends/requests/received/` - Get pending received requests

- `GET /api/v1/friends/requests/sent/` - Get pending sent requests

- `POST /api/v1/friends/requests/{id}/accept/` - Accept a friend request

- `POST /api/v1/friends/requests/{id}/reject/` - Reject a friend request

### Friendships

- `GET /api/v1/friends/friendships/` - Get all friends

- `DELETE /api/v1/friends/friendships/{id}/remove/` - Remove a friend

## Frontend Pages

- `/friends/requests` - View and manage friend requests
- `/friends/list` - View all friends

## Usage

1. Farmers can send friend requests to vets from the vet appointment page
2. Friend request icon in top navigation shows pending request count
3. Click the friend request icon to view and manage requests
4. Navigate to Friends page from sidebar to see all friends

## Models

### FriendRequest
- sender: User who sent the request
- receiver: User who received the request
- status: pending/accepted/rejected
- created_at, updated_at

### Friendship
- user1, user2: The two users who are friends
- created_at

## Notes

- Users cannot send friend requests to themselves
- Duplicate friend requests are prevented
- When a request is accepted, a Friendship is automatically created
- Friendships are bidirectional (stored once but accessible from both users)
