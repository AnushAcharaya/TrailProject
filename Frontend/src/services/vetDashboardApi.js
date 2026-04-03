// src/services/vetDashboardApi.js
import axios from 'axios';

// Create a separate axios instance for vet dashboard with correct base URL
const vetDashboardApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
vetDashboardApi.interceptors.request.use(
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

/**
 * Vet Dashboard API Service
 * Provides methods to fetch dashboard statistics, activities, and alerts
 */

/**
 * Get dashboard statistics for vet
 * @returns {Promise<{success: boolean, data?: {total_farmers: number, total_animals: number, pending_treatments: number, todays_appointments: number}, error?: string}>}
 */
export const getDashboardStats = async () => {
  try {
    const response = await vetDashboardApi.get('/api/v1/profile/vet/dashboard/stats/');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch dashboard statistics'
    };
  }
};

/**
 * Get recent activities for vet dashboard
 * @param {number} limit - Number of activities to fetch (default: 10)
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await vetDashboardApi.get(`/api/v1/profile/vet/dashboard/activities/?limit=${limit}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch recent activities'
    };
  }
};

/**
 * Get pending alerts and tasks for vet dashboard
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getPendingAlerts = async () => {
  try {
    const response = await vetDashboardApi.get('/api/v1/profile/vet/dashboard/alerts/');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching pending alerts:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch pending alerts'
    };
  }
};
