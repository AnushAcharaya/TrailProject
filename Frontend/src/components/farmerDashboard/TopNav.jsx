import { FiBell, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../../styles/farmerdashboard.css";

const TopNav = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-700 text-white flex items-center justify-center font-bold">
          FC
        </div>
        <div>
          <h1 className="font-semibold text-slate-800">FarmCare</h1>
          <p className="text-xs text-slate-500">Livestock Manager</p>
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <FiBell size={20} className="text-slate-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
          onClick={() => navigate('/profile')}
        >
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
            <FiUser className="text-slate-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-700">John Doe</p>
            <p className="text-xs text-slate-500">Farm Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
