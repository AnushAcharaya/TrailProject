import axios from 'axios';

// Base URL for profile API
const PROFILE_API_BASE_URL = 'http://localhost:8000/api/v1/profile';

// Create axios instance for profile API
const profileApi = axios.create({
  baseURL: PROFILE_API_BASE_URL,
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Helper function to get auth headers for JSON
const getAuthHeadersJSON = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to get auth headers for multipart/form-data
const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };
};

/**
 * Get User Profile
 * Retrieves the complete profile for the logged-in user
 * Combines data from CustomUser (registration) and UserProfile
 */
export const getUserProfile = async () => {
  try {
    const response = await profileApi.get('/', {
      headers: getAuthHeadersJSON(),
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch profile.' }
    };
  }
};

/**
 * Update Profile Information
 * Updates editable profile fields: bio, location, gender, profile_image
 * Cannot update CustomUser fields (username, email, phone, etc.)
 * 
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.bio - User biography
 * @param {string} profileData.location - User location
 * @param {string} profileData.gender - User gender (male/female/other)
 * @param {File} profileData.profile_image - Profile image file (optional)
 */
export const updateProfile = async (profileData) => {
  try {
    const formData = new FormData();
    
    // Append text fields if they exist
    if (profileData.bio !== undefined) {
      formData.append('bio', profileData.bio);
    }
    if (profileData.location !== undefined) {
      formData.append('location', profileData.location);
    }
    if (profileData.gender !== undefined) {
      formData.append('gender', profileData.gender);
    }
    
    // Append image file if provided
    if (profileData.profile_image instanceof File) {
      formData.append('profile_image', profileData.profile_image);
    }
    
    const response = await profileApi.patch('/update/', formData, {
      headers: getAuthHeadersMultipart(),
    });
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.response?.data?.errors || error.response?.data || { message: 'Failed to update profile.' }
    };
  }
};

/**
 * Update User Preferences/Settings
 * Updates preference fields: theme, language, email_notifications, push_notifications
 * 
 * @param {Object} preferences - Preferences to update
 * @param {string} preferences.theme - Theme (light/dark)
 * @param {string} preferences.language - Language (en/np)
 * @param {boolean} preferences.email_notifications - Email notifications enabled
 * @param {boolean} preferences.push_notifications - Push notifications enabled
 */
export const updatePreferences = async (preferences) => {
  try {
    const response = await profileApi.patch('/preferences/', preferences, {
      headers: getAuthHeadersJSON(),
    });
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Update preferences error:', error);
    return {
      success: false,
      error: error.response?.data?.errors || error.response?.data || { message: 'Failed to update preferences.' }
    };
  }
};

/**
 * Change Password
 * Changes the user's password with validation
 * 
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.old_password - Current password
 * @param {string} passwordData.new_password - New password (min 8 chars)
 * @param {string} passwordData.confirm_password - Confirm new password
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await profileApi.post('/change-password/', passwordData, {
      headers: getAuthHeadersJSON(),
    });
    
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.errors || { message: 'Failed to change password.' }
    };
  }
};

/**
 * Delete Profile Image
 * Removes the user's profile image
 */
export const deleteProfileImage = async () => {
  try {
    const response = await profileApi.delete('/delete-image/', {
      headers: getAuthHeadersJSON(),
    });
    
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error('Delete profile image error:', error);
    return {
      success: false,
      error: error.response?.data?.error || { message: 'Failed to delete profile image.' }
    };
  }
};

/**
 * Upload Profile Image Only
 * Helper function to upload just the profile image
 * 
 * @param {File} imageFile - Image file to upload
 */
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    
    const response = await profileApi.patch('/update/', formData, {
      headers: getAuthHeadersMultipart(),
    });
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Upload profile image error:', error);
    return {
      success: false,
      error: error.response?.data?.errors || error.response?.data || { message: 'Failed to upload profile image.' }
    };
  }
};

export default profileApi;
