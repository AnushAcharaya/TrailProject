import { useState, useEffect } from "react";
import { Bell, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopNav({ toggleSidebar }) {
  const navigate = useNavigate();
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

  return (
    <div className="w-full bg-white shadow fixed top-0 left-0 z-50">
      <div className="max-w-screen-2xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-0 md:gap-3">
          {/* Hamburger button */}
          <button
            className="md:hidden p-2 rounded-lg border"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>

          <div className="ml-0">
            <h1 className="text-lg lg:text-xl font-semibold">
              LivestockHub Admin
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Manage Farmer and Vet
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-15 mr-0">
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
            <p className="text-xs font-medium text-gray-700 hidden sm:block">
              {user.full_name || user.username || "Admin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
