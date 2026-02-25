import axios from 'axios';

// Base URL for vaccination API
const API_BASE_URL = 'http://localhost:8000/api/v1/vaccination';

// Create axios instance with default config
const vaccinationApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include JWT token
vaccinationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
vaccinationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= VACCINATION CRUD OPERATIONS =============

// Get all vaccinations for the authenticated user
export const getAllVaccinations = async () => {
  try {
    const response = await vaccinationApi.get('/');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch vaccinations.' }
    };
  }
};

// Get vaccination counts for tabs
export const getVaccinationCounts = async () => {
  try {
    const response = await vaccinationApi.get('/counts/');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch vaccination counts.' }
    };
  }
};

// Get upcoming vaccinations
export const getUpcomingVaccinations = async () => {
  try {
    const response = await vaccinationApi.get('/upcoming/');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch upcoming vaccinations.' }
    };
  }
};

// Get overdue vaccinations
export const getOverdueVaccinations = async () => {
  try {
    const response = await vaccinationApi.get('/overdue/');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch overdue vaccinations.' }
    };
  }
};

// Get completed vaccinations
export const getCompletedVaccinations = async () => {
  try {
    const response = await vaccinationApi.get('/completed/');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch completed vaccinations.' }
    };
  }
};

// Get single vaccination by ID
export const getVaccinationById = async (id) => {
  try {
    const response = await vaccinationApi.get(`/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch vaccination details.' }
    };
  }
};

// Create new vaccination
export const createVaccination = async (formData) => {
  try {
    const response = await vaccinationApi.post('/', {
      livestock_tag: formData.livestock,
      vaccine_name: formData.vaccineName,
      vaccine_type: formData.vaccineType,
      date_given: formData.dateGiven,
      next_due_date: formData.nextDueDate,
      notes: formData.notes || '',
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to create vaccination.' }
    };
  }
};

// Update existing vaccination
export const updateVaccination = async (id, formData) => {
  try {
    const response = await vaccinationApi.put(`/${id}/`, {
      livestock_tag: formData.livestock,
      vaccine_name: formData.vaccineName,
      vaccine_type: formData.vaccineType,
      date_given: formData.dateGiven,
      next_due_date: formData.nextDueDate,
      notes: formData.notes || '',
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to update vaccination.' }
    };
  }
};

// Delete vaccination
export const deleteVaccination = async (id) => {
  try {
    await vaccinationApi.delete(`/${id}/`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to delete vaccination.' }
    };
  }
};

export default vaccinationApi;
