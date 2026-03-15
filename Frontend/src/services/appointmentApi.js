// Frontend/src/services/appointmentApi.js
import axios from 'axios';

// Create a separate axios instance for appointments (not using the auth base URL)
const appointmentApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
appointmentApi.interceptors.request.use((config) => {
  // Prioritize sessionStorage (tab-specific) over localStorage (shared across tabs)
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const BASE_URL = '';

/**
 * Appointment API Service
 * Handles all appointment-related API calls for farmers and vets
 */

// ==================== COMMON ENDPOINTS ====================

/**
 * Get all appointments for the current user
 * Farmers see their own appointments, Vets see appointments assigned to them
 * @param {Object} params - Query parameters (status, animal_type, search, ordering, etc.)
 * @returns {Promise} List of appointments
 */
export const getAppointments = async (params = {}) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Get a single appointment by ID
 * @param {number} id - Appointment ID
 * @returns {Promise} Appointment details
 */
export const getAppointmentById = async (id) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Get appointment statistics
 * Returns counts for upcoming, pending, completed, and cancelled appointments
 * @returns {Promise} Statistics object
 */
export const getAppointmentStats = async () => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/stats/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    throw error;
  }
};

/**
 * Search appointments
 * @param {string} query - Search query
 * @returns {Promise} Filtered appointments
 */
export const searchAppointments = async (query) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw error;
  }
};

// ==================== FARMER ENDPOINTS ====================

/**
 * Create a new appointment request (Farmer only)
 * @param {Object} appointmentData - Appointment details
 * @param {number} appointmentData.veterinarian_id - Vet ID
 * @param {string} appointmentData.animal_type - Animal type (cattle, sheep, goat, pig, poultry)
 * @param {string} appointmentData.reason - Reason for appointment
 * @param {string} appointmentData.preferred_date - Date (YYYY-MM-DD)
 * @param {string} appointmentData.preferred_time - Time (HH:MM)
 * @returns {Promise} Created appointment
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await appointmentApi.post(`${BASE_URL}/appointments/`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Cancel an appointment (Farmer only)
 * @param {number} id - Appointment ID
 * @returns {Promise} Updated appointment
 */
export const cancelAppointment = async (id) => {
  try {
    const response = await appointmentApi.post(`${BASE_URL}/appointments/${id}/cancel/`);
    return response.data;
  } catch (error) {
    console.error(`Error cancelling appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Get farmer's appointments filtered by status
 * @param {string} status - Status filter (Pending, Approved, Completed, Cancelled)
 * @returns {Promise} Filtered appointments
 */
export const getFarmerAppointmentsByStatus = async (status) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} appointments:`, error);
    throw error;
  }
};

// ==================== VET ENDPOINTS ====================

/**
 * Approve a pending appointment (Vet only)
 * @param {number} id - Appointment ID
 * @returns {Promise} Updated appointment
 */
export const approveAppointment = async (id) => {
  try {
    const response = await appointmentApi.post(`${BASE_URL}/appointments/${id}/approve/`);
    return response.data;
  } catch (error) {
    console.error(`Error approving appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Decline a pending appointment (Vet only)
 * @param {number} id - Appointment ID
 * @param {string} vetNotes - Optional notes for declining
 * @returns {Promise} Updated appointment
 */
export const declineAppointment = async (id, vetNotes = '') => {
  try {
    const response = await appointmentApi.post(`${BASE_URL}/appointments/${id}/decline/`, {
      vet_notes: vetNotes
    });
    return response.data;
  } catch (error) {
    console.error(`Error declining appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Complete an approved appointment (Vet only)
 * @param {number} id - Appointment ID
 * @param {string} vetNotes - Optional completion notes
 * @returns {Promise} Updated appointment
 */
export const completeAppointment = async (id, vetNotes = '') => {
  try {
    const response = await appointmentApi.post(`${BASE_URL}/appointments/${id}/complete/`, {
      vet_notes: vetNotes
    });
    return response.data;
  } catch (error) {
    console.error(`Error completing appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Update appointment status and notes (Vet only)
 * @param {number} id - Appointment ID
 * @param {Object} updateData - Update data
 * @param {string} updateData.status - New status
 * @param {string} updateData.vet_notes - Vet notes
 * @returns {Promise} Updated appointment
 */
export const updateAppointmentStatus = async (id, updateData) => {
  try {
    const response = await appointmentApi.patch(`${BASE_URL}/appointments/${id}/update_status/`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment ${id} status:`, error);
    throw error;
  }
};

/**
 * Get vet's appointments filtered by status
 * @param {string} status - Status filter (Pending, Approved, Completed)
 * @returns {Promise} Filtered appointments
 */
export const getVetAppointmentsByStatus = async (status) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} appointments:`, error);
    throw error;
  }
};

// ==================== FILTER & SORT ENDPOINTS ====================

/**
 * Get appointments filtered by date range
 * @param {string} dateFrom - Start date (YYYY-MM-DD)
 * @param {string} dateTo - End date (YYYY-MM-DD)
 * @returns {Promise} Filtered appointments
 */
export const getAppointmentsByDateRange = async (dateFrom, dateTo) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, {
      params: {
        date_from: dateFrom,
        date_to: dateTo
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments by date range:', error);
    throw error;
  }
};

/**
 * Get appointments filtered by animal type
 * @param {string} animalType - Animal type (cattle, sheep, goat, pig, poultry)
 * @returns {Promise} Filtered appointments
 */
export const getAppointmentsByAnimalType = async (animalType) => {
  try {
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, {
      params: { animal_type: animalType }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${animalType} appointments:`, error);
    throw error;
  }
};

/**
 * Get appointments with sorting
 * @param {string} ordering - Sort field (preferred_date, created_at, status)
 * @param {boolean} descending - Sort descending if true
 * @returns {Promise} Sorted appointments
 */
export const getSortedAppointments = async (ordering, descending = false) => {
  try {
    const orderParam = descending ? `-${ordering}` : ordering;
    const response = await appointmentApi.get(`${BASE_URL}/appointments/`, {
      params: { ordering: orderParam }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sorted appointments:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert 12-hour time format to 24-hour format
 * @param {string} time12h - Time in 12-hour format (e.g., "01:00 PM")
 * @returns {string} Time in 24-hour format (e.g., "13:00")
 */
const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

/**
 * Format appointment data for API submission
 * @param {Object} formData - Form data from frontend
 * @returns {Object} Formatted data for API
 */
export const formatAppointmentData = (formData) => {
  const preferredTime = formData.preferredTime || formData.preferred_time;
  
  return {
    veterinarian_id: formData.veterinarian || formData.veterinarian_id,
    animal_type: formData.animalType || formData.animal_type,
    reason: formData.reason,
    preferred_date: formData.preferredDate || formData.preferred_date,
    preferred_time: convertTo24Hour(preferredTime),
  };
};

/**
 * Get status badge color
 * @param {string} status - Appointment status
 * @returns {string} Color class name
 */
export const getStatusColor = (status) => {
  const colors = {
    'Pending': 'yellow',
    'Approved': 'green',
    'Completed': 'blue',
    'Cancelled': 'red',
    'Declined': 'red',
  };
  return colors[status] || 'gray';
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time for display
 * @param {string} timeString - Time string (HH:MM:SS or HH:MM)
 * @returns {string} Formatted time (12-hour format)
 */
export const formatAppointmentTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Export all functions as default object
export default {
  // Common
  getAppointments,
  getAppointmentById,
  getAppointmentStats,
  searchAppointments,
  
  // Farmer
  createAppointment,
  cancelAppointment,
  getFarmerAppointmentsByStatus,
  
  // Vet
  approveAppointment,
  declineAppointment,
  completeAppointment,
  updateAppointmentStatus,
  getVetAppointmentsByStatus,
  
  // Filters
  getAppointmentsByDateRange,
  getAppointmentsByAnimalType,
  getSortedAppointments,
  
  // Utilities
  formatAppointmentData,
  getStatusColor,
  formatAppointmentDate,
  formatAppointmentTime,
};
