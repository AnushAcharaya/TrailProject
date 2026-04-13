import { FaHome, FaPaw, FaSyringe, FaNotesMedical, FaChartLine, FaShieldAlt, FaExchangeAlt, FaCog, FaSignOutAlt, FaBell, FaCalendarCheck, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '../../services/profileApi';
import { getReceivedRequests } from '../../services/friendsApi';
import LanguageSwitcher from '../common/LanguageSwitcher';

function FarmerLayout({ children, pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['insurance', 'profileTransfer', 'dashboard']);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestCount, setFriendRequestCount] = useState(0);

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
    loadFriendRequestCount();
  }, [fetchProfile]);

  const loadFriendRequestCount = async () => {
    const result = await getReceivedRequests();
    if (result.success) {
      setFriendRequestCount(result.data.length);
    }
  };

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
    { name: t('dashboard:sidebar.dashboard'), icon: FaHome, path: "/farmerpage" },
    { name: t('dashboard:sidebar.vetAppointment'), icon: FaCalendarCheck, path: "/farmerappointment" },
    { name: t('dashboard:sidebar.messages'), icon: FaEnvelope, path: "/messages", badge: 5, badgeColor: "bg-blue-500" },
    { name: t('dashboard:sidebar.friendRequests'), icon: FaUserFriends, path: "/farmer/friends/requests", badge: friendRequestCount, badgeColor: "bg-green-500" },
    { name: t('dashboard:sidebar.friends'), icon: FaUserFriends, path: "/farmer/friends/list" },
    { name: t('dashboard:sidebar.livestock'), icon: FaPaw, path: "/livestock" },
    { name: t('dashboard:sidebar.vaccination'), icon: FaSyringe, path: "/vaccination", state: { from: 'farmer' } },
    { name: t('dashboard:sidebar.medicalHistory'), icon: FaNotesMedical, path: "/medical/history", state: { from: 'farmer' } },
    { name: t('dashboard:sidebar.reports'), icon: FaChartLine, path: "/reports" },
    { name: t('dashboard:sidebar.insurance'), icon: FaShieldAlt, path: "/farmerinsurancedashboard" },
    { name: t('dashboard:sidebar.profileTransfer'), icon: FaExchangeAlt, path: "/profile-transfer/farmer/animals" },
    { name: t('dashboard:sidebar.settings'), icon: FaCog, path: "/profile" },
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
      {/* Dark Green Sidebar - Fixed and Non-scrollable */}
      <div className="w-64 bg-emerald-900 flex flex-col py-6 px-4 fixed left-0 top-0 h-screen">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">F</span>
          </div>
          <span className="text-white font-bold text-xl">{t('dashboard:appName')}</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, index) => {
            // Check if current path matches the menu item
            // For Friends, check if path starts with /farmer/friends
            const isActive = item.name === "Friends" || item.name === "Friend Requests"
              ? location.pathname.startsWith('/farmer/friends')
              : location.pathname === item.path;
            
            return (
              <div
                key={index}
                onClick={() => handleNavigation(item)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-emerald-700'
                    : 'hover:bg-emerald-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="text-white text-xl" />
                  <span className="text-white font-medium">{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`${item.badgeColor} text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="mt-auto pt-4 border-t border-emerald-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors bg-red-600 hover:bg-red-700 w-full"
          >
            <FaSignOutAlt className="text-white text-xl" />
            <span className="text-white font-medium">{t('dashboard:sidebar.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation */}
        <div className="px-8 py-4 flex items-center bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl">
          {/* Left: Page Title - Hide on Profile Transfer pages */}
          <div className="flex-1">
            {!location.pathname.startsWith('/profile-transfer') && (
              <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
            )}
          </div>

          {/* Center: Navigation Tabs */}
          <div className="flex-1 flex justify-center">
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
                  <span>{t('profileTransfer:nav.myAnimals')}</span>
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
                  <span>{t('profileTransfer:nav.sentTransfers')}</span>
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
                  <span>{t('profileTransfer:nav.requests')}</span>
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
                  {t('insurance:nav.dashboard')}
                </button>
                <button
                  onClick={() => navigate('/farmerinsuranceplan')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsuranceplan'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  {t('insurance:nav.insurance')}
                </button>
                <button
                  onClick={() => navigate('/farmerinsuranceenroll')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsuranceenroll'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  {t('insurance:nav.enroll')}
                </button>
                <button
                  onClick={() => navigate('/farmerinsurancesubmitclaim')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === '/farmerinsurancesubmitclaim'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'hover:bg-white/10 text-emerald-50'
                  }`}
                >
                  {t('insurance:nav.claims')}
                </button>
              </nav>
            )}
          </div>
          
          {/* Right: Notification Bell, Language Switcher and Profile */}
          <div className="flex-1 flex items-center justify-end space-x-6">
            {/* Notification Bell */}
            <div className="relative cursor-pointer">
              <FaBell className="text-white text-xl" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher context="farmer" />
            
            {/* Profile with Name Below */}
            <div 
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              {loading ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 animate-pulse bg-white/30">
                  <span className="text-white font-semibold">...</span>
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
                  className="w-10 h-10 rounded-full object-cover mb-1 border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white">
                  <span className="text-emerald-600 font-semibold">{getUserInitials()}</span>
                </div>
              )}
              <span className="text-xs font-medium text-white">
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

export default FarmerLayout;
