// SettingsTab.jsx
import React, { useState } from "react";
import { updatePreferences } from "../../services/profileApi";

// Brand colors (from your palette)
const BRAND = {
  primary: "#2E7D32",
  primaryLight: "#4CAF50",
  bgLight: "#F1F8E9",
  cardBg: "#F9FAFB",
  border: "#E0E0E0",
  textDark: "#212121",
  textLight: "#757575",
};

// Reusable toggle using brand green gradient
const ToggleSwitch = ({ checked, onChange, onLabel = "ON", offLabel = "OFF", disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: checked
          ? `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.primaryLight})`
          : BRAND.border,
      }}
    >
      <span
        className={`absolute left-2 text-[10px] font-semibold tracking-wide text-white transition-opacity duration-200
          ${checked ? "opacity-100" : "opacity-0"}`}
      >
        {onLabel}
      </span>
      <span
        className={`absolute right-2 text-[10px] font-semibold tracking-wide text-white transition-opacity duration-200
          ${checked ? "opacity-0" : "opacity-100"}`}
      >
        {offLabel}
      </span>
      <span
        className={`absolute bg-white rounded-full h-6 w-6 shadow-md transform transition-transform duration-200
          ${checked ? "translate-x-7" : "translate-x-0"}`}
      />
    </button>
  );
};

const SettingsTab = ({ preferences = {}, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  
  // provide safe defaults so buttons always work
  const {
    theme = "light",
    language = "en",
    emailNotifications = true,
    pushNotifications = false,
  } = preferences;

  const handlePreferenceUpdate = async (updatedPreference) => {
    setLoading(true);
    setError(null);
    setStatus(null);
    
    const result = await updatePreferences(updatedPreference);
    
    if (result.success) {
      onUpdate(result.data);
      setStatus("Preferences updated successfully!");
      setTimeout(() => setStatus(null), 2000);
    } else {
      const errorMsg = result.error?.theme?.[0] || 
                       result.error?.language?.[0] || 
                       result.error?.email_notifications?.[0] ||
                       result.error?.push_notifications?.[0] ||
                       result.error?.message || 
                       "Failed to update preferences.";
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
    
    setLoading(false);
  };

  const toggleTheme = () => {
    handlePreferenceUpdate({
      theme: theme === "light" ? "dark" : "light",
    });
  };

  const toggleLanguage = () => {
    handlePreferenceUpdate({
      language: language === "en" ? "np" : "en",
    });
  };

  const toggleEmail = () => {
    handlePreferenceUpdate({
      email_notifications: !emailNotifications,
    });
  };

  const togglePush = () => {
    handlePreferenceUpdate({
      push_notifications: !pushNotifications,
    });
  };

  return (
    <div
      className="rounded-xl p-4 md:p-5"
      style={{
        background: `linear-gradient(135deg, ${BRAND.bgLight}, #FFFFFF)`,
      }}
    >
      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: BRAND.textDark }}
      >
        Preferences
      </h3>
      <p className="text-xs mb-4" style={{ color: BRAND.textLight }}>
        Customize your experience with theme, language, and notification settings.
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 rounded-md text-xs" style={{ backgroundColor: "#FFEBEE", color: "#C62828", border: "1px solid #FFCDD2" }}>
          {error}
        </div>
      )}

      {/* Success message */}
      {status && (
        <div className="mb-3 p-3 rounded-md text-xs" style={{ backgroundColor: "#C8E6C9", color: BRAND.primaryDark, border: `1px solid ${BRAND.primaryLight}` }}>
          {status}
        </div>
      )}

      <div className="space-y-4">
        {/* Theme */}
        <div
          className="border rounded-lg p-3 flex items-center justify-between bg-white/90 backdrop-blur
                     transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: BRAND.textDark }}>
              Theme
            </p>
            <p className="text-xs" style={{ color: BRAND.textLight }}>
              Switch between light and dark preview.
            </p>
          </div>
          <ToggleSwitch
            checked={theme === "dark"}
            onChange={toggleTheme}
            onLabel="DARK"
            offLabel="LIGHT"
            disabled={loading}
          />
        </div>

        {/* Language */}
        <div
          className="border rounded-lg p-3 flex items-center justify-between bg-white/90 backdrop-blur
                     transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: BRAND.textDark }}>
              Language
            </p>
            <p className="text-xs" style={{ color: BRAND.textLight }}>
              Current language:{" "}
              <span className="font-semibold" style={{ color: BRAND.primary }}>
                {language === "en" ? "English" : "Nepali"}
              </span>
            </p>
          </div>
          <ToggleSwitch
            checked={language !== "en"}
            onChange={toggleLanguage}
            onLabel="NP"
            offLabel="EN"
            disabled={loading}
          />
        </div>

        {/* Notifications */}
        <div
          className="border rounded-lg p-3 space-y-3 bg-white/90 backdrop-blur
                     transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          style={{ borderColor: BRAND.border, backgroundColor: BRAND.cardBg }}
        >
          <p className="text-sm font-medium" style={{ color: BRAND.textDark }}>
            Notifications
          </p>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: BRAND.textDark }}>
              Email notifications for activity
            </span>
            <ToggleSwitch
              checked={emailNotifications}
              onChange={toggleEmail}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: BRAND.textDark }}>Push notifications</span>
            <ToggleSwitch checked={pushNotifications} onChange={togglePush} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
