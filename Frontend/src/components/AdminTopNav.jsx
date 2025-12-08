import { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";

export default function TopNav({ toggleSidebar }) {
  const [user, setUser] = useState({ full_name: "Admin", email: "admin@livestockhub.com" });

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <div className="w-full bg-white shadow fixed top-0 left-0 z-50">
      <div className="max-w-screen-2xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Hamburger button */}
          <button
            className="md:hidden p-2 rounded-lg border"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-lg lg:text-xl font-semibold">
              LivestockHub Admin
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Manage farmer & vet verification
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Bell size={22} className="text-gray-600" />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.full_name || user.username || "Admin"}</p>
            <p className="text-xs text-gray-500">{user.email || "admin@livestockhub.com"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
