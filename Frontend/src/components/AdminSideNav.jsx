import React, { useState } from "react";
import {
  Users, CheckCircle, Settings,
  HelpCircle, LogOut, AlertTriangle, Shield,
  ArrowRightLeft, Megaphone,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('admin');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/adminpage') return location.pathname === '/adminpage';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { icon: Users,          label: t('sideNav.allUsers'),              path: '/adminpage' },
    { icon: CheckCircle,    label: t('sideNav.accountVerifications'),  path: '/admin/account-verifications' },
    { icon: Shield,         label: t('sideNav.insurance'),             path: '/admin/insurance' },
    { icon: ArrowRightLeft, label: t('sideNav.profileTransfer'),       path: '/profile-transfer/admin/dashboard' },
    { icon: Megaphone,      label: t('sideNav.broadcast'),             path: '/admin/broadcast' },
{
      icon: Settings,
      label: t('sideNav.settings'),
      path: null,
      onClick: () => window.dispatchEvent(new CustomEvent('openProfileModal')),
    },
    { icon: HelpCircle, label: t('sideNav.helpSupport'), path: null },
  ];

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-xl font-bold text-gray-800">{t('logoutModal.title')}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t('logoutModal.message')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
              >
                {t('logoutModal.cancel')}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                {t('logoutModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar — full height, matches FarmerLayout / VetLayout */}
      <div className="w-64 bg-emerald-900 flex flex-col py-6 px-4 fixed left-0 top-0 h-screen z-40">

        {/* Branding */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">A</span>
          </div>
          <span className="text-white font-bold text-xl">LivestockHub</span>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                item.onClick ? item.onClick() : item.path && navigate(item.path)
              }
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isActive(item.path) ? 'bg-emerald-700' : 'hover:bg-emerald-700'
              }`}
            >
              <item.icon size={18} className="text-white shrink-0" />
              <span className="text-white font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-emerald-700">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors bg-red-600 hover:bg-red-700 w-full"
          >
            <LogOut size={18} className="text-white" />
            <span className="text-white font-medium">{t('sideNav.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
