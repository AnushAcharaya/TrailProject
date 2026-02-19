import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList } from 'react-icons/fa';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-700 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">Livestock Pro</h2>
          <p className="text-sm text-emerald-200">Profile Transfers</p>
        </div>
        
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/profile-transfer/admin/dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/profile-transfer/admin/dashboard')
                  ? 'bg-white text-emerald-700' 
                  : 'text-white hover:bg-emerald-600'
              }`}
            >
              <FaTachometerAlt className="text-lg" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button
              onClick={() => navigate('/profile-transfer/admin/review')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/profile-transfer/admin/review')
                  ? 'bg-white text-emerald-700' 
                  : 'text-white hover:bg-emerald-600'
              }`}
            >
              <FaClipboardList className="text-lg" />
              <span className="font-medium">Review Transfers</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-emerald-50">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
