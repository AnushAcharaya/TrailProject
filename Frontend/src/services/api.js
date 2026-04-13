import axios from 'axios';

// Base URL for your Django backend
const API_BASE_URL = 'http://localhost:8000/api/v1/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add request interceptor to include JWT token
// Prioritize sessionStorage (tab-specific) over localStorage (shared across tabs)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Registration API
export const registerUser = async (formData) => {
  try {
    const data = new FormData();
    
    // Append all form fields
    data.append('username', formData.username);
    data.append('full_name', formData.fullName);
    data.append('address', formData.address);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    data.append('phone', formData.phone);
    
    // Role-specific fields
    if (formData.role === 'farmer') {
      data.append('farm_name', formData.farmName);
      if (formData.nidPhoto) {
        data.append('nid_photo', formData.nidPhoto);
      }
    }
    
    if (formData.role === 'vet') {
      data.append('specialization', formData.specialization);
      if (formData.certificatePhoto) {
        data.append('certificate_photo', formData.certificatePhoto);
      }
    }
    
    const response = await api.post('/register/', data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Registration failed. Please try again.' }
    };
  }
};

// Email OTP Verification API
export const verifyEmailOTP = async (email, code) => {
  try {
    const response = await api.post('/verify-email/', { email, code });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Email verification failed.' }
    };
  }
};

// Phone OTP Verification API
export const verifyPhoneOTP = async (phone, code) => {
  try {
    const response = await api.post('/phone/verify-otp/', { phone, code });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Phone verification failed.' }
    };
  }
};

// Resend Email OTP
export const resendEmailOTP = async (email) => {
  try {
    const response = await api.post('/resend-verification/', { email });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to resend email OTP.' }
    };
  }
};

// Resend Phone OTP
export const resendPhoneOTP = async (phone) => {
  try {
    const response = await api.post('/phone/send-otp/', { phone });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to resend phone OTP.' }
    };
  }
};

// Login OTP APIs
export const sendLoginOTP = async (formData) => {
  try {
    const response = await api.post('/login/send-otp/', {
      email: formData.email,
      phone: formData.phone || '',
      password: formData.password,
      role: formData.role,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to send OTP.' }
    };
  }
};

export const verifyLoginOTP = async (email, emailCode, phoneCode, role) => {
  try {
    const response = await api.post('/login/verify-otp/', {
      email,
      email_code: emailCode,
      phone_code: phoneCode || '',
      role,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'OTP verification failed.' }
    };
  }
};

// Admin APIs
export const fetchAllUsers = async () => {
  try {
    // Prioritize sessionStorage (tab-specific) over localStorage (shared across tabs)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await api.get('/admin/users/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch users.' }
    };
  }
};

export const fetchAdminDashboardStats = async () => {
  try {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await api.get('/admin/dashboard/stats/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch dashboard stats.' }
    };
  }
};

export const approveUser = async (userId) => {
  try {
    // Prioritize sessionStorage (tab-specific) over localStorage (shared across tabs)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await api.post(`/admin/users/${userId}/approve/`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to approve user.' }
    };
  }
};

export const declineUser = async (userId) => {
  try {
    // Prioritize sessionStorage (tab-specific) over localStorage (shared across tabs)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await api.post(`/admin/users/${userId}/decline/`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to decline user.' }
    };
  }
};

// Password Reset APIs
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password/', { email }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to send reset token.' }
    };
  }
};

export const verifyResetToken = async (email, token) => {
  try {
    const response = await api.post('/verify-token/', { email, token }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Invalid or expired token.' }
    };
  }
};

export const resetPassword = async (email, token, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/reset-password/', {
      email,
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to reset password.' }
    };
  }
};

export default api;
