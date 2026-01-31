# User Profile Backend - Quick Start Guide

## 🚀 Setup (3 Steps)

### Step 1: Run Migrations
```bash
python manage.py makemigrations userprofile
python manage.py migrate
```

### Step 2: Start Server
```bash
python manage.py runserver
```

### Step 3: Test API
Get your JWT token from login, then:
```bash
curl -X GET http://localhost:8000/api/v1/profile/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📍 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/profile/` | GET | Get profile |
| `/api/v1/profile/update/` | PATCH | Update profile |
| `/api/v1/profile/preferences/` | PATCH | Update settings |
| `/api/v1/profile/change-password/` | POST | Change password |
| `/api/v1/profile/delete-image/` | DELETE | Delete image |

## 📝 Quick Test Examples

### Get Profile
```bash
curl http://localhost:8000/api/v1/profile/ \
  -H "Authorization: Bearer TOKEN"
```

### Update Bio
```bash
curl -X PATCH http://localhost:8000/api/v1/profile/update/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio": "My new bio"}'
```

### Change Theme
```bash
curl -X PATCH http://localhost:8000/api/v1/profile/preferences/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme": "dark"}'
```

### Change Password
```bash
curl -X POST http://localhost:8000/api/v1/profile/change-password/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "old123",
    "new_password": "new456",
    "confirm_password": "new456"
  }'
```

## ✅ What's Implemented

- ✅ Complete backend API
- ✅ User profile management
- ✅ Password change
- ✅ Preferences/settings
- ✅ Image upload/delete
- ✅ Auto-create profile on registration
- ✅ JWT authentication
- ✅ User data isolation
- ✅ Admin interface
- ✅ Complete documentation

## 📚 Documentation Files

- `userprofile/API_DOCUMENTATION.md` - Complete API reference
- `userprofile/README.md` - Detailed setup guide
- `userprofile/IMPLEMENTATION_SUMMARY.md` - Implementation details

## 🔐 Security

- JWT authentication required
- Users can only access own profile
- Password change requires old password
- Image validation
- Read-only registration fields

## 📦 What You Get

### From Registration (Read-Only)
- username, email, full_name
- phone, address, role
- farm_name (farmers)
- specialization (vets)

### Editable in Profile
- bio, location, gender
- profile_image
- theme, language
- email/push notifications

## ⚠️ Remember

1. **Run migrations first!**
2. **Use valid JWT token** in Authorization header
3. **DO NOT integrate frontend yet** (as per requirements)
4. **Test with Postman/cURL** before frontend integration

## 🎯 Next Steps

1. Run migrations ✓
2. Test API endpoints ✓
3. Verify auto-profile creation ✓
4. Check admin interface ✓
5. Frontend integration (later)

## 💡 Tips

- Use Swagger UI: `http://localhost:8000/swagger/`
- Check admin: `http://localhost:8000/admin/userprofile/userprofile/`
- Profile auto-creates when user registers
- All endpoints return full profile data

---

**That's it! Your backend is ready to use.** 🎉
