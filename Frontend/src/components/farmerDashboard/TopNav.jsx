import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";
import "../../styles/farmerdashboard.css";
import "../../styles/languageSwitcher.css";

const TopNav = ({ pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  return (
    <header className="fixed top-0 left-64 right-0 px-8 py-4 flex items-center bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl z-10">
      <h1 className="text-2xl font-bold text-white">{t(pageTitle === "Dashboard" ? 'title' : pageTitle)}</h1>
      <div className="flex items-center space-x-6 ml-auto">
        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <FaBell className="text-white text-xl" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {t('notifications.count')}
          </span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher context="farmer" />
        
        {/* Profile with Name Below */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white">
            <span className="text-emerald-600 font-semibold">{t('profile.initials')}</span>
          </div>
          <span className="text-xs font-medium text-white">{t('profile.name')}</span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
