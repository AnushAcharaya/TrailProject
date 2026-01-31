# Profile API - Quick Reference

## Import
```javascript
import {
  getUserProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteProfileImage,
  uploadProfileImage
} from '../services/profileApi';
```

## Quick Examples

### Get Profile
```javascript
const result = await getUserProfile();
if (result.success) {
  console.log(result.data);
}
```

### Update Bio & Location
```javascript
const result = await updateProfile({
  bio: "New bio",
  location: "Kathmandu"
});
```

### Upload Image
```javascript
const result = await updateProfile({
  profile_image: imageFile
});
```

### Change Theme
```javascript
const result = await updatePreferences({
  theme: "dark"
});
```

### Change Password
```javascript
const result = await changePassword({
  old_password: "old123",
  new_password: "new456",
  confirm_password: "new456"
});
```

### Delete Image
```javascript
const result = await deleteProfileImage();
```

## Response Format

**Success:**
```javascript
{
  success: true,
  data: { /* profile data */ }
}
```

**Error:**
```javascript
{
  success: false,
  error: { message: "Error message" }
}
```

## Profile Data Structure

```javascript
{
  // Read-only (from registration)
  username: string,
  email: string,
  full_name: string,
  phone: string,
  address: string,
  role: string,
  farm_name: string,      // farmers only
  specialization: string, // vets only
  
  // Editable
  bio: string,
  location: string,
  gender: string,
  profile_image: string,
  profile_image_url: string,
  
  // Preferences
  theme: string,
  language: string,
  email_notifications: boolean,
  push_notifications: boolean
}
```

## Common Patterns

### Load Profile on Mount
```javascript
useEffect(() => {
  const fetchProfile = async () => {
    const result = await getUserProfile();
    if (result.success) {
      setProfile(result.data);
    }
  };
  fetchProfile();
}, []);
```

### Update with Loading State
```javascript
const [loading, setLoading] = useState(false);

const handleUpdate = async (data) => {
  setLoading(true);
  const result = await updateProfile(data);
  setLoading(false);
  
  if (result.success) {
    setProfile(result.data);
    alert('Updated!');
  }
};
```

### Handle Errors
```javascript
const result = await updateProfile(data);

if (!result.success) {
  if (result.error.bio) {
    setError('bio', result.error.bio);
  }
  if (result.error.message) {
    alert(result.error.message);
  }
}
```

## Tips

- ✅ Token required (stored in localStorage)
- ✅ Can update partial fields
- ✅ Image upload uses FormData automatically
- ✅ All functions return consistent format
- ❌ Cannot update username, email, phone
- ❌ Don't forget to handle errors
