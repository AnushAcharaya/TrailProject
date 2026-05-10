import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { useLocalizedNumber } from '../../utils/formatNumber';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const fmt = useLocalizedNumber();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FaBell className="notification-bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? `${fmt(99)}+` : fmt(unreadCount)}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown onClose={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
