import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { GiCow } from 'react-icons/gi';
import { FaPaperPlane, FaInbox } from 'react-icons/fa';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function ProfileTransferNav() {
  const { t } = useTranslation('profileTransfer');
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: t('nav.myAnimals'), icon: GiCow, path: "/profile-transfer/farmer/animals" },
    { name: t('nav.sentTransfers'), icon: FaPaperPlane, path: "/profile-transfer/farmer/sent" },
    { name: t('nav.requests'), icon: FaInbox, path: "/profile-transfer/receiver/requests" },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item.path)}
                  className={`px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-all text-sm font-medium ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent className="text-base" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center">
            <LanguageSwitcher context="farmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
