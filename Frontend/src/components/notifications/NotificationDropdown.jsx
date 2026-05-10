import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import '../../styles/notifications.css';

const NotificationDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications,
    markAllNotificationsAsRead 
  } = useNotifications();

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleViewAll = () => {
    if (onClose) onClose();
    navigate('/medical/alerts');
  };

  const handleCloseDropdown = () => {
    if (onClose) onClose();
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* Header */}
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="notification-dropdown-body">
        {loading ? (
          <div className="notification-loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">No notifications yet</div>
        ) : (
          <div className="notification-list">
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onClose={handleCloseDropdown}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="notification-dropdown-footer">
          <button 
            className="view-all-btn"
            onClick={handleViewAll}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
