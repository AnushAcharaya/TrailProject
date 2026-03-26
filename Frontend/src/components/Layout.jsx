import React, { useState } from "react";
import TopNav from "./AdminTopNav";
import SideNav from "./AdminSideNav";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Check if we're on a Profile Transfer admin page
  const isProfileTransferAdmin = location.pathname.startsWith('/profile-transfer/admin');

  return (
    <div className="w-full min-h-screen">
      {/* Top Navigation - Hide on Profile Transfer admin pages */}
      {!isProfileTransferAdmin && <TopNav toggleSidebar={toggleSidebar} />}

      {/* Flex container: Sidebar + Main Content */}
      <div className={`${!isProfileTransferAdmin ? 'pt-16' : ''} flex min-h-[calc(100vh-4rem)]`}>
        {/* Sidebar */}
        <SideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main content - add left margin on desktop to account for sidebar */}
        <main className="flex-1 md:ml-64 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
