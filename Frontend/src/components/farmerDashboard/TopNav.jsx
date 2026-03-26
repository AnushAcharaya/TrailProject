import { FaBell, FaEnvelope, FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getReceivedRequests } from "../../services/friendsApi";
import "../../styles/farmerdashboard.css";

const TopNav = ({ pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  useEffect(() => {
    loadFriendRequestCount();
  }, []);

  const loadFriendRequestCount = async () => {
    const result = await getReceivedRequests();
    if (result.success) {
      setFriendRequestCount(result.data.length);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
      <div className="flex items-center space-x-6">
        {/* Message Icon */}
        <div 
          className="relative cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => alert('Messages feature coming soon!')}
        >
          <FaEnvelope className="text-gray-600 text-xl" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
            5
          </span>
        </div>

        {/* Friend Request Icon */}
        <div 
          className="relative cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/farmer/friends/requests')}
        >
          <FaUserFriends className="text-gray-600 text-xl" />
          {friendRequestCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-xs text-white flex items-center justify-center">
              {friendRequestCount}
            </span>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <FaBell className="text-gray-600 text-xl" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </div>
        
        {/* Profile with Name Below */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mb-1">
            <span className="text-white font-semibold">JD</span>
          </div>
          <span className="text-xs text-gray-700 font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
