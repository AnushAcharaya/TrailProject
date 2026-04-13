import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList } from 'react-icons/fa';
import { Bell, Users, CheckCircle, BarChart2, Settings, HelpCircle, LogOut, AlertTriangle, Shield, ArrowRightLeft, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../common/LanguageSwitcher';
import ProfilePage from '../../profile/ProfilePage';
import { getUserProfile } from '../../../services/profileApi';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('profileTransfer');
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  useEffect(() => {
    // Fetch user profile from API
    const fetchProfile = async () => {
      const result = await getUserProfile();
      if (result.success) {
        console.log('[AdminLayout] Profile data received:', result.data);
        setUser(result.data);
      } else {
        console.error('[AdminLayout] Failed to fetch profile:', result.error);
        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
    };
    
    fetchProfile();
  }, []);

  // Listen for profile modal open event
  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('openProfileModal', handleOpenProfile);
    return () => window.removeEventListener('openProfileModal', handleOpenProfile);
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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full h-screen overflow-hidden flex">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-xl font-bold text-gray-800">{t('adminSidebar.logoutConfirm')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('adminSidebar.logoutMessage')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                {t('adminSidebar.yesLogout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 md:hidden z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Fixed Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64
          bg-emerald-900 shadow-lg p-6
          flex flex-col gap-6
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">A</span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('adminSidebar.livestockHub')}</h2>
          <button className="md:hidden ml-auto text-white" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-6">
          <a 
            onClick={() => navigate('/adminpage')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <Users size={18} /> {t('adminSidebar.allUsers')}
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer">
            <CheckCircle size={18} /> {t('adminSidebar.accountVerifications')}
          </a>
          <a 
            onClick={() => navigate('/admin/insurance')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <Shield size={18} /> {t('adminSidebar.insurance')}
          </a>
          <a 
            onClick={() => navigate('/profile-transfer/admin/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <ArrowRightLeft size={18} /> {t('adminSidebar.profileTransfer')}
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer">
            <BarChart2 size={18} /> {t('adminSidebar.analytics')}
          </a>
          <a 
            onClick={() => {
              // Trigger profile modal instead of navigating
              window.dispatchEvent(new CustomEvent('openProfileModal'));
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <Settings size={18} /> {t('adminSidebar.settings')}
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer">
            <HelpCircle size={18} /> {t('adminSidebar.helpSupport')}
          </a>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium mt-auto mb-4 w-full justify-center"
        >
          <LogOut size={18} /> {t('adminSidebar.logout')}
        </button>

        {/* Footer */}
        <div className="text-xs text-emerald-200 text-center border-t border-emerald-700 pt-4">
          © {new Date().getFullYear()} {t('adminSidebar.livestockHub')}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Unified Top Navigation Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl px-8 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu + Profile Transfer Navigation */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <Menu size={20} />
              </button>

              {/* Profile Transfer Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate('/profile-transfer/admin/dashboard')}
                  className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-all text-sm font-medium ${
                    isActive('/profile-transfer/admin/dashboard')
                      ? 'bg-white/30 text-white shadow-sm' 
                      : 'text-emerald-50 hover:bg-white/10'
                  }`}
                >
                  <FaTachometerAlt className="text-base" />
                  <span>{t('adminNav.dashboard')}</span>
                </button>
                
                <button
                  onClick={() => navigate('/profile-transfer/admin/review')}
                  className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-all text-sm font-medium ${
                    location.pathname.startsWith('/profile-transfer/admin/review')
                      ? 'bg-white/30 text-white shadow-sm' 
                      : 'text-emerald-50 hover:bg-white/10'
                  }`}
                >
                  <FaClipboardList className="text-base" />
                  <span>{t('adminNav.reviewTransfers')}</span>
                </button>
              </div>
            </div>

            {/* Right: Language Switcher, Notifications and Profile */}
            <div className="flex items-center gap-6">
              {/* Language Switcher */}
              <LanguageSwitcher context="admin" />

              <Bell size={22} className="text-white cursor-pointer hover:opacity-80 transition-opacity" />
              
              {/* Profile Section */}
              <div 
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleProfileClick}
              >
                {/* Round Profile Image/Icon */}
                {(() => {
                  const hasImageUrl = user?.profile_image_url;
                  const hasImage = user?.profile_image;
                  const imageUrl = hasImageUrl || (hasImage ? `http://localhost:8000${user.profile_image}` : null);
                  
                  return imageUrl ? (
                    <img 
                      src={imageUrl}
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover shadow-md hover:shadow-lg transition-shadow border-2 border-white"
                      onError={(e) => {
                        console.error('[AdminLayout] Image failed to load:', imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 font-semibold shadow-md hover:shadow-lg transition-shadow border-2 border-white">
                      {getInitials(user?.full_name || user?.username || "Admin")}
                    </div>
                  );
                })()}
                {/* Name below icon */}
                <p className="text-xs font-medium text-white">
                  {user?.full_name || user?.username || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-emerald-50">
          {children}
        </div>
      </div>

      {/* Profile Modal Overlay */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[60]">
          <ProfilePage onClose={() => setIsProfileOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
