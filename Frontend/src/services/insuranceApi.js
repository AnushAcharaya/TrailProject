// Frontend/src/services/insuranceApi.js
import api from './api';

const BASE_URL = '/insurance';

// ============================================
// INSURANCE PLANS API
// ============================================

/**
 * Get all active insurance plans
 * @returns {Promise} List of insurance plans
 */
export const getInsurancePlans = async () => {
  try {
    console.log('Fetching insurance plans...');
    const response = await api.get(`${BASE_URL}/plans/`);
    console.log('Insurance plans fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance plans:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get insurance plan by ID
 * @param {number} planId - Plan ID
 * @returns {Promise} Insurance plan details
 */
export const getInsurancePlanById = async (planId) => {
  try {
    console.log(`Fetching insurance plan ${planId}...`);
    const response = await api.get(`${BASE_URL}/plans/${planId}/`);
    console.log('Insurance plan fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance plan:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search insurance plans
 * @param {string} searchTerm - Search term
 * @returns {Promise} Filtered insurance plans
 */
export const searchInsurancePlans = async (searchTerm) => {
  try {
    console.log(`Searching insurance plans: ${searchTerm}`);
    const response = await api.get(`${BASE_URL}/plans/`, {
      params: { search: searchTerm }
    });
    console.log('Search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching insurance plans:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get insurance plans by type
 * @param {string} planType - Plan type (basic, standard, premium, comprehensive)
 * @returns {Promise} Filtered insurance plans
 */
export const getInsurancePlansByType = async (planType) => {
  try {
    console.log(`Fetching ${planType} insurance plans...`);
    const response = await api.get(`${BASE_URL}/plans/`, {
      params: { plan_type: planType }
    });
    console.log('Plans by type fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching plans by type:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// ENROLLMENTS API (Farmer)
// ============================================

/**
 * Get all enrollments for current farmer
 * @returns {Promise} List of enrollments
 */
export const getEnrollments = async () => {
  try {
    console.log('Fetching enrollments...');
    const response = await api.get(`${BASE_URL}/enrollments/`);
    console.log('Enrollments fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get enrollment by ID
 * @param {number} enrollmentId - Enrollment ID
 * @returns {Promise} Enrollment details
 */
export const getEnrollmentById = async (enrollmentId) => {
  try {
    console.log(`Fetching enrollment ${enrollmentId}...`);
    const response = await api.get(`${BASE_URL}/enrollments/${enrollmentId}/`);
    console.log('Enrollment fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create new enrollment
 * @param {Object} enrollmentData - Enrollment data
 * @returns {Promise} Created enrollment
 */
export const createEnrollment = async (enrollmentData) => {
  try {
    console.log('Creating enrollment:', enrollmentData);
    const response = await api.post(`${BASE_URL}/enrollments/`, enrollmentData);
    console.log('Enrollment created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating enrollment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update enrollment
 * @param {number} enrollmentId - Enrollment ID
 * @param {Object} enrollmentData - Updated enrollment data
 * @returns {Promise} Updated enrollment
 */
export const updateEnrollment = async (enrollmentId, enrollmentData) => {
  try {
    console.log(`Updating enrollment ${enrollmentId}:`, enrollmentData);
    const response = await api.patch(`${BASE_URL}/enrollments/${enrollmentId}/`, enrollmentData);
    console.log('Enrollment updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating enrollment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete enrollment
 * @param {number} enrollmentId - Enrollment ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteEnrollment = async (enrollmentId) => {
  try {
    console.log(`Deleting enrollment ${enrollmentId}...`);
    const response = await api.delete(`${BASE_URL}/enrollments/${enrollmentId}/`);
    console.log('Enrollment deleted');
    return response.data;
  } catch (error) {
    console.error('Error deleting enrollment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get active enrollments
 * @returns {Promise} List of active enrollments
 */
export const getActiveEnrollments = async () => {
  try {
    console.log('Fetching active enrollments...');
    const response = await api.get(`${BASE_URL}/enrollments/active/`);
    console.log('Active enrollments fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching active enrollments:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Cancel enrollment
 * @param {number} enrollmentId - Enrollment ID
 * @returns {Promise} Cancelled enrollment
 */
export const cancelEnrollment = async (enrollmentId) => {
  try {
    console.log(`Cancelling enrollment ${enrollmentId}...`);
    const response = await api.post(`${BASE_URL}/enrollments/${enrollmentId}/cancel/`);
    console.log('Enrollment cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling enrollment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get enrollments by status
 * @param {string} status - Enrollment status
 * @returns {Promise} Filtered enrollments
 */
export const getEnrollmentsByStatus = async (status) => {
  try {
    console.log(`Fetching enrollments with status: ${status}`);
    const response = await api.get(`${BASE_URL}/enrollments/`, {
      params: { status }
    });
    console.log('Enrollments by status fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments by status:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// CLAIMS API (Farmer, Vet, Admin)
// ============================================

/**
 * Get all claims (filtered by user role)
 * @returns {Promise} List of claims
 */
export const getClaims = async () => {
  try {
    console.log('Fetching claims...');
    const response = await api.get(`${BASE_URL}/claims/`);
    console.log('Claims fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching claims:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get claim by ID
 * @param {number} claimId - Claim ID
 * @returns {Promise} Claim details
 */
export const getClaimById = async (claimId) => {
  try {
    console.log(`Fetching claim ${claimId}...`);
    const response = await api.get(`${BASE_URL}/claims/${claimId}/`);
    console.log('Claim fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching claim:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create new claim (Farmer)
 * @param {Object} claimData - Claim data
 * @returns {Promise} Created claim
 */
export const createClaim = async (claimData) => {
  try {
    console.log('Creating claim:', claimData);
    
    // If there's a file, use FormData
    if (claimData.supporting_document instanceof File) {
      const formData = new FormData();
      Object.keys(claimData).forEach(key => {
        formData.append(key, claimData[key]);
      });
      
      const response = await api.post(`${BASE_URL}/claims/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Claim created:', response.data);
      return response.data;
    }
    
    // Otherwise use regular JSON
    const response = await api.post(`${BASE_URL}/claims/`, claimData);
    console.log('Claim created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating claim:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update claim
 * @param {number} claimId - Claim ID
 * @param {Object} claimData - Updated claim data
 * @returns {Promise} Updated claim
 */
export const updateClaim = async (claimId, claimData) => {
  try {
    console.log(`Updating claim ${claimId}:`, claimData);
    const response = await api.patch(`${BASE_URL}/claims/${claimId}/`, claimData);
    console.log('Claim updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating claim:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete claim
 * @param {number} claimId - Claim ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteClaim = async (claimId) => {
  try {
    console.log(`Deleting claim ${claimId}...`);
    const response = await api.delete(`${BASE_URL}/claims/${claimId}/`);
    console.log('Claim deleted');
    return response.data;
  } catch (error) {
    console.error('Error deleting claim:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get farmer's own claims
 * @returns {Promise} List of farmer's claims
 */
export const getMyClaims = async () => {
  try {
    console.log('Fetching my claims...');
    const response = await api.get(`${BASE_URL}/claims/my_claims/`);
    console.log('My claims fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching my claims:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get claims pending vet verification (Vet only)
 * @returns {Promise} List of claims pending verification
 */
export const getPendingVerificationClaims = async () => {
  try {
    console.log('Fetching claims pending verification...');
    const response = await api.get(`${BASE_URL}/claims/pending_verification/`);
    console.log('Pending verification claims fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending verification claims:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Vet verifies a claim
 * @param {number} claimId - Claim ID
 * @param {Object} verificationData - Verification data {vet_notes, decision: 'approve'|'reject'}
 * @returns {Promise} Verified claim
 */
export const verifyClaim = async (claimId, verificationData) => {
  try {
    console.log(`Verifying claim ${claimId}:`, verificationData);
    const response = await api.post(`${BASE_URL}/claims/${claimId}/verify/`, verificationData);
    console.log('Claim verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying claim:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Admin updates claim status
 * @param {number} claimId - Claim ID
 * @param {Object} statusData - Status update data {status, admin_notes?, approved_amount?}
 * @returns {Promise} Updated claim
 */
export const updateClaimStatus = async (claimId, statusData) => {
  try {
    console.log(`Updating claim ${claimId} status:`, statusData);
    const response = await api.post(`${BASE_URL}/claims/${claimId}/update_status/`, statusData);
    console.log('Claim status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating claim status:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get claim statistics
 * @returns {Promise} Claim statistics
 */
export const getClaimStats = async () => {
  try {
    console.log('Fetching claim statistics...');
    const response = await api.get(`${BASE_URL}/claims/stats/`);
    console.log('Claim stats fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching claim stats:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get claims by status
 * @param {string} status - Claim status
 * @returns {Promise} Filtered claims
 */
export const getClaimsByStatus = async (status) => {
  try {
    console.log(`Fetching claims with status: ${status}`);
    const response = await api.get(`${BASE_URL}/claims/by_status/`, {
      params: { status }
    });
    console.log('Claims by status fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching claims by status:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Search claims
 * @param {string} searchTerm - Search term
 * @returns {Promise} Filtered claims
 */
export const searchClaims = async (searchTerm) => {
  try {
    console.log(`Searching claims: ${searchTerm}`);
    const response = await api.get(`${BASE_URL}/claims/`, {
      params: { search: searchTerm }
    });
    console.log('Search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching claims:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get claims by type
 * @param {string} claimType - Claim type
 * @returns {Promise} Filtered claims
 */
export const getClaimsByType = async (claimType) => {
  try {
    console.log(`Fetching claims of type: ${claimType}`);
    const response = await api.get(`${BASE_URL}/claims/`, {
      params: { claim_type: claimType }
    });
    console.log('Claims by type fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching claims by type:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get claims by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise} Filtered claims
 */
export const getClaimsByDateRange = async (startDate, endDate) => {
  try {
    console.log(`Fetching claims from ${startDate} to ${endDate}`);
    const response = await api.get(`${BASE_URL}/claims/`, {
      params: {
        incident_date_after: startDate,
        incident_date_before: endDate
      }
    });
    console.log('Claims by date range fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching claims by date range:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format enrollment data for API submission
 * @param {Object} data - Raw enrollment data
 * @returns {Object} Formatted enrollment data
 */
export const formatEnrollmentData = (data) => {
  return {
    livestock: data.livestockId || data.livestock,
    plan: data.planId || data.plan,
    start_date: data.startDate || data.start_date,
    end_date: data.endDate || data.end_date,
    premium_paid: data.premiumPaid || data.premium_paid,
    payment_date: data.paymentDate || data.payment_date || null,
    notes: data.notes || ''
  };
};

/**
 * Format claim data for API submission
 * @param {Object} data - Raw claim data
 * @returns {Object} Formatted claim data
 */
export const formatClaimData = (data) => {
  return {
    enrollment: data.enrollmentId || data.enrollment,
    claim_type: data.claimType || data.claim_type,
    claim_amount: data.claimAmount || data.claim_amount,
    incident_date: data.incidentDate || data.incident_date,
    incident_location: data.incidentLocation || data.incident_location,
    description: data.description,
    supporting_document: data.supportingDocument || data.supporting_document || null
  };
};

/**
 * Get status color for UI display
 * @param {string} status - Status value
 * @returns {string} Color class or hex code
 */
export const getStatusColor = (status) => {
  const statusColors = {
    // Enrollment statuses
    'Active': '#10b981',
    'Pending': '#f59e0b',
    'Expired': '#6b7280',
    'Cancelled': '#ef4444',
    
    // Claim statuses
    'Submitted': '#3b82f6',
    'Under Review': '#8b5cf6',
    'Pending Verification': '#f59e0b',
    'Verified': '#10b981',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Paid': '#059669'
  };
  
  return statusColors[status] || '#6b7280';
};

/**
 * Format currency for display
 * @param {number} amount - Amount in NPR
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `NPR ${parseFloat(amount).toLocaleString('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
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
 * Calculate days until expiry
 * @param {string} endDate - End date string
 * @returns {number} Days until expiry
 */
export const getDaysUntilExpiry = (endDate) => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if enrollment is expiring soon (within 30 days)
 * @param {string} endDate - End date string
 * @returns {boolean} True if expiring soon
 */
export const isExpiringSoon = (endDate) => {
  const daysUntilExpiry = getDaysUntilExpiry(endDate);
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

/**
 * Get claim type icon/emoji
 * @param {string} claimType - Claim type
 * @returns {string} Icon or emoji
 */
export const getClaimTypeIcon = (claimType) => {
  const icons = {
    'Death': '💀',
    'Theft': '🚨',
    'Disease': '🦠',
    'Accident': '⚠️',
    'Natural Disaster': '🌪️',
    'Other': '📋'
  };
  
  return icons[claimType] || '📋';
};

export default {
  // Plans
  getInsurancePlans,
  getInsurancePlanById,
  searchInsurancePlans,
  getInsurancePlansByType,
  
  // Enrollments
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getActiveEnrollments,
  cancelEnrollment,
  getEnrollmentsByStatus,
  
  // Claims
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  deleteClaim,
  getMyClaims,
  getPendingVerificationClaims,
  verifyClaim,
  updateClaimStatus,
  getClaimStats,
  getClaimsByStatus,
  searchClaims,
  getClaimsByType,
  getClaimsByDateRange,
  
  // Utilities
  formatEnrollmentData,
  formatClaimData,
  getStatusColor,
  formatCurrency,
  formatDate,
  getDaysUntilExpiry,
  isExpiringSoon,
  getClaimTypeIcon
};
