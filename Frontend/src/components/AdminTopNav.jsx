import { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";
import { getUserProfile } from "../services/profileApi";
import "../styles/languageSwitcher.css";

export default function TopNav({ toggleSidebar }) {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user profile from API
    const fetchProfile = async () => {
      const result = await getUserProfile();
      if (result.success) {
        console.log('[AdminTopNav] Profile data received:', result.data);
        console.log('[AdminTopNav] Profile image URL:', result.data.profile_image_url);
        console.log('[AdminTopNav] Profile image:', result.data.profile_image);
        setUser(result.data);
      } else {
        console.error('[AdminTopNav] Failed to fetch profile:', result.error);
        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
    };
    
    fetchProfile();
  }, []);

  // Get initials from name for avatar
  const getInitials = (name) => {
    if (!name) return "A";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Navigate to profile page
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl fixed top-0 left-0 z-50">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-0 md:gap-3">
          {/* Hamburger button */}
          <button
            className="md:hidden p-2 rounded-lg border border-white/30 text-white hover:bg-white/10"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>

          <div className="ml-0">
            <h1 className="text-lg lg:text-xl font-semibold text-white">
              {t('topNav.title')}
            </h1>
            <p className="text-xs text-emerald-50 hidden sm:block">
              {t('topNav.subtitle')}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Language Switcher */}
          <LanguageSwitcher context="admin" theme="dark" />
          
          <Bell size={22} className="text-white cursor-pointer hover:opacity-80 transition-opacity" />
          
          {/* Profile Section */}
          <div 
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            {/* Round Profile Image/Icon */}
            {(() => {
              const hasImageUrl = user?.profile_image_url;
              const hasImage = user?.profile_image;
              const imageUrl = hasImageUrl || (hasImage ? `http://localhost:8000${user.profile_image}` : null);
              
              console.log('[AdminTopNav] Rendering profile image:', {
                hasImageUrl,
                hasImage,
                imageUrl,
                user
              });
              
              return imageUrl ? (
                <img 
                  src={imageUrl}
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover shadow-md hover:shadow-lg transition-shadow border-2 border-white"
                  onError={(e) => {
                    console.error('[AdminTopNav] Image failed to load:', imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 font-semibold shadow-md hover:shadow-lg transition-shadow border-2 border-white">
                  {getInitials(user?.full_name || user?.username || "Admin")}
                </div>
              );
            })()}
            {/* Name below icon */}
            <p className="text-xs font-medium text-white hidden sm:block">
              {user?.full_name || user?.username || "Admin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
