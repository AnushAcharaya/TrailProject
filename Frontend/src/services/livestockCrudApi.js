import axios from 'axios';

// Base URL for livestock API
const API_BASE_URL = 'http://localhost:8000/api/v1/livestock';

// Create axios instance with default config
const livestockApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include JWT token
livestockApi.interceptors.request.use(
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
livestockApi.interceptors.response.use(
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

// ============= LIVESTOCK CRUD OPERATIONS =============

// Get all livestock for the authenticated user
export const getAllLivestock = async (params = {}) => {
  try {
    const response = await livestockApi.get('/livestock/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch livestock.' }
    };
  }
};

// Get single livestock by ID
export const getLivestockById = async (id) => {
  try {
    const response = await livestockApi.get(`/livestock/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch livestock details.' }
    };
  }
};

// Create new livestock
export const createLivestock = async (formData) => {
  try {
    const data = new FormData();
    
    // Append all required fields
    data.append('tag_id', formData.tag_id);
    data.append('species', formData.species);
    data.append('breed', formData.breed);
    data.append('date_of_birth', formData.date_of_birth);
    data.append('gender', formData.gender);
    
    // Append optional fields if they exist
    if (formData.color) data.append('color', formData.color);
    if (formData.weight) data.append('weight', formData.weight);
    if (formData.health_status) data.append('health_status', formData.health_status);
    if (formData.purchase_date) data.append('purchase_date', formData.purchase_date);
    if (formData.purchase_price) data.append('purchase_price', formData.purchase_price);
    if (formData.remarks) data.append('remarks', formData.remarks);
    if (formData.pen_location) data.append('pen_location', formData.pen_location);
    
    // Append image if exists
    if (formData.image && formData.image instanceof File) {
      data.append('image', formData.image);
    }
    
    const response = await livestockApi.post('/livestock/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to create livestock.' }
    };
  }
};

// Update existing livestock
export const updateLivestock = async (id, formData) => {
  try {
    const data = new FormData();
    
    // Append all required fields
    data.append('tag_id', formData.tag_id);
    data.append('species', formData.species);
    data.append('breed', formData.breed);
    data.append('date_of_birth', formData.date_of_birth);
    data.append('gender', formData.gender);
    
    // Append optional fields if they exist
    if (formData.color) data.append('color', formData.color);
    if (formData.weight) data.append('weight', formData.weight);
    if (formData.health_status) data.append('health_status', formData.health_status);
    if (formData.purchase_date) data.append('purchase_date', formData.purchase_date);
    if (formData.purchase_price) data.append('purchase_price', formData.purchase_price);
    if (formData.remarks) data.append('remarks', formData.remarks);
    if (formData.pen_location) data.append('pen_location', formData.pen_location);
    
    // Append image if exists and is a new file
    if (formData.image && formData.image instanceof File) {
      data.append('image', formData.image);
    }
    
    const response = await livestockApi.put(`/livestock/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to update livestock.' }
    };
  }
};

// Delete livestock
export const deleteLivestock = async (id) => {
  try {
    await livestockApi.delete(`/livestock/${id}/`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to delete livestock.' }
    };
  }
};

// ============= SPECIES OPERATIONS =============

// Get all species
export const getAllSpecies = async () => {
  try {
    const response = await livestockApi.get('/species/');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch species.' }
    };
  }
};

// Create new species
export const createSpecies = async (name) => {
  try {
    const response = await livestockApi.post('/species/', { name });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to create species.' }
    };
  }
};

// ============= BREED OPERATIONS =============

// Get all breeds (optionally filter by species)
export const getAllBreeds = async (speciesId = null) => {
  try {
    const params = speciesId ? { species: speciesId } : {};
    const response = await livestockApi.get('/breeds/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to fetch breeds.' }
    };
  }
};

// Create new breed
export const createBreed = async (name, speciesId) => {
  try {
    const response = await livestockApi.post('/breeds/', {
      name,
      species: speciesId
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Failed to create breed.' }
    };
  }
};

export default livestockApi;
