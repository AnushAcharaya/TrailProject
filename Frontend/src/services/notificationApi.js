import axios from 'axios';

const NOTIFICATION_API_BASE_URL = 'http://localhost:8000/api/v1/notifications';

const notificationApi = axios.create({
  baseURL: NOTIFICATION_API_BASE_URL,
});

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const getNotifications = async (page = 1) => {
  try {
    const response = await notificationApi.get(`/?page=${page}`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data };
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await notificationApi.get('/unread_count/', {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await notificationApi.patch(`/${notificationId}/mark_read/`, {}, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data };
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await notificationApi.post('/mark_all_read/', {}, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await notificationApi.delete(`/${notificationId}/`, {
      headers: getAuthHeaders(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data };
  }
};

// Admin-only: broadcast a system message to all farmers and/or vets.
// payload: { title, message, audience: 'all'|'farmers'|'vets', urgency: 'normal'|'important'|'urgent', link? }
export const broadcastNotification = async (payload) => {
  try {
    const response = await notificationApi.post('/broadcast/', payload, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Broadcast failed.' },
    };
  }
};
