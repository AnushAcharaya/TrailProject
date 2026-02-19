// pages/profileTransfer/farmerSide/AnimalList.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiCow } from 'react-icons/gi';
import { FaPaperPlane, FaInbox } from 'react-icons/fa';
import AnimalList from '../../../components/profileTransfer/farmerSide/animalList/AnimalList';
import '../../../styles/profileTransfer/farmerSide/animalList.css';

export default function AnimalListPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("My Animals");

  const menuItems = [
    { name: "My Animals", icon: GiCow, path: "/profile-transfer/farmer/animals" },
    { name: "Sent Transfers", icon: FaPaperPlane, path: "/profile-transfer/farmer/sent" },
    { name: "Requests", icon: FaInbox, path: "/profile-transfer/receiver/requests" },
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item.name);
    navigate(item.path);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Sidebar */}
      <aside className="w-56 bg-emerald-700 min-h-screen p-4 flex flex-col">
        {/* Profile Transfer Heading */}
        <div className="mb-6 pb-4 border-b border-emerald-600">
          <h1 className="text-white text-lg font-bold">Profile Transfer</h1>
        </div>

        {/* Section Header */}
        <div className="mb-4">
          <h2 className="text-white text-xs font-semibold tracking-wide uppercase opacity-75">FARMER</h2>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={() => handleMenuClick(item)}
                className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${
                  activeMenu === item.name 
                    ? "bg-white text-emerald-700 font-medium" 
                    : "text-white hover:bg-emerald-600"
                }`}
              >
                <IconComponent className="text-lg" />
                <span className="text-sm">{item.name}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <AnimalList />
      </div>
    </div>
  );
}
