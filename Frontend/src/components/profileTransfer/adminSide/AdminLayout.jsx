import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle, BarChart2, Settings, HelpCircle, LogOut, AlertTriangle, Shield, ArrowRightLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../common/LanguageSwitcher';
import NotificationBell from '../../notifications/NotificationBell';
import ProfilePage from '../../profile/ProfilePage';
import { getUserProfile } from '../../../services/profileApi';
import '../../../styles/notifications.css';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('profileTransfer');
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

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

      {/* Fixed Sidebar — matches FarmerLayout / VetLayout style */}
      <div className="w-64 bg-emerald-900 flex flex-col py-6 px-4 fixed left-0 top-0 h-screen z-40">

        {/* Branding */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">A</span>
          </div>
          <span className="text-white font-bold text-xl">{t('adminSidebar.livestockHub')}</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {[
            { icon: Users,          label: t('adminSidebar.allUsers'),             path: '/adminpage' },
            { icon: CheckCircle,    label: t('adminSidebar.accountVerifications'), path: '/admin/account-verifications' },
            { icon: Shield,         label: t('adminSidebar.insurance'),            path: '/admin/insurance' },
            { icon: ArrowRightLeft, label: t('adminSidebar.profileTransfer'),      path: '/profile-transfer/admin/dashboard', activePath: '/profile-transfer/admin' },
            { icon: BarChart2,      label: t('adminSidebar.analytics'),            path: null },
            { icon: Settings,       label: t('adminSidebar.settings'),             path: null, onClick: () => window.dispatchEvent(new CustomEvent('openProfileModal')) },
            { icon: HelpCircle,     label: t('adminSidebar.helpSupport'),          path: null },
          ].map((item, i) => {
            const active = item.activePath
              ? location.pathname.startsWith(item.activePath)
              : item.path === '/adminpage'
                ? location.pathname === '/adminpage'
                : item.path && location.pathname.startsWith(item.path);
            return (
              <div
                key={i}
                onClick={() => item.onClick ? item.onClick() : item.path && navigate(item.path)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-emerald-700' : 'hover:bg-emerald-700'}`}
              >
                <item.icon size={18} className="text-white shrink-0" />
                <span className="text-white font-medium">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-emerald-700">
          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors bg-red-600 hover:bg-red-700 w-full"
          >
            <LogOut size={18} className="text-white" />
            <span className="text-white font-medium">{t('adminSidebar.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation Bar — matches FarmerLayout / VetLayout */}
        <div className="px-8 py-4 flex items-center bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl flex-shrink-0">
          {/* Left: Page Title */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Profile Transfer</h1>
          </div>

          {/* Right: Bell → Language → Avatar */}
          <div className="flex items-center space-x-6">
            <NotificationBell />
            <LanguageSwitcher context="admin" />
            <div
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            >
              {(() => {
                const imageUrl =
                  user?.profile_image_url ||
                  (user?.profile_image ? `http://localhost:8000${user.profile_image}` : null);
                return imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 font-semibold border-2 border-white">
                    {getInitials(user?.full_name || user?.username || "Admin")}
                  </div>
                );
              })()}
              <p className="text-xs font-medium text-white">
                {user?.full_name || user?.username || "Admin"}
              </p>
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
