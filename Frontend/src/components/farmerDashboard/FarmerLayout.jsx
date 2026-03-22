import { FaHome, FaPaw, FaSyringe, FaNotesMedical, FaChartLine, FaShieldAlt, FaExchangeAlt, FaCog, FaSignOutAlt, FaBell, FaCalendarCheck } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../../services/profileApi';

function FarmerLayout({ children, pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      // Check if token exists before making the request (prioritize sessionStorage)
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        // Redirect to login if no token
        navigate('/login');
        return;
      }
      
      console.log('[FarmerLayout] Fetching profile with token:', token.substring(0, 20) + '...');
      const result = await getUserProfile();
      
      if (result.success) {
        console.log('[FarmerLayout] Profile loaded successfully:', result.data);
        console.log('[FarmerLayout] Full Name:', result.data.full_name);
        console.log('[FarmerLayout] Profile Image URL:', result.data.profile_image_url);
        console.log('[FarmerLayout] Profile Image:', result.data.profile_image);
        setProfileData(result.data);
      } else {
        console.error('[FarmerLayout] Failed to fetch profile:', result.error);
        // If unauthorized, redirect to login
        if (result.error?.status === 401 || result.error?.message?.includes('401')) {
          console.error('Unauthorized - redirecting to login');
          sessionStorage.clear();
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('[FarmerLayout] Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Listen for login events to force profile refresh (only for this tab)
  useEffect(() => {
    const handleUserLogin = () => {
      console.log('[FarmerLayout] User login event detected, clearing old profile and fetching new');
      setProfileData(null);
      setLoading(true);
      fetchProfile();
    };

    // Only listen to events in this window, not from other tabs
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, [fetchProfile]);

  // Listen for profile updates from other components (same tab only)
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('[FarmerLayout] Profile update event received, refetching profile...');
      setLoading(true);
      fetchProfile();
    };

    // Listen for custom event (same tab only)
    window.addEventListener('profileUpdated', handleProfileUpdate);
    console.log('[FarmerLayout] Event listener registered for profileUpdated');
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      console.log('[FarmerLayout] Event listeners removed');
    };
  }, [fetchProfile]);

  const handleLogout = () => {
    console.log('[FarmerLayout] Logging out - clearing all data');
    // Clear profile state immediately
    setProfileData(null);
    setLoading(true);
    
    // Clear ALL localStorage data to prevent any caching
    localStorage.clear();
    
    // Also clear sessionStorage
    sessionStorage.clear();
    
    // Dispatch logout event
    window.dispatchEvent(new Event('userLoggedOut'));
    
    // Navigate to login
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
    return 'F';
  };

  // Get display name
  const getDisplayName = () => {
    if (profileData?.full_name) {
      const names = profileData.full_name.split(' ');
      return names[0]; // First name only
    }
    return 'Farmer';
  };

  const menuItems = [
    { name: "Dashboard", icon: FaHome, path: "/farmerpage" },
    { name: "Vet Appointment", icon: FaCalendarCheck, path: "/farmerappointment" },
    { name: "Livestock", icon: FaPaw, path: "/livestock" },
    { name: "Vaccination", icon: FaSyringe, path: "/vaccination", state: { from: 'farmer' } },
    { name: "Medical History", icon: FaNotesMedical, path: "/medical/history", state: { from: 'farmer' } },
    { name: "Reports", icon: FaChartLine, path: "/reports" },
    { name: "Insurance", icon: FaShieldAlt, path: "/farmerinsurancedashboard" },
    { name: "Profile Transfer", icon: FaExchangeAlt, path: "/profile-transfer/farmer/animals" },
    { name: "Settings", icon: FaCog, path: "/profile" },
  ];

  const handleNavigation = (item) => {
    if (item.state) {
      navigate(item.path, { state: item.state });
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dark Green Sidebar */}
      <div className="w-64 bg-emerald-900 flex flex-col py-6 px-4">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">F</span>
          </div>
          <span className="text-white font-bold text-xl">FarmCare</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleNavigation(item)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                location.pathname === item.path
                  ? 'bg-emerald-700'
                  : 'hover:bg-emerald-700'
              }`}
            >
              <item.icon className="text-white text-xl" />
              <span className="text-white font-medium">{item.name}</span>
            </div>
          ))}
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
        <div className={`px-8 py-4 flex items-center justify-between ${
          location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer')
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl' 
            : 'bg-white border-b border-gray-200'
        }`}>
          <div className="flex items-center gap-8">
            <h1 className={`text-2xl font-bold ${
              location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'text-white' : 'text-gray-800'
            }`}>{pageTitle}</h1>
            
            {/* Profile Transfer Navigation Tabs - Only show on Profile Transfer pages */}
            {location.pathname.startsWith('/profile-transfer') && (
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => navigate('/profile-transfer/farmer/animals')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/profile-transfer/farmer/animals'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  <FaPaw className="text-base" />
                  <span>My Animals</span>
                </button>
                <button
                  onClick={() => navigate('/profile-transfer/farmer/sent')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/profile-transfer/farmer/sent'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  <FaExchangeAlt className="text-base" />
                  <span>Sent Transfers</span>
                </button>
                <button
                  onClick={() => navigate('/profile-transfer/receiver/requests')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/profile-transfer/receiver/requests'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  <FaExchangeAlt className="text-base" />
                  <span>Requests</span>
                </button>
              </nav>
            )}
            
            {/* Insurance Navigation Tabs - Only show on Insurance pages */}
            {location.pathname.startsWith('/farmerinsurance') && (
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => navigate('/farmerinsurancedashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsurancedashboard'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/farmerinsuranceplan')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsuranceplan'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  Insurance
                </button>
                <button
                  onClick={() => navigate('/farmerinsuranceenroll')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsuranceenroll'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  Enroll
                </button>
                <button
                  onClick={() => navigate('/farmerinsurancesubmitclaim')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsurancesubmitclaim'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  Claims
                </button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <div className="relative cursor-pointer">
              <FaBell className={location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'text-white text-xl' : 'text-gray-600 text-xl'} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </div>
            
            {/* Profile with Name Below */}
            <div className="flex items-center space-x-4">
              {/* Manual Refresh Button (for debugging) */}
              <button
                onClick={() => {
                  console.log('[FarmerLayout] Manual refresh button clicked');
                  setLoading(true);
                  fetchProfile();
                }}
                className="text-xs px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                title="Refresh profile data"
              >
                Refresh
              </button>
              
              <div 
                onClick={() => navigate('/profile')}
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
              {loading ? (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 animate-pulse ${
                  location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'bg-white/30' : 'bg-gray-300'
                }`}>
                  <span className={location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'text-white font-semibold' : 'text-gray-500 font-semibold'}>...</span>
                </div>
              ) : profileData?.profile_image_url || profileData?.profile_image ? (
                <img 
                  src={profileData.profile_image_url || profileData.profile_image}
                  alt="Profile" 
                  onError={(e) => {
                    console.error('[FarmerLayout] Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log('[FarmerLayout] Image loaded successfully')}
                  className={`w-10 h-10 rounded-full object-cover mb-1 border-2 ${
                    location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'border-white' : 'border-emerald-600'
                  }`}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'bg-white' : 'bg-emerald-600'
                }`}>
                  <span className={location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'text-emerald-600 font-semibold' : 'text-white font-semibold'}>{getUserInitials()}</span>
                </div>
              )}
              <span className={`text-xs font-medium ${
                location.pathname.startsWith('/farmerinsurance') || location.pathname.startsWith('/profile-transfer') ? 'text-white' : 'text-gray-700'
              }`}>
                {loading ? 'Loading...' : getDisplayName()}
              </span>
            </div>
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

export default FarmerLayout;
