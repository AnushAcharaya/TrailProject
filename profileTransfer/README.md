# Profile Transfer System - Backend Documentation

## Overview

The Profile Transfer system manages livestock ownership transfers with a 3-tier approval workflow:

1. **Sender (Farmer)** - Initiates transfer request
2. **Receiver (Farmer)** - Approves or rejects the request
3. **Admin** - Makes final approval and completes the transfer

## Models

### Transfer Model

**Fields:**
- `livestock` - ForeignKey to Livestock being transferred
- `sender` - ForeignKey to User (current owner)
- `receiver` - ForeignKey to User (new owner)
- `admin_reviewer` - ForeignKey to User (admin who reviewed)
- `reason` - TextField for transfer reason
- `status` - CharField with choices: Pending, Receiver Approved, Admin Approved, Rejected, Completed
- `receiver_notes` - TextField for receiver's notes
- `admin_notes` - TextField for admin's notes
- `supporting_document` - FileField for supporting documents
- Timestamps: `created_at`, `updated_at`, `receiver_approved_at`, `admin_approved_at`, `completed_at`

**Status Flow:**
```
Pending → Receiver Approved → Admin Approved → Completed
   ↓              ↓
Rejected      Rejected
```

**Key Features:**
- Automatic ownership transfer when status becomes "Completed"
- Validation to prevent duplicate pending transfers
- Validation to ensure sender owns the livestock
- Timestamps automatically updated based on status changes

## API Endpoints

### Base URL: `/api/v1/profile-transfer/`

### Transfer CRUD Operations

#### List Transfers
```
GET /api/v1/profile-transfer/transfers/
```
Returns transfers based on user role:
- Farmers: Their sent and received transfers
- Admins: All transfers

**Query Parameters:**
- `status` - Filter by status
- `livestock` - Filter by livestock ID
- `livestock_tag` - Filter by livestock tag (contains)
- `sender` - Filter by sender ID
- `receiver` - Filter by receiver ID
- `created_after` - Filter by creation date (after)
- `created_before` - Filter by creation date (before)
- `participant_name` - Search by sender or receiver name
- `search` - Search across multiple fields
- `ordering` - Sort by fields (created_at, updated_at, status)

#### Get Transfer Details
```
GET /api/v1/profile-transfer/transfers/{id}/
```

#### Create Transfer
```
POST /api/v1/profile-transfer/transfers/
```
**Body:**
```json
{
  "livestock": 1,
  "receiver": 2,
  "reason": "Selling livestock due to downsizing",
  "supporting_document": <file> (optional)
}
```
**Note:** Sender is automatically set to current user

#### Update Transfer
```
PATCH /api/v1/profile-transfer/transfers/{id}/
```
Only sender can update pending transfers

#### Delete Transfer
```
DELETE /api/v1/profile-transfer/transfers/{id}/
```
Only sender can delete pending transfers

### Custom Actions

#### Get Sent Transfers (Farmer)
```
GET /api/v1/profile-transfer/transfers/sent/
```
Returns all transfers sent by current farmer

#### Get Received Transfers (Farmer)
```
GET /api/v1/profile-transfer/transfers/received/
```
Returns all transfers received by current farmer

#### Get Pending Review (Admin)
```
GET /api/v1/profile-transfer/transfers/pending_review/
```
Returns all transfers with status "Receiver Approved" awaiting admin review

#### Receiver Approve
```
POST /api/v1/profile-transfer/transfers/{id}/receiver_approve/
```
**Body:**
```json
{
  "notes": "Approved. Ready to receive livestock."
}
```

#### Receiver Reject
```
POST /api/v1/profile-transfer/transfers/{id}/receiver_reject/
```
**Body:**
```json
{
  "notes": "Cannot accept at this time."
}
```

#### Admin Approve
```
POST /api/v1/profile-transfer/transfers/{id}/admin_approve/
```
**Body:**
```json
{
  "notes": "Transfer approved. All documents verified."
}
```

#### Admin Reject
```
POST /api/v1/profile-transfer/transfers/{id}/admin_reject/
```
**Body:**
```json
{
  "notes": "Missing required documentation."
}
```

#### Complete Transfer
```
POST /api/v1/profile-transfer/transfers/{id}/complete/
```
Completes the transfer and transfers livestock ownership to receiver

#### Cancel Transfer
```
POST /api/v1/profile-transfer/transfers/{id}/cancel/
```
Sender can cancel pending transfers

#### Get Statistics
```
GET /api/v1/profile-transfer/transfers/stats/
```
**Response:**
```json
{
  "total_transfers": 10,
  "pending_transfers": 3,
  "receiver_approved_transfers": 2,
  "admin_approved_transfers": 1,
  "completed_transfers": 3,
  "rejected_transfers": 1
}
```

#### Search Farmers
```
GET /api/v1/profile-transfer/transfers/search_farmers/?q=john
```
Search for farmers to transfer livestock to (excludes current user)

**Response:**
```json
[
  {
    "id": 2,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "farm_name": "Doe Farm"
  }
]
```

## Permissions

### TransferPermission
- **Farmers:**
  - Can create transfers
  - Can view their own sent and received transfers
  - Can approve/reject received transfers
  - Can cancel their own pending transfers
  
- **Admins:**
  - Can view all transfers
  - Can approve/reject receiver-approved transfers
  - Can complete admin-approved transfers

## Serializers

### TransferSerializer
Full transfer details with nested user and livestock information

### TransferStatusUpdateSerializer
For updating transfer status with validation

### TransferStatsSerializer
Transfer statistics

### FarmerSearchSerializer
Farmer search results

## Filters

### TransferFilter
- Status filter
- Date range filters (created_after, created_before)
- Livestock filters (id, tag)
- Participant filters (sender, receiver, name search)

## Usage Examples

### Create Transfer Request
```python
import requests

response = requests.post(
    'http://localhost:8000/api/v1/profile-transfer/transfers/',
    headers={'Authorization': 'Bearer <token>'},
    json={
        'livestock': 1,
        'receiver': 2,
        'reason': 'Selling livestock'
    }
)
```

### Receiver Approves Transfer
```python
response = requests.post(
    'http://localhost:8000/api/v1/profile-transfer/transfers/1/receiver_approve/',
    headers={'Authorization': 'Bearer <token>'},
    json={
        'notes': 'Approved'
    }
)
```

### Admin Approves and Completes Transfer
```python
# Admin approves
response = requests.post(
    'http://localhost:8000/api/v1/profile-transfer/transfers/1/admin_approve/',
    headers={'Authorization': 'Bearer <token>'},
    json={
        'notes': 'All documents verified'
    }
)

# Admin completes (transfers ownership)
response = requests.post(
    'http://localhost:8000/api/v1/profile-transfer/transfers/1/complete/',
    headers={'Authorization': 'Bearer <token>'}
)
```

## Testing

Run tests with:
```bash
python manage.py test profileTransfer
```

## Notes

- Livestock ownership is automatically transferred when status becomes "Completed"
- Only one pending transfer per livestock is allowed
- Sender must own the livestock to create a transfer
- Sender and receiver must be different users
- All status transitions are validated
- Timestamps are automatically managed based on status changes
