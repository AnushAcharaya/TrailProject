# User Profile Management App

## Overview
This Django app handles user profile management for the LivestockHub application. It provides a complete backend API for managing user profiles, preferences, and password changes.

## Features

✅ **Profile Management**
- Get user profile with registration data
- Update profile information (bio, location, gender, profile image)
- Automatic profile creation on user registration
- Role-specific data display (farmer/vet/admin)

✅ **Security**
- JWT authentication required
- Users can only access their own profile
- Password change with old password verification
- Session management after password change

✅ **Preferences**
- Theme selection (light/dark)
- Language selection (English/Nepali)
- Email and push notification settings

✅ **Image Management**
- Profile image upload with validation
- Image deletion endpoint
- Automatic URL generation

## Installation & Setup

### 1. App is Already Created
The `userprofile` app has been created and configured.

### 2. Add to INSTALLED_APPS
Already added in `backend/settings.py`:
```python
INSTALLED_APPS = [
    # ... other apps
    'userprofile',
]
```

### 3. Add URLs
Already added in `backend/urls.py`:
```python
urlpatterns = [
    # ... other urls
    path('api/v1/profile/', include('userprofile.urls')),
]
```

### 4. Run Migrations
```bash
# Create migration files
python manage.py makemigrations userprofile

# Apply migrations
python manage.py migrate
```

### 5. Create Superuser (if not already created)
```bash
python manage.py createsuperuser
```

## File Structure

```
userprofile/
├── __init__.py
├── admin.py              # Django admin configuration
├── apps.py               # App configuration with signals
├── models.py             # UserProfile model
├── serializers.py        # DRF serializers
├── signals.py            # Auto-create profile on user registration
├── views.py              # API views
├── urls.py               # URL routing
├── tests.py              # Unit tests (to be added)
├── migrations/           # Database migrations
├── API_DOCUMENTATION.md  # Complete API documentation
└── README.md             # This file
```

## Models

### UserProfile
Stores additional user information beyond the CustomUser model.

**Fields:**
- `user` (OneToOne): Link to CustomUser
- `bio` (Text): User biography (max 500 chars)
- `location` (String): User location
- `gender` (Choice): male/female/other
- `profile_image` (Image): Profile picture
- `theme` (Choice): light/dark
- `language` (Choice): en/np
- `email_notifications` (Boolean): Email notification preference
- `push_notifications` (Boolean): Push notification preference
- `created_at` (DateTime): Profile creation timestamp
- `updated_at` (DateTime): Last update timestamp

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile/` | Get user profile |
| PUT/PATCH | `/api/v1/profile/update/` | Update profile info |
| PUT/PATCH | `/api/v1/profile/preferences/` | Update preferences |
| POST | `/api/v1/profile/change-password/` | Change password |
| DELETE | `/api/v1/profile/delete-image/` | Delete profile image |

See `API_DOCUMENTATION.md` for detailed endpoint documentation.

## Data Flow

### Registration → Profile Creation
```
1. User registers via authentication app
2. CustomUser created with registration data
3. Signal automatically creates UserProfile
4. Profile linked to user via OneToOne relationship
```

### Profile Display
```
1. Frontend requests GET /api/v1/profile/
2. Backend retrieves UserProfile + CustomUser data
3. Serializer combines both models
4. Returns complete profile data
```

### Profile Update
```
1. Frontend sends PATCH /api/v1/profile/update/
2. Backend validates data
3. Updates only UserProfile fields (not CustomUser)
4. Returns updated complete profile
```

## Key Design Decisions

### 1. Separation of Concerns
- **CustomUser**: Registration data (username, email, phone, role, etc.)
- **UserProfile**: Additional editable data (bio, location, preferences, etc.)

### 2. Read-Only Registration Data
- Fields from registration (username, email, phone) are read-only in profile
- Prevents accidental modification of critical user data
- Maintains data integrity

### 3. Automatic Profile Creation
- Signal creates UserProfile when CustomUser is created
- No manual profile creation needed
- Ensures every user has a profile

### 4. Role-Specific Data
- Farmer: `farm_name` displayed
- Vet: `specialization` displayed
- Admin: Basic profile only
- All from CustomUser model

### 5. Security
- JWT authentication required
- Users can only access own profile
- Password change requires old password
- Image validation for size and format

## Testing the API

### Using cURL

**Get Profile:**
```bash
curl -X GET http://localhost:8000/api/v1/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Profile:**
```bash
curl -X PATCH http://localhost:8000/api/v1/profile/update/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio": "New bio", "location": "Kathmandu"}'
```

**Change Password:**
```bash
curl -X POST http://localhost:8000/api/v1/profile/change-password/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "old123",
    "new_password": "new456",
    "confirm_password": "new456"
  }'
```

### Using Swagger UI
Navigate to: `http://localhost:8000/swagger/`

### Using Django Admin
Navigate to: `http://localhost:8000/admin/userprofile/userprofile/`

## Frontend Integration (NOT YET)

**IMPORTANT:** As per requirements, DO NOT integrate with frontend yet. This is backend-only implementation.

When ready to integrate:
1. Create API service functions in `Frontend/src/services/api.js`
2. Update ProfilePage components to call backend APIs
3. Handle authentication tokens
4. Implement image upload
5. Add error handling

## Common Issues & Solutions

### Issue: Profile not created automatically
**Solution:** Check if signals are imported in `apps.py`

### Issue: Image upload fails
**Solution:** 
- Check MEDIA_ROOT and MEDIA_URL in settings
- Ensure media directory exists
- Check file size and format validation

### Issue: Cannot update username/email
**Solution:** These fields are read-only by design. They're from CustomUser and should not be modified via profile API.

### Issue: 401 Unauthorized
**Solution:** 
- Check JWT token is valid
- Include token in Authorization header
- Token format: `Bearer <token>`

## Next Steps

1. ✅ Backend API created
2. ✅ Models and serializers defined
3. ✅ Views and URLs configured
4. ✅ Admin interface set up
5. ⏳ Run migrations
6. ⏳ Test API endpoints
7. ⏳ Frontend integration (when ready)

## Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for endpoint details
2. Review Django logs for errors
3. Test with Swagger UI or Postman
4. Check database migrations are applied

## License

Part of LivestockHub project.
