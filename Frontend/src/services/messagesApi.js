import axios from 'axios';

// Create a separate axios instance for messages API
const messagesApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
messagesApi.interceptors.request.use(
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

const MESSAGES_BASE_URL = '/api/v1/messages';

// Get messages for a specific friendship
export const getMessages = async (friendshipId) => {
  try {
    const response = await messagesApi.get(`${MESSAGES_BASE_URL}/`, {
      params: { friendship_id: friendshipId }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch messages'
    };
  }
};

// Send a message
export const sendMessage = async (friendshipId, text, messageType = 'text') => {
  try {
    const response = await messagesApi.post(`${MESSAGES_BASE_URL}/`, {
      friendship: friendshipId,
      text: text,
      message_type: messageType
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send message'
    };
  }
};

// Mark a message as read
export const markMessageRead = async (messageId) => {
  try {
    const response = await messagesApi.post(`${MESSAGES_BASE_URL}/${messageId}/mark_read/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to mark message as read'
    };
  }
};

// Mark all messages in a conversation as read
export const markAllMessagesRead = async (friendshipId) => {
  try {
    const response = await messagesApi.post(`${MESSAGES_BASE_URL}/mark_all_read/`, {
      friendship_id: friendshipId
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to mark messages as read'
    };
  }
};
