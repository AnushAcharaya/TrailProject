// Frontend/src/services/paymentApi.js
import axios from 'axios';

const paymentApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1/payment',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
paymentApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Initiate eSewa payment
 * @param {Object} paymentData
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.product_code - Product code (APPOINTMENT_FEE, INSURANCE_PREMIUM, etc.)
 * @param {string} paymentData.product_description - Description
 * @param {number} paymentData.tax_amount - Tax amount (optional, default 0)
 * @returns {Promise} Payment initiation response
 */
export const initiatePayment = async (paymentData) => {
  try {
    const response = await paymentApi.post('/payments/initiate/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

/**
 * Verify eSewa payment after callback
 * @param {Object} verifyData
 * @param {string} verifyData.transaction_uuid - Transaction UUID
 * @param {string} verifyData.ref_id - eSewa reference ID
 * @returns {Promise} Verification response
 */
export const verifyPayment = async (verifyData) => {
  try {
    const response = await paymentApi.post('/payments/verify/', verifyData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Get payment history for current user
 * @returns {Promise} Payment history
 */
export const getPaymentHistory = async () => {
  try {
    const response = await paymentApi.get('/payments/history/');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Check payment status
 * @param {number} paymentId - Payment ID
 * @returns {Promise} Payment status
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await paymentApi.get(`/payments/${paymentId}/status_check/`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Redirect to eSewa payment gateway
 * @param {Object} paymentData - Payment data from initiate response
 * @param {string} esewaUrl - eSewa payment URL
 */
export const redirectToEsewa = (paymentData, esewaUrl) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = esewaUrl;

  Object.keys(paymentData).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = paymentData[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

export default {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  checkPaymentStatus,
  redirectToEsewa,
};
