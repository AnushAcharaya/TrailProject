import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";
import NotificationBell from "../notifications/NotificationBell";
import { getUserProfile } from "../../services/profileApi";
import "../../styles/farmerdashboard.css";
import "../../styles/languageSwitcher.css";
import "../../styles/notifications.css";

// Read whatever the login flow stored, so we have a name to render on first
// paint instead of waiting for the profile API call.
const readStoredUser = () => {
  try {
    const raw =
      sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const TopNav = ({ pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const [user, setUser] = useState(readStoredUser);

  const fetchProfile = useCallback(async () => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) return;
      const result = await getUserProfile();
      if (result.success) {
        setUser(result.data);
      } else {
        // Fallback to whatever the auth flow stored at login time
        const stored =
          sessionStorage.getItem("user") || localStorage.getItem("user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            /* ignore parse errors */
          }
        }
      }
    } catch (err) {
      console.error("[TopNav] failed to load profile:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    // Refresh when auth or profile changes elsewhere
    const onLogin = () => fetchProfile();
    const onUpdate = () => fetchProfile();
    window.addEventListener("userLoggedIn", onLogin);
    window.addEventListener("profileUpdated", onUpdate);
    return () => {
      window.removeEventListener("userLoggedIn", onLogin);
      window.removeEventListener("profileUpdated", onUpdate);
    };
  }, [fetchProfile]);

  // Build display name and initials from the real logged-in user.
  // Fall back ONLY when the profile hasn't loaded yet.
  const getInitials = () => {
    const name = user?.full_name || user?.username || "";
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getDisplayName = () => {
    if (user?.full_name) return user.full_name.split(/\s+/)[0]; // first name
    if (user?.username) return user.username;
    return t("profile.name");
  };

  const profileImageUrl = user?.profile_image_url || null;

  return (
    <header className="fixed top-0 left-64 right-0 px-8 py-4 flex items-center bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-2xl z-10">
      <h1 className="text-2xl font-bold text-white">
        {t(pageTitle === "Dashboard" ? "title" : pageTitle)}
      </h1>
      <div className="flex items-center space-x-6 ml-auto">
        <NotificationBell />
        <LanguageSwitcher context="farmer" />

        {/* Profile with name below */}
        <div
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white overflow-hidden">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={getDisplayName()}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If the image URL 404s, fall back to initials.
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-emerald-600 font-semibold">
                {getInitials()}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-white">
            {getDisplayName()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
