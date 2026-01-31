# User Profile API Documentation

## Overview
This API provides endpoints for managing user profiles in the LivestockHub application. All endpoints require authentication and only allow users to access/modify their own profile data.

## Base URL
```
http://localhost:8000/api/v1/profile/
```

## Authentication
All endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## Endpoints

### 1. Get User Profile
Retrieve the authenticated user's complete profile information.

**Endpoint:** `GET /api/v1/profile/`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    // From CustomUser (read-only, from registration)
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "+977-9800000000",
    "address": "Kathmandu, Nepal",
    "role": "farmer",
    "status": "approved",
    "date_joined": "2024-01-15T10:30:00Z",
    "farm_name": "Green Valley Farm",  // Only for farmers
    "specialization": null,  // Only for vets
    
    // From UserProfile (editable)
    "bio": "Full-stack developer and coffee lover",
    "location": "Kathmandu, Nepal",
    "gender": "male",
    "profile_image": "/media/profile_images/john_profile.jpg",
    "profile_image_url": "http://localhost:8000/media/profile_images/john_profile.jpg",
    "theme": "light",
    "language": "en",
    "email_notifications": true,
    "push_notifications": false,
    
    // Metadata
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

### 2. Update Profile Information
Update editable profile fields (bio, location, gender, profile_image).

**Endpoint:** `PUT /api/v1/profile/update/` or `PATCH /api/v1/profile/update/`

**Authentication:** Required

**Content-Type:** `multipart/form-data` (for image upload) or `application/json`

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "location": "Pokhara, Nepal",
  "gender": "male",
  "profile_image": <file>  // Optional, only in multipart/form-data
}
```

**Note:** 
- Use `PUT` for full update (all fields required)
- Use `PATCH` for partial update (only send fields you want to update)
- Cannot update CustomUser fields (username, email, phone, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Full profile data (same structure as GET /profile/)
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": {
    "bio": ["Bio must be 500 characters or less."]
  }
}
```

---

### 3. Update Preferences/Settings
Update user preferences (theme, language, notifications).

**Endpoint:** `PUT /api/v1/profile/preferences/` or `PATCH /api/v1/profile/preferences/`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "theme": "dark",
  "language": "np",
  "email_notifications": false,
  "push_notifications": true
}
```

**Valid Values:**
- `theme`: "light" or "dark"
- `language`: "en" or "np"
- `email_notifications`: true or false
- `push_notifications`: true or false

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    // Full profile data (same structure as GET /profile/)
  }
}
```

---

### 4. Change Password
Change the authenticated user's password.

**Endpoint:** `POST /api/v1/profile/change-password/`

**Authentication:** Required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "old_password": "current_password123",
  "new_password": "new_password456",
  "confirm_password": "new_password456"
}
```

**Validation Rules:**
- `old_password`: Must match current password
- `new_password`: 
  - Minimum 8 characters
  - Must be different from old password
  - Must match confirm_password

**Success Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

```json
{
  "success": false,
  "errors": {
    "new_password": ["Password must be at least 8 characters long."],
    "confirm_password": ["New password and confirm password do not match."]
  }
}
```

---

### 5. Delete Profile Image
Remove the authenticated user's profile image.

**Endpoint:** `DELETE /api/v1/profile/delete-image/`

**Authentication:** Required

**Success Response:**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No profile image to delete"
}
```

---

## Data Models

### UserProfile Model
```python
{
  "user": ForeignKey(CustomUser),  // One-to-one relationship
  "bio": TextField(max_length=500, optional),
  "location": CharField(max_length=255, optional),
  "gender": CharField(choices=["male", "female", "other"], optional),
  "profile_image": ImageField(optional),
  "theme": CharField(choices=["light", "dark"], default="light"),
  "language": CharField(choices=["en", "np"], default="en"),
  "email_notifications": Boolean(default=True),
  "push_notifications": Boolean(default=False),
  "created_at": DateTime(auto),
  "updated_at": DateTime(auto)
}
```

### CustomUser Model (Read-Only in Profile)
```python
{
  "username": CharField(unique),
  "email": EmailField(unique),
  "full_name": CharField,
  "phone": CharField(unique),
  "address": CharField,
  "role": CharField(choices=["farmer", "vet", "admin"]),
  "status": CharField(choices=["pending", "approved", "declined"]),
  "farm_name": CharField(optional, for farmers only),
  "specialization": CharField(optional, for vets only),
  "date_joined": DateTime
}
```

---

## Security Features

1. **Authentication Required:** All endpoints require valid JWT token
2. **User Isolation:** Users can only access/modify their own profile
3. **Password Verification:** Old password required for password changes
4. **Session Management:** Session updated after password change to prevent logout
5. **File Validation:** Profile images validated for size and format
6. **Read-Only Fields:** Registration data (username, email, etc.) cannot be modified via profile API

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found (profile doesn't exist) |
| 500 | Internal Server Error |

---

## Usage Examples

### Example 1: Get Profile
```bash
curl -X GET http://localhost:8000/api/v1/profile/ \
  -H "Authorization: Bearer <your_token>"
```

### Example 2: Update Bio and Location
```bash
curl -X PATCH http://localhost:8000/api/v1/profile/update/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "New bio text",
    "location": "Pokhara, Nepal"
  }'
```

### Example 3: Upload Profile Image
```bash
curl -X PATCH http://localhost:8000/api/v1/profile/update/ \
  -H "Authorization: Bearer <your_token>" \
  -F "profile_image=@/path/to/image.jpg"
```

### Example 4: Change Password
```bash
curl -X POST http://localhost:8000/api/v1/profile/change-password/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "oldpass123",
    "new_password": "newpass456",
    "confirm_password": "newpass456"
  }'
```

### Example 5: Update Theme
```bash
curl -X PATCH http://localhost:8000/api/v1/profile/preferences/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark"
  }'
```

---

## Notes

1. **Automatic Profile Creation:** A UserProfile is automatically created when a user registers
2. **Image Upload:** Use `multipart/form-data` when uploading profile images
3. **Partial Updates:** Use `PATCH` to update only specific fields
4. **Role-Specific Data:** `farm_name` is only available for farmers, `specialization` only for vets
5. **Frontend Integration:** Remember to NOT integrate with frontend yet - this is backend-only documentation

---

## Database Migrations

After creating the models, run:
```bash
python manage.py makemigrations userprofile
python manage.py migrate
```

---

## Testing

You can test the API using:
- Postman
- cURL
- Django REST Framework browsable API
- Swagger UI at `http://localhost:8000/swagger/`
