import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaPaw, FaSyringe, FaNotesMedical, FaChartLine, FaShieldAlt, FaExchangeAlt, FaCog, FaSignOutAlt, FaCalendarCheck, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getReceivedRequests } from "../../services/friendsApi";
import "../../styles/farmerdashboard.css";

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('dashboard');
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

  const menuItems = [
    { name: t('sidebar.dashboard'), icon: FaHome, path: "/farmerpage" },
    { name: t('sidebar.vetAppointment'), icon: FaCalendarCheck, path: "/farmerappointment" },
    { name: t('sidebar.messages'), icon: FaEnvelope, path: "/messages", badge: 5, badgeColor: "bg-blue-500" },
    { name: t('sidebar.friendRequests'), icon: FaUserFriends, path: "/farmer/friends/requests", badge: friendRequestCount, badgeColor: "bg-green-500" },
    { name: t('sidebar.friends'), icon: FaUserFriends, path: "/farmer/friends/list" },
    { name: t('sidebar.livestock'), icon: FaPaw, path: "/livestock" },
    { name: t('sidebar.vaccination'), icon: FaSyringe, path: "/vaccination", state: { from: 'farmer' } },
    { name: t('sidebar.medicalHistory'), icon: FaNotesMedical, path: "/medical/history", state: { from: 'farmer' } },
    { name: t('sidebar.reports'), icon: FaChartLine, path: "/reports" },
    { name: t('sidebar.insurance'), icon: FaShieldAlt, path: "/farmerinsurancedashboard" },
    { name: t('sidebar.profileTransfer'), icon: FaExchangeAlt, path: "/profile-transfer/farmer/animals" },
    { name: t('sidebar.settings'), icon: FaCog, path: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (item) => {
    if (item.state) {
      navigate(item.path, { state: item.state });
    } else {
      navigate(item.path);
    }
  };

  return (
    <aside className="w-64 bg-emerald-900 min-h-screen flex flex-col py-6 px-4">
      {/* Application Name/Logo at Top */}
      <div className="flex items-center space-x-3 mb-8 px-2">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <span className="text-emerald-900 font-bold text-lg">F</span>
        </div>
        <span className="text-white font-bold text-xl">{t('appName')}</span>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          // Exact path matching - only highlight if paths match exactly
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "bg-emerald-700"
                  : "hover:bg-emerald-700"
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
          <span className="text-white font-medium">{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default SideNav;
