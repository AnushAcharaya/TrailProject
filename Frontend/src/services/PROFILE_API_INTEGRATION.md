# Profile API Integration Guide

## Overview
This file (`profileApi.js`) provides frontend service functions to integrate with the Django backend profile API. All functions handle authentication, error handling, and data formatting.

## Base URL
```javascript
const PROFILE_API_BASE_URL = 'http://localhost:8000/api/v1/profile';
```

## Authentication
All API calls require a JWT token stored in localStorage:
```javascript
const token = localStorage.getItem('token');
```

The token is automatically included in request headers by helper functions.

---

## Available Functions

### 1. getUserProfile()
Retrieves the complete profile for the logged-in user.

**Usage:**
```javascript
import { getUserProfile } from '../services/profileApi';

const fetchProfile = async () => {
  const result = await getUserProfile();
  
  if (result.success) {
    console.log('Profile data:', result.data);
    // result.data contains:
    // - username, email, full_name, phone, address, role (from registration)
    // - bio, location, gender, profile_image (editable)
    // - theme, language, notifications (preferences)
  } else {
    console.error('Error:', result.error);
  }
};
```

**Response Structure:**
```javascript
{
  success: true,
  data: {
    // From CustomUser (read-only)
    username: "john_doe",
    email: "john@example.com",
    full_name: "John Doe",
    phone: "+977-9800000000",
    address: "Kathmandu, Nepal",
    role: "farmer",
    status: "approved",
    date_joined: "2024-01-15T10:30:00Z",
    farm_name: "Green Valley Farm",  // Only for farmers
    specialization: null,  // Only for vets
    
    // From UserProfile (editable)
    bio: "Full-stack developer",
    location: "Kathmandu, Nepal",
    gender: "male",
    profile_image: "/media/profile_images/john.jpg",
    profile_image_url: "http://localhost:8000/media/profile_images/john.jpg",
    theme: "light",
    language: "en",
    email_notifications: true,
    push_notifications: false,
    
    // Metadata
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z"
  }
}
```

---

### 2. updateProfile(profileData)
Updates editable profile fields (bio, location, gender, profile_image).

**Parameters:**
```javascript
{
  bio: string,              // Optional
  location: string,         // Optional
  gender: string,           // Optional: "male", "female", "other"
  profile_image: File       // Optional: Image file
}
```

**Usage:**
```javascript
import { updateProfile } from '../services/profileApi';

const handleUpdateProfile = async () => {
  const profileData = {
    bio: "Updated bio text",
    location: "Pokhara, Nepal",
    gender: "male"
  };
  
  const result = await updateProfile(profileData);
  
  if (result.success) {
    console.log('Profile updated:', result.data);
    // result.data contains the complete updated profile
  } else {
    console.error('Error:', result.error);
  }
};
```

**With Image Upload:**
```javascript
const handleImageUpload = async (imageFile) => {
  const profileData = {
    profile_image: imageFile  // File object from input
  };
  
  const result = await updateProfile(profileData);
  
  if (result.success) {
    console.log('Image uploaded:', result.data.profile_image_url);
  }
};
```

---

### 3. updatePreferences(preferences)
Updates user preferences/settings.

**Parameters:**
```javascript
{
  theme: string,                    // Optional: "light" or "dark"
  language: string,                 // Optional: "en" or "np"
  email_notifications: boolean,     // Optional
  push_notifications: boolean       // Optional
}
```

**Usage:**
```javascript
import { updatePreferences } from '../services/profileApi';

const handleThemeChange = async (newTheme) => {
  const result = await updatePreferences({ theme: newTheme });
  
  if (result.success) {
    console.log('Theme updated:', result.data.theme);
  }
};

const handleNotificationToggle = async () => {
  const result = await updatePreferences({
    email_notifications: false,
    push_notifications: true
  });
  
  if (result.success) {
    console.log('Notifications updated');
  }
};
```

---

### 4. changePassword(passwordData)
Changes the user's password with validation.

**Parameters:**
```javascript
{
  old_password: string,      // Required: Current password
  new_password: string,      // Required: New password (min 8 chars)
  confirm_password: string   // Required: Must match new_password
}
```

**Usage:**
```javascript
import { changePassword } from '../services/profileApi';

const handlePasswordChange = async () => {
  const passwordData = {
    old_password: "currentPassword123",
    new_password: "newPassword456",
    confirm_password: "newPassword456"
  };
  
  const result = await changePassword(passwordData);
  
  if (result.success) {
    console.log('Password changed successfully');
    alert(result.message);
  } else {
    console.error('Error:', result.error);
    // result.error might contain field-specific errors
  }
};
```

**Error Handling:**
```javascript
if (!result.success) {
  if (result.error.old_password) {
    console.error('Old password error:', result.error.old_password);
  }
  if (result.error.new_password) {
    console.error('New password error:', result.error.new_password);
  }
  if (result.error.confirm_password) {
    console.error('Confirm password error:', result.error.confirm_password);
  }
}
```

---

### 5. deleteProfileImage()
Removes the user's profile image.

**Usage:**
```javascript
import { deleteProfileImage } from '../services/profileApi';

const handleDeleteImage = async () => {
  const confirmed = window.confirm('Are you sure you want to delete your profile image?');
  
  if (confirmed) {
    const result = await deleteProfileImage();
    
    if (result.success) {
      console.log('Image deleted');
      alert(result.message);
      // Refresh profile to show no image
    } else {
      console.error('Error:', result.error);
    }
  }
};
```

---

### 6. uploadProfileImage(imageFile)
Helper function to upload only the profile image.

**Usage:**
```javascript
import { uploadProfileImage } from '../services/profileApi';

const handleImageChange = async (event) => {
  const file = event.target.files[0];
  
  if (file) {
    const result = await uploadProfileImage(file);
    
    if (result.success) {
      console.log('Image uploaded:', result.data.profile_image_url);
      // Update UI with new image URL
    } else {
      console.error('Error:', result.error);
    }
  }
};
```

---

## Integration with React Components

### Example: ProfilePage Component

```javascript
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateProfile, updatePreferences, changePassword } from '../services/profileApi';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await getUserProfile();
    
    if (result.success) {
      setProfile(result.data);
      setError(null);
    } else {
      setError(result.error.message || 'Failed to load profile');
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (updatedData) => {
    const result = await updateProfile(updatedData);
    
    if (result.success) {
      setProfile(result.data);
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
    }
  };

  const handlePreferencesUpdate = async (preferences) => {
    const result = await updatePreferences(preferences);
    
    if (result.success) {
      setProfile(result.data);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
      {/* Add more profile display and edit components */}
    </div>
  );
};

export default ProfilePage;
```

### Example: ProfileTab Component

```javascript
import React, { useState } from 'react';
import { updateProfile } from '../services/profileApi';

const ProfileTab = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    bio: user.bio || '',
    location: user.location || '',
    gender: user.gender || ''
  });
  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleSave = async () => {
    const profileData = { ...form };
    
    if (profileImage) {
      profileData.profile_image = profileImage;
    }
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      onUpdate(result.data);
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        placeholder="Bio"
      />
      <input
        type="text"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        placeholder="Location"
      />
      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default ProfileTab;
```

### Example: PasswordTab Component

```javascript
import React, { useState } from 'react';
import { changePassword } from '../services/profileApi';

const PasswordTab = () => {
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});

  const handlePasswordChange = async () => {
    const result = await changePassword(passwords);
    
    if (result.success) {
      alert('Password changed successfully!');
      setPasswords({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      setErrors({});
    } else {
      if (typeof result.error === 'object') {
        setErrors(result.error);
      } else {
        alert(result.error.message || 'Failed to change password');
      }
    }
  };

  return (
    <div>
      <input
        type="password"
        value={passwords.old_password}
        onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
        placeholder="Current Password"
      />
      {errors.old_password && <span className="error">{errors.old_password}</span>}
      
      <input
        type="password"
        value={passwords.new_password}
        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
        placeholder="New Password"
      />
      {errors.new_password && <span className="error">{errors.new_password}</span>}
      
      <input
        type="password"
        value={passwords.confirm_password}
        onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
        placeholder="Confirm New Password"
      />
      {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
      
      <button onClick={handlePasswordChange}>Change Password</button>
    </div>
  );
};

export default PasswordTab;
```

### Example: SettingsTab Component

```javascript
import React from 'react';
import { updatePreferences } from '../services/profileApi';

const SettingsTab = ({ preferences, onUpdate }) => {
  const handleThemeToggle = async () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    const result = await updatePreferences({ theme: newTheme });
    
    if (result.success) {
      onUpdate(result.data);
    }
  };

  const handleLanguageToggle = async () => {
    const newLanguage = preferences.language === 'en' ? 'np' : 'en';
    const result = await updatePreferences({ language: newLanguage });
    
    if (result.success) {
      onUpdate(result.data);
    }
  };

  const handleNotificationToggle = async (type) => {
    const updates = {
      [type]: !preferences[type]
    };
    const result = await updatePreferences(updates);
    
    if (result.success) {
      onUpdate(result.data);
    }
  };

  return (
    <div>
      <div>
        <label>Theme: {preferences.theme}</label>
        <button onClick={handleThemeToggle}>Toggle Theme</button>
      </div>
      
      <div>
        <label>Language: {preferences.language}</label>
        <button onClick={handleLanguageToggle}>Toggle Language</button>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={preferences.email_notifications}
            onChange={() => handleNotificationToggle('email_notifications')}
          />
          Email Notifications
        </label>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={preferences.push_notifications}
            onChange={() => handleNotificationToggle('push_notifications')}
          />
          Push Notifications
        </label>
      </div>
    </div>
  );
};

export default SettingsTab;
```

---

## Error Handling

All functions return a consistent response format:

**Success:**
```javascript
{
  success: true,
  data: { /* profile data */ }  // or message for password change
}
```

**Error:**
```javascript
{
  success: false,
  error: {
    message: "Error message",
    // or field-specific errors
    field_name: ["Error for this field"]
  }
}
```

**Example Error Handling:**
```javascript
const result = await updateProfile(data);

if (!result.success) {
  if (result.error.bio) {
    console.error('Bio error:', result.error.bio);
  }
  if (result.error.message) {
    console.error('General error:', result.error.message);
  }
}
```

---

## Important Notes

1. **Authentication Required:** All functions require a valid JWT token in localStorage
2. **Token Format:** Token is stored as `localStorage.getItem('token')`
3. **Read-Only Fields:** Cannot update username, email, phone, etc. via profile API
4. **Image Upload:** Use FormData for image uploads (handled automatically)
5. **Partial Updates:** Can update only specific fields, don't need to send all fields
6. **Role-Specific Data:** `farm_name` only for farmers, `specialization` only for vets

---

## Testing

### Test with Browser Console:
```javascript
// Import in your component
import * as profileApi from '../services/profileApi';

// Test get profile
profileApi.getUserProfile().then(console.log);

// Test update profile
profileApi.updateProfile({ bio: 'Test bio' }).then(console.log);

// Test update preferences
profileApi.updatePreferences({ theme: 'dark' }).then(console.log);
```

---

## Next Steps

1. ✅ Backend API created
2. ✅ Frontend service functions created
3. ⏳ Update ProfilePage.jsx to use real API
4. ⏳ Update ProfileTab.jsx to use real API
5. ⏳ Update PasswordTab.jsx to use real API
6. ⏳ Update SettingsTab.jsx to use real API
7. ⏳ Test complete flow

---

## Support

For issues:
1. Check browser console for errors
2. Verify JWT token exists in localStorage
3. Check network tab for API responses
4. Review backend API documentation
5. Ensure backend server is running
