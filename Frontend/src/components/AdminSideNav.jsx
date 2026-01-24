import React, { useState } from "react";
import { Users, CheckCircle, BarChart2, Settings, HelpCircle, X, LogOut, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SideNav({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
              <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                Yes, Logout
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
          fixed top-16 left-0
          h-[calc(100vh-4rem)] w-64
          bg-white shadow-lg p-6
          flex flex-col gap-6
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between md:justify-start">
          <h2 className="text-xl font-bold">LivestockHub</h2>
          <button className="md:hidden ml-auto" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 mt-6 text-gray-700">
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <Users size={18} /> All Users
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <CheckCircle size={18} /> Account Verifications
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <BarChart2 size={18} /> Analytics
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <Settings size={18} /> Settings
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <HelpCircle size={18} /> Help & Support
          </a>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium mt-auto mb-4 w-full justify-center"
        >
          <LogOut size={18} /> Logout
        </button>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} LivestockHub
        </div>
      </aside>
    </>
  );
}
