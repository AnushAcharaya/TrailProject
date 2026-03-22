import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaShieldAlt, FaUserPlus, FaFileAlt, FaUser 
} from 'react-icons/fa';

const FarmerInsuranceNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/farmerinsurancedashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/farmerinsuranceplan', icon: FaShieldAlt, label: 'Insurance' },
    { path: '/farmerinsuranceenroll', icon: FaUserPlus, label: 'Enroll' },
    { path: '/farmerinsurancesubmitclaim', icon: FaFileAlt, label: 'Claims' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="w-6 h-6" />
            <span className="text-xl font-bold">Farmer Portal</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'hover:bg-white/10 text-emerald-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="w-px h-6 bg-emerald-200 mx-2" />
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-500/20 transition-all">
              <FaUser className="w-5 h-5 text-emerald-100" />
              <span className="text-sm">Farmer</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default FarmerInsuranceNav;
