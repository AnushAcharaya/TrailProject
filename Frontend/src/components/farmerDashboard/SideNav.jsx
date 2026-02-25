import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaPaw, FaSyringe, FaNotesMedical, FaChartLine, FaShieldAlt, FaExchangeAlt, FaCog, FaSignOutAlt, FaCalendarCheck } from 'react-icons/fa';
import "../../styles/farmerdashboard.css";

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <span className="text-white font-bold text-xl">FarmCare</span>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => handleNavigation(item)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              location.pathname === item.path
                ? "bg-emerald-700"
                : "hover:bg-emerald-700"
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
    </aside>
  );
};

export default SideNav;
