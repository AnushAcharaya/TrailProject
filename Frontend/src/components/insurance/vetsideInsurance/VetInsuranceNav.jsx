import { useNavigate, useLocation } from 'react-router-dom';
import { FaClipboardList, FaCheckCircle, FaUser } from 'react-icons/fa';

const VetInsuranceNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/vetinsurancereviewdashboard', icon: FaClipboardList, label: 'Review Dashboard' },
    { path: '/vetinsuranceverifyclaim', icon: FaCheckCircle, label: 'Verify Claims' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-emerald-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-bold">V</span>
            </div>
            <span className="font-bold text-lg">Vet Portal</span>
          </div>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="w-px h-6 bg-emerald-200 mx-2" />
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all">
              <FaUser className="w-5 h-5" />
              <span className="text-sm">Vet</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default VetInsuranceNav;
