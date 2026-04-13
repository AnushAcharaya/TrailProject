// SettingsTab.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  
  // Use i18n's current language as the source of truth
  const currentLanguage = i18n.language;
  
  // provide safe defaults so buttons always work
  const {
    theme = "light",
    language = currentLanguage,
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
      setStatus(t('settingsTab.messages.success'));
      setTimeout(() => setStatus(null), 2000);
    } else {
      const errorMsg = result.error?.theme?.[0] || 
                       result.error?.language?.[0] || 
                       result.error?.email_notifications?.[0] ||
                       result.error?.push_notifications?.[0] ||
                       result.error?.message || 
                       t('settingsTab.messages.error');
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
    // Determine new language
    const newLanguage = currentLanguage === "en" ? "ne" : "en";
    
    // Update i18n language immediately for UI
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Also update backend preference
    handlePreferenceUpdate({
      language: newLanguage === "en" ? "en" : "np",
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
        {t('settingsTab.title')}
      </h3>
      <p className="text-xs mb-4" style={{ color: BRAND.textLight }}>
        {t('settingsTab.subtitle')}
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
              {t('settingsTab.theme.label')}
            </p>
            <p className="text-xs" style={{ color: BRAND.textLight }}>
              {t('settingsTab.theme.description')}
            </p>
          </div>
          <ToggleSwitch
            checked={theme === "dark"}
            onChange={toggleTheme}
            onLabel={t('settingsTab.theme.dark')}
            offLabel={t('settingsTab.theme.light')}
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
              {t('settingsTab.language.label')}
            </p>
            <p className="text-xs" style={{ color: BRAND.textLight }}>
              {t('settingsTab.language.current')}{" "}
              <span className="font-semibold" style={{ color: BRAND.primary }}>
                {currentLanguage === "en" ? t('settingsTab.language.english') : t('settingsTab.language.nepali')}
              </span>
            </p>
          </div>
          <ToggleSwitch
            checked={currentLanguage !== "en"}
            onChange={toggleLanguage}
            onLabel={t('settingsTab.language.np')}
            offLabel={t('settingsTab.language.en')}
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
            {t('settingsTab.notifications.label')}
          </p>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: BRAND.textDark }}>
              {t('settingsTab.notifications.email')}
            </span>
            <ToggleSwitch
              checked={emailNotifications}
              onChange={toggleEmail}
              onLabel={t('settingsTab.notifications.on')}
              offLabel={t('settingsTab.notifications.off')}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: BRAND.textDark }}>{t('settingsTab.notifications.push')}</span>
            <ToggleSwitch 
              checked={pushNotifications} 
              onChange={togglePush} 
              onLabel={t('settingsTab.notifications.on')}
              offLabel={t('settingsTab.notifications.off')}
              disabled={loading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
