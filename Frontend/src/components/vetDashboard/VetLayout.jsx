import { FaHome, FaUser, FaShieldAlt, FaCalendarAlt, FaCog, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/profileApi';

function VetLayout({ children, pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('[VetLayout] Profile update event received, refetching profile...');
      setLoading(true);
      fetchProfile();
    };

    // Listen for custom event
    window.addEventListener('profileUpdated', handleProfileUpdate);
    console.log('[VetLayout] Event listener registered for profileUpdated');
    
    // Also listen for storage changes as backup
    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdateTrigger') {
        console.log('[VetLayout] Storage event received for profile update');
        handleProfileUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for storage changes in same tab (storage event doesn't fire in same tab)
    const checkStorageInterval = setInterval(() => {
      const trigger = localStorage.getItem('profileUpdateTrigger');
      if (trigger && trigger !== window.lastProfileUpdateTrigger) {
        console.log('[VetLayout] Detected profile update via localStorage polling');
        window.lastProfileUpdateTrigger = trigger;
        handleProfileUpdate();
      }
    }, 500); // Check every 500ms
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkStorageInterval);
      console.log('[VetLayout] Event listeners removed');
    };
  }, []);

  const fetchProfile = async () => {
    try {
      // Check if token exists before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        // Redirect to login if no token
        navigate('/login');
        return;
      }
      
      console.log('Fetching profile with token:', token.substring(0, 20) + '...');
      const result = await getUserProfile();
      
      if (result.success) {
        setProfileData(result.data);
        console.log('Profile loaded successfully:', result.data);
      } else {
        console.error('Failed to fetch profile:', result.error);
        // If unauthorized, redirect to login
        if (result.error?.status === 401 || result.error?.message?.includes('401')) {
          console.error('Unauthorized - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to login page
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profileData?.full_name) {
      const names = profileData.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return 'V';
  };

  // Get display name
  const getDisplayName = () => {
    if (profileData?.full_name) {
      const names = profileData.full_name.split(' ');
      return names[0]; // First name only
    }
    return 'Vet';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dark Green Sidebar */}
      <div className="w-64 bg-emerald-900 flex flex-col py-6 px-4">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">V</span>
          </div>
          <span className="text-white font-bold text-xl">VetCare</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <div 
            onClick={() => navigate('/vet/dashboard')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              location.pathname === '/vet/dashboard' 
                ? 'bg-emerald-700' 
                : 'hover:bg-emerald-700'
            }`}
          >
            <FaHome className="text-white text-xl" />
            <span className="text-white font-medium">Dashboard</span>
          </div>
          <div 
            onClick={() => navigate('/vet/farmer-profiles')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              location.pathname === '/vet/farmer-profiles' 
                ? 'bg-emerald-700' 
                : 'hover:bg-emerald-700'
            }`}
          >
            <FaUser className="text-white text-xl" />
            <span className="text-white font-medium">Farmer Profiles</span>
          </div>
          <div 
            onClick={() => navigate('/vetinsurancereviewdashboard')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              location.pathname === '/vetinsurancereviewdashboard' 
                ? 'bg-emerald-700' 
                : 'hover:bg-emerald-700'
            }`}
          >
            <FaShieldAlt className="text-white text-xl" />
            <span className="text-white font-medium">Insurance Verify</span>
          </div>
          <div 
            onClick={() => navigate('/vetappointment')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              location.pathname === '/vetappointment' 
                ? 'bg-emerald-700' 
                : 'hover:bg-emerald-700'
            }`}
          >
            <FaCalendarAlt className="text-white text-xl" />
            <span className="text-white font-medium">Appointments</span>
          </div>
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-emerald-700"
          >
            <FaCog className="text-white text-xl" />
            <span className="text-white font-medium">Settings</span>
          </div>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="mt-auto pt-4 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors bg-red-600 hover:bg-red-700 w-full"
          >
            <FaSignOutAlt className="text-white text-xl" />
            <span className="text-white font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
          <div className="flex items-center space-x-6">
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
              {loading ? (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mb-1 animate-pulse">
                  <span className="text-gray-500 font-semibold">...</span>
                </div>
              ) : profileData?.profile_image_url || profileData?.profile_image ? (
                <img 
                  src={profileData.profile_image_url || `http://localhost:8000${profileData.profile_image}`}
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover mb-1 border-2 border-emerald-600"
                />
              ) : (
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mb-1">
                  <span className="text-white font-semibold">{getUserInitials()}</span>
                </div>
              )}
              <span className="text-xs text-gray-700 font-medium">
                {loading ? 'Loading...' : getDisplayName()}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default VetLayout;
