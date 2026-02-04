import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import TopNav from "../../components/farmerDashboard/TopNav";
import SideNav from "../../components/farmerDashboard/SideNav";
import SearchBar from "../../components/farmerDashboard/SearchBar";
import SummaryCards from "../../components/farmerDashboard/SummaryCards";
import ChartsSection from "../../components/farmerDashboard/ChartsSection";
import RecentActivity from "../../components/farmerDashboard/RecentActivity";
import "../../styles/farmerdashboard.css";

const FarmerDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide in when open */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SideNav />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden bg-white px-4 py-3 flex items-center justify-between border-b">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="font-semibold text-slate-800">LivestockHub</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <TopNav />

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <SearchBar />
          <SummaryCards />
          <ChartsSection />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboardPage;
