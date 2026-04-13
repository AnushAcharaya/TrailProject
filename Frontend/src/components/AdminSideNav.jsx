import React, { useState } from "react";
import { Users, CheckCircle, BarChart2, Settings, HelpCircle, X, LogOut, AlertTriangle, Shield, ArrowRightLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SideNav({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('admin');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if we're on a Profile Transfer admin page
  const isProfileTransferAdmin = location.pathname.startsWith('/profile-transfer/admin');

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to landing page
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };
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
            <p className="text-gray-600 mb-6">
              {t('logoutModal.message')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
              >
                {t('logoutModal.cancel')}
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                {t('logoutModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 md:hidden z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed ${isProfileTransferAdmin ? 'top-0' : 'top-16'}
          left-0
          ${isProfileTransferAdmin ? 'h-screen' : 'h-[calc(100vh-4rem)]'} w-64
          bg-emerald-900 shadow-lg p-6
          flex flex-col gap-6
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-emerald-900 font-bold text-lg">A</span>
          </div>
          <h2 className="text-xl font-bold text-white">LivestockHub</h2>
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
            <Users size={18} /> {t('sideNav.allUsers')}
          </a>
          <a 
            onClick={() => navigate('/admin/account-verifications')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <CheckCircle size={18} /> {t('sideNav.accountVerifications')}
          </a>
          <a 
            onClick={() => navigate('/admin/insurance')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <Shield size={18} /> {t('sideNav.insurance')}
          </a>
          <a 
            onClick={() => navigate('/profile-transfer/admin/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <ArrowRightLeft size={18} /> {t('sideNav.profileTransfer')}
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer">
            <BarChart2 size={18} /> {t('sideNav.analytics')}
          </a>
          <a 
            onClick={() => {
              // Instead of navigating, we'll trigger a modal
              // For now, let's use a custom event
              window.dispatchEvent(new CustomEvent('openProfileModal'));
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer"
          >
            <Settings size={18} /> {t('sideNav.settings')}
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-white font-medium cursor-pointer">
            <HelpCircle size={18} /> {t('sideNav.helpSupport')}
          </a>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium mt-auto mb-4 w-full justify-center"
        >
          <LogOut size={18} /> {t('sideNav.logout')}
        </button>

        {/* Footer */}
        <div className="text-xs text-emerald-200 text-center border-t border-emerald-700 pt-4">
          {t('sideNav.copyright', { year: new Date().getFullYear() })}
        </div>
      </aside>
    </>
  );
}
