import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaExchangeAlt, 
  FaShieldAlt, 
  FaSyringe, 
  FaStethoscope,
  FaEnvelope,
  FaUserPlus,
  FaBell
} from 'react-icons/fa';

const NotificationItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const { markNotificationAsRead } = useNotifications();

  const getNotificationIcon = (type) => {
    const icons = {
      account: <FaCheckCircle />,
      appointment: <FaCalendarAlt />,
      transfer: <FaExchangeAlt />,
      insurance: <FaShieldAlt />,
      vaccination: <FaSyringe />,
      medical: <FaStethoscope />,
      message: <FaEnvelope />,
      friend: <FaUserPlus />,
      system: <FaBell />,
    };
    return icons[type] || <FaBell />;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const handleClick = async () => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate to link if provided
    if (notification.link) {
      navigate(notification.link);
    }

    // Close dropdown
    onClose();
  };

  return (
    <div 
      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className={`notification-icon notification-icon-${notification.notification_type}`}>
        {getNotificationIcon(notification.notification_type)}
      </div>
      
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">{getTimeAgo(notification.created_at)}</div>
      </div>

      {!notification.is_read && (
        <div className="notification-unread-indicator"></div>
      )}
    </div>
  );
};

export default NotificationItem;
