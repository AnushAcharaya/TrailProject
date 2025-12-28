// SettingsTab.jsx
import React from "react";

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
const ToggleSwitch = ({ checked, onChange, onLabel = "ON", offLabel = "OFF" }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-200 hover:shadow-lg"
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
  // provide safe defaults so buttons always work
  const {
    theme = "light",
    language = "en",
    emailNotifications = true,
    pushNotifications = false,
  } = preferences;

  const toggleTheme = () => {
    onUpdate({
      theme: theme === "light" ? "dark" : "light",
    });
  };

  const toggleLanguage = () => {
    onUpdate({
      language: language === "en" ? "np" : "en",
    });
  };

  const toggleEmail = () => {
    onUpdate({
      emailNotifications: !emailNotifications,
    });
  };

  const togglePush = () => {
    onUpdate({
      pushNotifications: !pushNotifications,
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
        These settings are for UI demo only and are not persisted anywhere.
      </p>

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
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: BRAND.textDark }}>Push notifications</span>
            <ToggleSwitch checked={pushNotifications} onChange={togglePush} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
