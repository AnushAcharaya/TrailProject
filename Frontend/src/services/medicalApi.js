// src/services/medicalApi.js
import axios from 'axios';

// Create a separate axios instance for medical API (not using auth base URL)
const medicalApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1/medical',
});

// Add request interceptor to include JWT token
medicalApi.interceptors.request.use(
  (config) => {
    // Prioritize sessionStorage (tab-specific) over localStorage (shared across tabs)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    console.log('[MedicalAPI] Token from sessionStorage/localStorage:', token ? 'exists' : 'missing');
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
medicalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[MedicalAPI] 401 Unauthorized - Token may be expired or invalid');
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const BASE_URL = '/treatments';

// Get all treatments
export const getAllTreatments = async () => {
  try {
    const response = await medicalApi.get(BASE_URL + '/');
    console.log('[MedicalAPI] ========== GET TREATMENTS ==========');
    console.log('[MedicalAPI] Full response:', response.data);
    console.log('[MedicalAPI] Results array:', response.data.results);
    console.log('[MedicalAPI] Total count:', response.data.count);
    
    if (response.data.results && response.data.results.length > 0) {
      const firstTreatment = response.data.results[0];
      console.log('[MedicalAPI] First treatment full object:', firstTreatment);
      console.log('[MedicalAPI] First treatment ID:', firstTreatment.id);
      console.log('[MedicalAPI] First treatment name:', firstTreatment.treatment_name);
      console.log('[MedicalAPI] First treatment medicines field:', firstTreatment.medicines);
      console.log('[MedicalAPI] Medicines is array?', Array.isArray(firstTreatment.medicines));
      console.log('[MedicalAPI] Medicines length:', firstTreatment.medicines?.length);
      
      if (firstTreatment.medicines && firstTreatment.medicines.length > 0) {
        console.log('[MedicalAPI] First medicine object:', firstTreatment.medicines[0]);
        console.log('[MedicalAPI] Medicine names:', firstTreatment.medicines.map(m => m.name));
      } else {
        console.warn('[MedicalAPI] ⚠️ Medicines array is empty or undefined!');
      }
    } else {
      console.warn('[MedicalAPI] ⚠️ No treatments found in response!');
    }
    console.log('[MedicalAPI] =====================================');
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[MedicalAPI] Error fetching treatments:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Get treatment by ID
export const getTreatmentById = async (id) => {
  try {
    const response = await medicalApi.get(`${BASE_URL}/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Create new treatment
export const createTreatment = async (treatmentData) => {
  try {
    console.log('[MedicalAPI] ========== CREATE TREATMENT ==========');
    console.log('[MedicalAPI] Input treatmentData:', treatmentData);
    console.log('[MedicalAPI] treatmentData.medicines:', treatmentData.medicines);
    console.log('[MedicalAPI] medicines length:', treatmentData.medicines?.length);
    
    const formData = new FormData();
    
    // Add basic fields
    formData.append('livestock_tag', treatmentData.livestockTag);
    formData.append('treatment_name', treatmentData.treatmentName);
    formData.append('diagnosis', treatmentData.diagnosis);
    formData.append('vet_name', treatmentData.vetName);
    formData.append('treatment_date', treatmentData.treatmentDate);
    formData.append('status', treatmentData.status);
    
    if (treatmentData.nextTreatmentDate) {
      formData.append('next_treatment_date', treatmentData.nextTreatmentDate);
    }
    
    if (treatmentData.document) {
      formData.append('document', treatmentData.document);
    }
    
    // Convert medicines from camelCase to snake_case
    if (treatmentData.medicines && treatmentData.medicines.length > 0) {
      const medicinesSnakeCase = treatmentData.medicines.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        schedule_type: med.scheduleType,
        start_time: med.startTime,
        interval_hours: med.intervalHours,
        exact_times: med.exactTimes
      }));
      console.log('[MedicalAPI] Medicines (snake_case):', medicinesSnakeCase);
      console.log('[MedicalAPI] Medicines JSON string:', JSON.stringify(medicinesSnakeCase));
      formData.append('medicines', JSON.stringify(medicinesSnakeCase));
    } else {
      console.warn('[MedicalAPI] ⚠️ NO MEDICINES TO SEND!');
    }
    
    // Log FormData contents
    console.log('[MedicalAPI] FormData contents:');
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
    console.log('[MedicalAPI] =====================================');
    
    const response = await medicalApi.post(BASE_URL + '/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('[MedicalAPI] Treatment created successfully:', response.data);
    console.log('[MedicalAPI] Response medicines:', response.data.medicines);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[MedicalAPI] Create treatment error:', error);
    console.error('[MedicalAPI] Error response:', error.response?.data);
    console.error('[MedicalAPI] Error status:', error.response?.status);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Update treatment
export const updateTreatment = async (id, treatmentData) => {
  try {
    const formData = new FormData();
    
    formData.append('livestock_tag', treatmentData.livestockTag);
    formData.append('treatment_name', treatmentData.treatmentName);
    formData.append('diagnosis', treatmentData.diagnosis);
    formData.append('vet_name', treatmentData.vetName);
    formData.append('treatment_date', treatmentData.treatmentDate);
    formData.append('status', treatmentData.status);
    
    if (treatmentData.nextTreatmentDate) {
      formData.append('next_treatment_date', treatmentData.nextTreatmentDate);
    }
    
    if (treatmentData.document) {
      formData.append('document', treatmentData.document);
    }
    
    // Convert medicines from camelCase to snake_case
    if (treatmentData.medicines && treatmentData.medicines.length > 0) {
      const medicinesSnakeCase = treatmentData.medicines.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        schedule_type: med.scheduleType,
        start_time: med.startTime,
        interval_hours: med.intervalHours,
        exact_times: med.exactTimes
      }));
      formData.append('medicines', JSON.stringify(medicinesSnakeCase));
    }
    
    const response = await medicalApi.put(`${BASE_URL}/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Delete treatment
export const deleteTreatment = async (id) => {
  try {
    await medicalApi.delete(`${BASE_URL}/${id}/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Get treatment counts
export const getTreatmentCounts = async () => {
  try {
    const response = await medicalApi.get(`${BASE_URL}/counts/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Get alerts (categorized by days)
export const getTreatmentAlerts = async () => {
  try {
    const response = await medicalApi.get(`${BASE_URL}/alerts/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

// Get active tracking treatments
export const getActiveTrackingTreatments = async () => {
  try {
    const response = await medicalApi.get(`${BASE_URL}/active_tracking/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};
