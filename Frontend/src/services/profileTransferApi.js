// Frontend/src/services/profileTransferApi.js
import axios from 'axios';

// Create a separate axios instance for profile transfer with correct base URL
const profileTransferApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
profileTransferApi.interceptors.request.use(
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
profileTransferApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const BASE_URL = '/profile-transfer';

/**
 * Profile Transfer API Service
 * Handles all livestock ownership transfer API calls
 */

// ============================================
// TRANSFER CRUD OPERATIONS
// ============================================

/**
 * Get all transfers for current user
 * Farmers see their sent and received transfers
 * Admins see all transfers
 * @param {Object} params - Query parameters
 * @returns {Promise} List of transfers
 */
export const getTransfers = async (params = {}) => {
  try {
    console.log('Fetching transfers...');
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/`, { params });
    console.log('Transfers fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transfers:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get transfer by ID
 * @param {number} transferId - Transfer ID
 * @returns {Promise} Transfer details
 */
export const getTransferById = async (transferId) => {
  try {
    console.log(`Fetching transfer ${transferId}...`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/${transferId}/`);
    console.log('Transfer fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transfer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create new transfer request (Farmer - Sender)
 * @param {Object} transferData - Transfer data
 * @param {number} transferData.livestock - Livestock ID
 * @param {number} transferData.receiver - Receiver farmer ID
 * @param {string} transferData.reason - Transfer reason
 * @param {File} transferData.supporting_document - Optional supporting document
 * @returns {Promise} Created transfer
 */
export const createTransfer = async (transferData) => {
  try {
    console.log('Creating transfer:', transferData);
    
    // If there's a file, use FormData
    if (transferData.supporting_document instanceof File) {
      const formData = new FormData();
      Object.keys(transferData).forEach(key => {
        formData.append(key, transferData[key]);
      });
      
      const response = await profileTransferApi.post(`${BASE_URL}/transfers/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Transfer created:', response.data);
      return response.data;
    }
    
    // Otherwise use regular JSON
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/`, transferData);
    console.log('Transfer created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating transfer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update transfer (Sender only, pending transfers)
 * @param {number} transferId - Transfer ID
 * @param {Object} transferData - Updated transfer data
 * @returns {Promise} Updated transfer
 */
export const updateTransfer = async (transferId, transferData) => {
  try {
    console.log(`Updating transfer ${transferId}:`, transferData);
    const response = await profileTransferApi.patch(`${BASE_URL}/transfers/${transferId}/`, transferData);
    console.log('Transfer updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating transfer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete transfer (Sender only, pending transfers)
 * @param {number} transferId - Transfer ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteTransfer = async (transferId) => {
  try {
    console.log(`Deleting transfer ${transferId}...`);
    const response = await profileTransferApi.delete(`${BASE_URL}/transfers/${transferId}/`);
    console.log('Transfer deleted');
    return response.data;
  } catch (error) {
    console.error('Error deleting transfer:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// FARMER (SENDER) ENDPOINTS
// ============================================

/**
 * Get sent transfers (Farmer - Sender)
 * @param {Object} params - Query parameters
 * @returns {Promise} List of sent transfers
 */
export const getSentTransfers = async (params = {}) => {
  try {
    console.log('Fetching sent transfers...');
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/sent/`, { params });
    console.log('Sent transfers fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent transfers:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Cancel transfer (Farmer - Sender, pending only)
 * @param {number} transferId - Transfer ID
 * @returns {Promise} Cancellation confirmation
 */
export const cancelTransfer = async (transferId) => {
  try {
    console.log(`Cancelling transfer ${transferId}...`);
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/${transferId}/cancel/`);
    console.log('Transfer cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling transfer:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// FARMER (RECEIVER) ENDPOINTS
// ============================================

/**
 * Get received transfers (Farmer - Receiver)
 * @param {Object} params - Query parameters
 * @returns {Promise} List of received transfers
 */
export const getReceivedTransfers = async (params = {}) => {
  try {
    console.log('Fetching received transfers...');
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/received/`, { params });
    console.log('Received transfers fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching received transfers:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Receiver approves transfer
 * @param {number} transferId - Transfer ID
 * @param {string} notes - Optional notes
 * @returns {Promise} Updated transfer
 */
export const receiverApproveTransfer = async (transferId, notes = '') => {
  try {
    console.log(`Receiver approving transfer ${transferId}...`);
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/${transferId}/receiver_approve/`, {
      notes
    });
    console.log('Transfer approved by receiver:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error approving transfer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Receiver rejects transfer
 * @param {number} transferId - Transfer ID
 * @param {string} notes - Optional notes
 * @returns {Promise} Updated transfer
 */
export const receiverRejectTransfer = async (transferId, notes = '') => {
  try {
    console.log(`Receiver rejecting transfer ${transferId}...`);
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/${transferId}/receiver_reject/`, {
      notes
    });
    console.log('Transfer rejected by receiver:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting transfer:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Get transfers pending admin review (Admin only)
 * @returns {Promise} List of transfers pending admin review
 */
export const getPendingReviewTransfers = async () => {
  try {
    console.log('Fetching transfers pending admin review...');
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/pending_review/`);
    console.log('Pending review transfers fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending review transfers:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Admin approves transfer
 * @param {number} transferId - Transfer ID
 * @param {string} notes - Optional notes
 * @returns {Promise} Updated transfer
 */
export const adminApproveTransfer = async (transferId, notes = '') => {
  try {
    console.log(`Admin approving transfer ${transferId}...`);
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/${transferId}/admin_approve/`, {
      notes
    });
    console.log('Transfer approved by admin:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error admin approving transfer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Admin rejects transfer
 * @param {number} transferId - Transfer ID
 * @param {string} notes - Optional notes
 * @returns {Promise} Updated transfer
 */
export const adminRejectTransfer = async (transferId, notes = '') => {
  try {
    console.log(`Admin rejecting transfer ${transferId}...`);
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/${transferId}/admin_reject/`, {
      notes
    });
    console.log('Transfer rejected by admin:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error admin rejecting transfer:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Complete transfer (Admin only)
 * Transfers livestock ownership to receiver
 * @param {number} transferId - Transfer ID
 * @returns {Promise} Completed transfer
 */
export const completeTransfer = async (transferId) => {
  try {
    console.log(`Completing transfer ${transferId}...`);
    const response = await profileTransferApi.post(`${BASE_URL}/transfers/${transferId}/complete/`);
    console.log('Transfer completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error completing transfer:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// STATISTICS & SEARCH
// ============================================

/**
 * Get transfer statistics
 * @returns {Promise} Transfer statistics
 */
export const getTransferStats = async () => {
  try {
    console.log('Fetching transfer statistics...');
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/stats/`);
    console.log('Transfer stats fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transfer stats:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search farmers for transfer
 * @param {string} searchQuery - Search query (name, email)
 * @returns {Promise} List of farmers
 */
export const searchFarmers = async (searchQuery) => {
  try {
    console.log(`Searching farmers: ${searchQuery}`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/search_farmers/`, {
      params: { q: searchQuery }
    });
    console.log('Farmer search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching farmers:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// FILTER & SORT ENDPOINTS
// ============================================

/**
 * Get transfers by status
 * @param {string} status - Transfer status
 * @returns {Promise} Filtered transfers
 */
export const getTransfersByStatus = async (status) => {
  try {
    console.log(`Fetching transfers with status: ${status}`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/`, {
      params: { status }
    });
    console.log('Transfers by status fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transfers by status:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get transfers by livestock
 * @param {number} livestockId - Livestock ID
 * @returns {Promise} Filtered transfers
 */
export const getTransfersByLivestock = async (livestockId) => {
  try {
    console.log(`Fetching transfers for livestock ${livestockId}...`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/`, {
      params: { livestock: livestockId }
    });
    console.log('Transfers by livestock fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transfers by livestock:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get transfers by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} Filtered transfers
 */
export const getTransfersByDateRange = async (startDate, endDate) => {
  try {
    console.log(`Fetching transfers from ${startDate} to ${endDate}`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/`, {
      params: {
        created_after: startDate,
        created_before: endDate
      }
    });
    console.log('Transfers by date range fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transfers by date range:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search transfers
 * @param {string} searchQuery - Search query
 * @returns {Promise} Filtered transfers
 */
export const searchTransfers = async (searchQuery) => {
  try {
    console.log(`Searching transfers: ${searchQuery}`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/`, {
      params: { search: searchQuery }
    });
    console.log('Transfer search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching transfers:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get sorted transfers
 * @param {string} ordering - Sort field (created_at, updated_at, status)
 * @param {boolean} descending - Sort descending if true
 * @returns {Promise} Sorted transfers
 */
export const getSortedTransfers = async (ordering, descending = false) => {
  try {
    const orderParam = descending ? `-${ordering}` : ordering;
    console.log(`Fetching transfers sorted by: ${orderParam}`);
    const response = await profileTransferApi.get(`${BASE_URL}/transfers/`, {
      params: { ordering: orderParam }
    });
    console.log('Sorted transfers fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching sorted transfers:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format transfer data for API submission
 * @param {Object} data - Raw transfer data
 * @returns {Object} Formatted transfer data
 */
export const formatTransferData = (data) => {
  return {
    livestock: data.livestockId || data.livestock,
    receiver: data.receiverId || data.receiver,
    reason: data.reason,
    supporting_document: data.supportingDocument || data.supporting_document || null
  };
};

/**
 * Get status color for UI display
 * @param {string} status - Transfer status
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'Pending': '#f59e0b',           // Yellow
    'Receiver Approved': '#3b82f6', // Blue
    'Admin Approved': '#10b981',    // Green
    'Rejected': '#ef4444',          // Red
    'Completed': '#059669'          // Dark Green
  };
  
  return statusColors[status] || '#6b7280'; // Gray default
};

/**
 * Get status badge style
 * @param {string} status - Transfer status
 * @returns {Object} Style object with background and text colors
 */
export const getStatusBadgeStyle = (status) => {
  const styles = {
    'Pending': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    'Receiver Approved': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    'Admin Approved': {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200'
    },
    'Rejected': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    'Completed': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    }
  };
  
  return styles[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date and time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
};

/**
 * Get progress step for status
 * @param {string} status - Transfer status
 * @returns {number} Progress step (1-4)
 */
export const getProgressStep = (status) => {
  const steps = {
    'Pending': 1,
    'Receiver Approved': 2,
    'Admin Approved': 3,
    'Completed': 4,
    'Rejected': 0
  };
  
  return steps[status] || 0;
};

/**
 * Check if transfer can be cancelled
 * @param {Object} transfer - Transfer object
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if can be cancelled
 */
export const canCancelTransfer = (transfer, currentUser) => {
  return (
    transfer.status === 'Pending' &&
    transfer.sender === currentUser.id
  );
};

/**
 * Check if receiver can respond
 * @param {Object} transfer - Transfer object
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if can respond
 */
export const canReceiverRespond = (transfer, currentUser) => {
  return (
    transfer.status === 'Pending' &&
    transfer.receiver === currentUser.id
  );
};

/**
 * Check if admin can review
 * @param {Object} transfer - Transfer object
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if can review
 */
export const canAdminReview = (transfer, currentUser) => {
  return (
    transfer.status === 'Receiver Approved' &&
    (currentUser.role === 'admin' || currentUser.is_staff)
  );
};

/**
 * Check if admin can complete
 * @param {Object} transfer - Transfer object
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if can complete
 */
export const canAdminComplete = (transfer, currentUser) => {
  return (
    transfer.status === 'Admin Approved' &&
    (currentUser.role === 'admin' || currentUser.is_staff)
  );
};

/**
 * Get status icon
 * @param {string} status - Transfer status
 * @returns {string} Icon emoji or symbol
 */
export const getStatusIcon = (status) => {
  const icons = {
    'Pending': '⏳',
    'Receiver Approved': '✓',
    'Admin Approved': '✓✓',
    'Rejected': '✗',
    'Completed': '✓✓✓'
  };
  
  return icons[status] || '○';
};

/**
 * Validate transfer data before submission
 * @param {Object} data - Transfer data
 * @returns {Object} Validation result {valid: boolean, errors: array}
 */
export const validateTransferData = (data) => {
  const errors = [];
  
  if (!data.livestock && !data.livestockId) {
    errors.push('Livestock is required');
  }
  
  if (!data.receiver && !data.receiverId) {
    errors.push('Receiver is required');
  }
  
  if (!data.reason || data.reason.trim().length < 10) {
    errors.push('Reason must be at least 10 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Export all functions as default object
export default {
  // CRUD
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  
  // Farmer (Sender)
  getSentTransfers,
  cancelTransfer,
  
  // Farmer (Receiver)
  getReceivedTransfers,
  receiverApproveTransfer,
  receiverRejectTransfer,
  
  // Admin
  getPendingReviewTransfers,
  adminApproveTransfer,
  adminRejectTransfer,
  completeTransfer,
  
  // Statistics & Search
  getTransferStats,
  searchFarmers,
  
  // Filters & Sort
  getTransfersByStatus,
  getTransfersByLivestock,
  getTransfersByDateRange,
  searchTransfers,
  getSortedTransfers,
  
  // Utilities
  formatTransferData,
  getStatusColor,
  getStatusBadgeStyle,
  formatDate,
  formatDateTime,
  getRelativeTime,
  getProgressStep,
  canCancelTransfer,
  canReceiverRespond,
  canAdminReview,
  canAdminComplete,
  getStatusIcon,
  validateTransferData
};

