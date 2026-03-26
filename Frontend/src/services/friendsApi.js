import axios from 'axios';

// Create a separate axios instance for friends API with correct base URL
const friendsApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
friendsApi.interceptors.request.use(
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

const FRIENDS_BASE_URL = '/api/v1/friends';

// Send a friend request
export const sendFriendRequest = async (receiverUsername) => {
  try {
    const response = await friendsApi.post(`${FRIENDS_BASE_URL}/requests/`, {
      receiver_username: receiverUsername
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send friend request'
    };
  }
};

// Get received friend requests (pending)
export const getReceivedRequests = async () => {
  try {
    const response = await friendsApi.get(`${FRIENDS_BASE_URL}/requests/received/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch friend requests'
    };
  }
};

// Get sent friend requests (pending)
export const getSentRequests = async () => {
  try {
    const response = await friendsApi.get(`${FRIENDS_BASE_URL}/requests/sent/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch sent requests'
    };
  }
};

// Accept a friend request
export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await friendsApi.post(`${FRIENDS_BASE_URL}/requests/${requestId}/accept/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to accept friend request'
    };
  }
};

// Reject a friend request
export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await friendsApi.post(`${FRIENDS_BASE_URL}/requests/${requestId}/reject/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to reject friend request'
    };
  }
};

// Get all friends
export const getFriends = async () => {
  try {
    const response = await friendsApi.get(`${FRIENDS_BASE_URL}/friendships/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch friends'
    };
  }
};

// Remove a friend
export const removeFriend = async (friendshipId) => {
  try {
    await friendsApi.delete(`${FRIENDS_BASE_URL}/friendships/${friendshipId}/remove/`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to remove friend'
    };
  }
};

// Check friendship status with a specific user
export const checkFriendshipStatus = async (username) => {
  try {
    // Check if already friends
    const friendsResult = await getFriends();
    if (friendsResult.success) {
      // Handle both array and paginated response
      const friendsList = Array.isArray(friendsResult.data) 
        ? friendsResult.data 
        : friendsResult.data.results || [];
      
      const isFriend = friendsList.some(
        f => f.friend.username === username
      );
      if (isFriend) {
        return { success: true, status: 'friends' };
      }
    }

    // Check if there's a pending request (sent or received)
    const sentResult = await getSentRequests();
    if (sentResult.success) {
      // Handle both array and paginated response
      const sentList = Array.isArray(sentResult.data) 
        ? sentResult.data 
        : sentResult.data.results || [];
      
      const hasSentRequest = sentList.some(
        r => r.receiver.username === username
      );
      if (hasSentRequest) {
        return { success: true, status: 'pending' };
      }
    }

    const receivedResult = await getReceivedRequests();
    if (receivedResult.success) {
      // Handle both array and paginated response
      const receivedList = Array.isArray(receivedResult.data) 
        ? receivedResult.data 
        : receivedResult.data.results || [];
      
      const hasReceivedRequest = receivedList.some(
        r => r.sender.username === username
      );
      if (hasReceivedRequest) {
        return { success: true, status: 'pending' };
      }
    }

    return { success: true, status: 'none' };
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return {
      success: false,
      error: 'Failed to check friendship status'
    };
  }
};
