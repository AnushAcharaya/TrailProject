import React, { useState, useEffect } from "react";
import TopNav from "./AdminTopNav";
import SideNav from "./AdminSideNav";
import ProfilePage from "./profile/ProfilePage";

export default function Layout({ children }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('openProfileModal', handleOpenProfile);
    return () => window.removeEventListener('openProfileModal', handleOpenProfile);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — fixed left, full height, matches FarmerLayout */}
      <SideNav />

      {/* Content column — offset by sidebar width */}
      <div className="flex-1 flex flex-col ml-64 h-screen overflow-hidden">
        {/* Navbar — inside content column, not fixed full-width */}
        <TopNav />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[60]">
          <ProfilePage onClose={() => setIsProfileOpen(false)} />
        </div>
      )}
    </div>
  );
}
