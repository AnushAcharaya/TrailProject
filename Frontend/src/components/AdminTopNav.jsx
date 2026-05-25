import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LanguageSwitcher from "./common/LanguageSwitcher";
import NotificationBell from "./notifications/NotificationBell";
import { getUserProfile } from "../services/profileApi";
import "../styles/notifications.css";

const PAGE_TITLES = {
  '/adminpage':                      'Dashboard',
  '/admin/account-verifications':    'Account Verifications',
  '/admin/insurance':                'Insurance',
  '/admin/broadcast':                'Send Announcement',
  '/admin/analytics':                'Analytics',
  '/profile-transfer/admin':         'Profile Transfer',
};

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getUserProfile();
      if (result.success) {
        setUser(result.data);
      } else {
        const stored = localStorage.getItem('user');
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch {}
        }
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Dashboard';

  const imageUrl =
    user?.profile_image_url ||
    (user?.profile_image ? `http://localhost:8000${user.profile_image}` : null);

  return (
    <div className="px-8 py-4 flex items-center bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl flex-shrink-0">
      {/* Left: Page Title */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
      </div>

      {/* Right: Bell → Language → Avatar  (same order as FarmerLayout) */}
      <div className="flex items-center space-x-6">
        <NotificationBell />
        <LanguageSwitcher context="admin" theme="dark" />

        {/* Avatar + name */}
        <div
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/profile')}
        >
          {imageUrl ? (
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
          )}
          <p className="text-xs font-medium text-white">
            {user?.full_name || user?.username || "Admin"}
          </p>
        </div>
      </div>
    </div>
  );
}
