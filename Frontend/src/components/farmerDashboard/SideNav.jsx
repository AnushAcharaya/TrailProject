import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/farmerdashboard.css";

const SideNav = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Livestock", icon: "🐄" },
    { name: "Vaccination", icon: "💉" },
    { name: "Medical History", icon: "📋" },
    { name: "Reports", icon: "📈" },
    { name: "Profile", icon: "👤" },
  ];

  const handleMenuClick = (itemName) => {
    if (itemName === "Profile") {
      navigate('/profile');
    }
    // Add other navigation logic here for other menu items
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <aside className="w-64 bg-white min-h-screen p-5 flex flex-col">
        {/* Application Name/Logo at Top */}
        <div className="mb-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              🌾
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">LivestockHub</h1>
              <p className="text-xs text-slate-500">Livestock Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleMenuClick(item.name)}
              className={`px-4 py-3 rounded-lg cursor-pointer sidebar-item flex items-center gap-3 ${
                item.name === "Dashboard" ? "sidebar-active" : "text-slate-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Confirm Logout
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideNav;
