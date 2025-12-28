// ProfilePage.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaCog, FaCheckCircle } from "react-icons/fa";
import ProfileCard from "./ProfileCard";
import ProfileTab from "./ProfileTab";
import PasswordTab from "./PasswordTab";
import SettingsTab from "./SettingTab";
import LogoutButton from "./LogoutButton";

// Dummy user data (no backend)
const DUMMY_USER = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  username: "johnny_dev",
  phone: "+977-9800000000",
  location: "Kathmandu, Nepal",
  bio: "Full‑stack developer, coffee lover, and open‑source contributor.",
  profile_image:
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
  joined_at: "2023-01-12",
  role: "Developer",
  gender: "male",
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(DUMMY_USER);

  const handleProfileUpdate = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

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
          <div>
            <h1 className="text-lg md:text-xl font-semibold" style={{ color: "#212121" }}>
              Account Settings
            </h1>
            <p className="text-[11px] md:text-xs" style={{ color: "#757575" }}>
              Manage your profile and security.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px]" style={{ color: "#757575" }}>
            <FaCheckCircle className="text-green-600" />
            <span>Demo mode – changes are local only.</span>
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
                        theme: "light",
                        language: "en",
                        emailNotifications: true,
                        pushNotifications: false,
                      }}
                      onUpdate={() => {}}
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
