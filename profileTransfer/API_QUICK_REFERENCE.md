# Profile Transfer API - Quick Reference

## Base URL
```
/api/v1/profile-transfer/
```

## Authentication
All endpoints require authentication via JWT token:
```
Authorization: Bearer <your_jwt_token>
```

## Quick Start Examples

### 1. Create Transfer (Farmer - Sender)
```javascript
POST /api/v1/profile-transfer/transfers/

{
  "livestock": 1,
  "receiver": 2,
  "reason": "Selling livestock due to downsizing farm"
}
```

### 2. Get My Sent Transfers (Farmer - Sender)
```javascript
GET /api/v1/profile-transfer/transfers/sent/
```

### 3. Get Received Requests (Farmer - Receiver)
```javascript
GET /api/v1/profile-transfer/transfers/received/
```

### 4. Receiver Approves Transfer
```javascript
POST /api/v1/profile-transfer/transfers/1/receiver_approve/

{
  "notes": "Approved. Ready to receive livestock."
}
```

### 5. Receiver Rejects Transfer
```javascript
POST /api/v1/profile-transfer/transfers/1/receiver_reject/

{
  "notes": "Cannot accept at this time."
}
```

### 6. Get Pending Admin Reviews (Admin)
```javascript
GET /api/v1/profile-transfer/transfers/pending_review/
```

### 7. Admin Approves Transfer
```javascript
POST /api/v1/profile-transfer/transfers/1/admin_approve/

{
  "notes": "All documents verified. Transfer approved."
}
```

### 8. Admin Rejects Transfer
```javascript
POST /api/v1/profile-transfer/transfers/1/admin_reject/

{
  "notes": "Missing required documentation."
}
```

### 9. Complete Transfer (Admin)
```javascript
POST /api/v1/profile-transfer/transfers/1/complete/
```
**Note:** This transfers livestock ownership to receiver

### 10. Cancel Transfer (Farmer - Sender)
```javascript
POST /api/v1/profile-transfer/transfers/1/cancel/
```
**Note:** Only works for pending transfers

### 11. Get Statistics
```javascript
GET /api/v1/profile-transfer/transfers/stats/
```

### 12. Search Farmers
```javascript
GET /api/v1/profile-transfer/transfers/search_farmers/?q=john
```

## Response Format

### Transfer Object
```json
{
  "id": 1,
  "livestock": 1,
  "livestock_details": {
    "id": 1,
    "tag_number": "TG-001",
    "name": "Bella",
    "species_name": "Cattle",
    "breed_name": "Holstein",
    "age": 3,
    "gender": "Female",
    "health_status": "Healthy",
    "owner": 1,
    "owner_name": "John Doe",
    "image": "/media/livestock/bella.jpg"
  },
  "sender": 1,
  "sender_details": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone_number": "+1234567890",
    "role": "farmer"
  },
  "receiver": 2,
  "receiver_details": {
    "id": 2,
    "email": "jane@example.com",
    "full_name": "Jane Smith",
    "phone_number": "+0987654321",
    "role": "farmer"
  },
  "admin_reviewer": null,
  "admin_reviewer_details": null,
  "reason": "Selling livestock due to downsizing farm",
  "status": "Pending",
  "receiver_notes": null,
  "admin_notes": null,
  "supporting_document": null,
  "created_at": "2024-03-13T10:30:00Z",
  "updated_at": "2024-03-13T10:30:00Z",
  "receiver_approved_at": null,
  "admin_approved_at": null,
  "completed_at": null,
  "animal_tag": "TG-001",
  "animal_name": "Bella",
  "sender_name": "John Doe",
  "receiver_name": "Jane Smith"
}
```

### Statistics Object
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

### Farmer Search Results
```json
[
  {
    "id": 2,
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone_number": "+0987654321",
    "farm_name": "Smith Farm"
  }
]
```

## Status Values

- `Pending` - Initial state when sender creates transfer
- `Receiver Approved` - Receiver has approved the transfer
- `Admin Approved` - Admin has approved the transfer
- `Rejected` - Transfer was rejected (by receiver or admin)
- `Completed` - Transfer completed, ownership transferred

## Query Parameters

### List Transfers
```
GET /api/v1/profile-transfer/transfers/?status=Pending&ordering=-created_at
```

**Available Parameters:**
- `status` - Filter by status
- `livestock` - Filter by livestock ID
- `livestock_tag` - Filter by livestock tag (contains)
- `sender` - Filter by sender ID
- `receiver` - Filter by receiver ID
- `created_after` - Filter by creation date (YYYY-MM-DD)
- `created_before` - Filter by creation date (YYYY-MM-DD)
- `participant_name` - Search by sender or receiver name
- `search` - Full-text search
- `ordering` - Sort by field (prefix with `-` for descending)

## Error Responses

### 400 Bad Request
```json
{
  "error": "Only pending transfers can be approved"
}
```

### 403 Forbidden
```json
{
  "error": "Only the receiver can approve this transfer"
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

## Permissions Summary

| Action | Farmer (Sender) | Farmer (Receiver) | Admin |
|--------|----------------|-------------------|-------|
| Create Transfer | ✅ | ❌ | ❌ |
| View Own Transfers | ✅ | ✅ | ✅ All |
| Approve/Reject (Receiver) | ❌ | ✅ | ❌ |
| Approve/Reject (Admin) | ❌ | ❌ | ✅ |
| Complete Transfer | ❌ | ❌ | ✅ |
| Cancel Transfer | ✅ (Pending only) | ❌ | ❌ |

## Integration with Frontend

### Example: Create Transfer from Frontend
```javascript
import api from './api';

const createTransfer = async (livestockId, receiverId, reason) => {
  try {
    const response = await api.post('/profile-transfer/transfers/', {
      livestock: livestockId,
      receiver: receiverId,
      reason: reason
    });
    return response.data;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
};
```

### Example: Get Sent Transfers
```javascript
const getSentTransfers = async () => {
  try {
    const response = await api.get('/profile-transfer/transfers/sent/');
    return response.data;
  } catch (error) {
    console.error('Error fetching sent transfers:', error);
    throw error;
  }
};
```

### Example: Receiver Approve
```javascript
const approveTransfer = async (transferId, notes) => {
  try {
    const response = await api.post(
      `/profile-transfer/transfers/${transferId}/receiver_approve/`,
      { notes }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving transfer:', error);
    throw error;
  }
};
```

## Testing with cURL

### Create Transfer
```bash
curl -X POST http://localhost:8000/api/v1/profile-transfer/transfers/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"livestock": 1, "receiver": 2, "reason": "Test transfer"}'
```

### Get Sent Transfers
```bash
curl http://localhost:8000/api/v1/profile-transfer/transfers/sent/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Receiver Approve
```bash
curl -X POST http://localhost:8000/api/v1/profile-transfer/transfers/1/receiver_approve/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads use multipart/form-data
- Pagination is enabled for list endpoints
- Livestock ownership is automatically transferred when status becomes "Completed"
- Only one pending transfer per livestock is allowed
