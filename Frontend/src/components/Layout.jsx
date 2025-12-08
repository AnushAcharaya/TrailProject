import React, { useState } from "react";
import TopNav from "./AdminTopNav";
import SideNav from "./AdminSideNav";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="w-full min-h-screen">
      {/* Top Navigation */}
      <TopNav toggleSidebar={toggleSidebar} />

      {/* Flex container: Sidebar + Main Content */}
      <div className="pt-16 flex min-h-[calc(100vh-4rem)]">
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
