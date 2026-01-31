// ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaCog, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProfileCard from "./ProfileCard";
import ProfileTab from "./ProfileTab";
import PasswordTab from "./PasswordTab";
import SettingsTab from "./SettingTab";
import LogoutButton from "./LogoutButton";
import { getUserProfile } from "../../services/profileApi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const result = await getUserProfile();
      
      if (result.success) {
        setUser(result.data);
        setError(null);
      } else {
        setError(result.error?.message || "Failed to load profile.");
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const handlePreferencesUpdate = (updatedPreferences) => {
    setUser((prev) => ({
      ...prev,
      ...updatedPreferences,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-4xl text-green-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return null;
  }

  // overlay background (semi‑transparent dark)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Panel: constrained size for overlay */}
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border"
        style={{
          background:
            "linear-gradient(135deg, #F9FAFB, #F1F8E9)", // neutral + soft green
          borderColor: "#E0E0E0",
        }}
      >
        {/* Top Header */}
        <header
          className="px-5 py-3 flex items-center justify-between border-b"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E0E0E0" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
              style={{ color: "#2E7D32" }}
              title="Go back"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-semibold" style={{ color: "#212121" }}>
                Account Settings
              </h1>
              <p className="text-[11px] md:text-xs" style={{ color: "#757575" }}>
                Manage your profile and security.
              </p>
            </div>
          </div>
        </header>

        {/* Content area: scrollable inside overlay */}
        <main className="px-4 py-4 md:px-5 md:py-5 overflow-y-auto max-h-[calc(90vh-60px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Profile card + logout */}
            <aside className="lg:col-span-1 space-y-3">
              <ProfileCard user={user} />
              <LogoutButton />
            </aside>

            {/* Right: Tabs + content */}
            <section className="lg:col-span-2">
              <div
                className="rounded-xl shadow-sm border"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E0E0E0" }}
              >
                {/* Tabs */}
                <div className="border-b px-4 pt-3" style={{ borderColor: "#E0E0E0" }}>
                  <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-t-md border-b-2 transition-colors ${
                        activeTab === "profile"
                          ? "text-green-800"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                      style={{
                        borderColor:
                          activeTab === "profile" ? "#2E7D32" : "transparent",
                        backgroundColor:
                          activeTab === "profile" ? "#E8F5E9" : "transparent",
                      }}
                    >
                      <FaUser /> Profile
                    </button>

                    <button
                      onClick={() => setActiveTab("password")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-t-md border-b-2 transition-colors ${
                        activeTab === "password"
                          ? "text-green-800"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                      style={{
                        borderColor:
                          activeTab === "password" ? "#2E7D32" : "transparent",
                        backgroundColor:
                          activeTab === "password" ? "#E8F5E9" : "transparent",
                      }}
                    >
                      <FaLock /> Security
                    </button>

                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-t-md border-b-2 transition-colors ${
                        activeTab === "settings"
                          ? "text-green-800"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                      style={{
                        borderColor:
                          activeTab === "settings" ? "#2E7D32" : "transparent",
                        backgroundColor:
                          activeTab === "settings" ? "#E8F5E9" : "transparent",
                      }}
                    >
                      <FaCog /> Preferences
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 md:p-5">
                  {activeTab === "profile" && (
                    <ProfileTab user={user} onUpdate={handleProfileUpdate} />
                  )}
                  {activeTab === "password" && <PasswordTab />}
                  {activeTab === "settings" && (
                    <SettingsTab
                      preferences={{
                        theme: user.theme || "light",
                        language: user.language || "en",
                        emailNotifications: user.email_notifications !== undefined ? user.email_notifications : true,
                        pushNotifications: user.push_notifications !== undefined ? user.push_notifications : false,
                      }}
                      onUpdate={handlePreferencesUpdate}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
