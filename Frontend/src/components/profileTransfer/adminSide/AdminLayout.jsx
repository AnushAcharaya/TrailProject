import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ full_name: "Admin", email: "admin@livestockhub.com" });
  
  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Get initials from name for avatar
  const getInitials = (name) => {
    if (!name) return "A";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Navigate to profile page
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Profile Transfer Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/profile-transfer/admin/dashboard')}
              className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-all text-sm font-medium ${
                isActive('/profile-transfer/admin/dashboard')
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaTachometerAlt className="text-base" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => navigate('/profile-transfer/admin/review')}
              className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-all text-sm font-medium ${
                isActive('/profile-transfer/admin/review')
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaClipboardList className="text-base" />
              <span>Review Transfers</span>
            </button>
          </div>

          {/* Right: Notifications and Profile */}
          <div className="flex items-center gap-6">
            <Bell size={22} className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
            
            {/* Profile Section */}
            <div 
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            >
              {/* Round Profile Image/Icon */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow">
                {getInitials(user.full_name || user.username || "Admin")}
              </div>
              {/* Name below icon */}
              <p className="text-xs font-medium text-gray-700">
                {user.full_name || user.username || "Admin"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-emerald-50">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
