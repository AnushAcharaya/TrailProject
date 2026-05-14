import axios from 'axios';

const farmerDashboardApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

farmerDashboardApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getFarmerDashboardStats = async () => {
  try {
    const response = await farmerDashboardApi.get('/api/v1/profile/farmer/dashboard/stats/');
    return { success: true, data: response.data.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

export const getFarmerDashboardCharts = async () => {
  try {
    const response = await farmerDashboardApi.get('/api/v1/profile/farmer/dashboard/charts/');
    return { success: true, data: response.data.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

export const getFarmerDashboardActivities = async () => {
  try {
    const response = await farmerDashboardApi.get('/api/v1/profile/farmer/dashboard/activities/');
    return { success: true, data: response.data.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};
