import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationApi';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    console.log('[NotificationContext] Fetching notifications...');
    setLoading(true);
    const result = await getNotifications();
    console.log('[NotificationContext] Fetch result:', result);
    if (result.success) {
      const notificationData = result.data.results || result.data;
      console.log('[NotificationContext] Notifications data:', notificationData);
      setNotifications(notificationData);
    } else {
      console.error('[NotificationContext] Failed to fetch notifications:', result.error);
    }
    setLoading(false);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    console.log('[NotificationContext] Fetching unread count...');
    const result = await getUnreadCount();
    console.log('[NotificationContext] Unread count result:', result);
    if (result.success) {
      setUnreadCount(result.data.unread_count);
    } else {
      console.error('[NotificationContext] Failed to fetch unread count:', result.error);
    }
  }, []);

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification) => {
    console.log('[Notification] New notification received:', notification);
    
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Play notification sound (optional)
    playNotificationSound();

    // Show browser notification (optional)
    showBrowserNotification(notification);
  }, []);

  // WebSocket connection
  const { isConnected } = useNotificationWebSocket(handleNewNotification);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    const result = await markAsRead(notificationId);
    if (result.success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all as read
  const markAllNotificationsAsRead = useCallback(async () => {
    const result = await markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Sound not available');
    }
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
      requestNotificationPermission();
    }
  }, [fetchNotifications, fetchUnreadCount, requestNotificationPermission]);

  const value = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
