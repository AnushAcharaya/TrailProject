import React, { useState, useEffect } from "react";
import TopNav from "./AdminTopNav";
import SideNav from "./AdminSideNav";
import { useLocation } from "react-router-dom";
import ProfilePage from "./profile/ProfilePage";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Check if we're on a Profile Transfer admin page
  const isProfileTransferAdmin = location.pathname.startsWith('/profile-transfer/admin');

  // Listen for profile modal open event
  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('openProfileModal', handleOpenProfile);
    return () => window.removeEventListener('openProfileModal', handleOpenProfile);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Top Navigation - Hide on Profile Transfer admin pages */}
      {!isProfileTransferAdmin && <TopNav toggleSidebar={toggleSidebar} />}

      {/* Flex container: Sidebar + Main Content */}
      <div className={`${!isProfileTransferAdmin ? 'pt-16' : ''} flex h-full`}>
        {/* Sidebar - Fixed, non-scrollable */}
        <SideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main content - Scrollable area */}
        <main className="flex-1 md:ml-64 w-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Profile Modal Overlay */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[60]">
          <ProfilePage onClose={() => setIsProfileOpen(false)} />
        </div>
      )}
    </div>
  );
}
