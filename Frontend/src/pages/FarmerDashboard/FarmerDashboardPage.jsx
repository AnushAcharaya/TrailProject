import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import TopNav from "../../components/farmerDashboard/TopNav";
import SideNav from "../../components/farmerDashboard/SideNav";
import SearchBar from "../../components/farmerDashboard/SearchBar";
import SummaryCards from "../../components/farmerDashboard/SummaryCards";
import ChartsSection from "../../components/farmerDashboard/ChartsSection";
import RecentActivity from "../../components/farmerDashboard/RecentActivity";
import {
  getFarmerDashboardStats,
  getFarmerDashboardCharts,
  getFarmerDashboardActivities,
} from "../../services/farmerDashboardApi";
import "../../styles/farmerdashboard.css";

const FarmerDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation('dashboard');

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      const [statsRes, chartsRes, activitiesRes] = await Promise.all([
        getFarmerDashboardStats(),
        getFarmerDashboardCharts(),
        getFarmerDashboardActivities(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (chartsRes.success) setCharts(chartsRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SideNav />
      </div>

      <main className="flex-1 flex flex-col ml-64">
        <div className="lg:hidden bg-white px-4 py-3 flex items-center justify-between border-b">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="font-semibold text-slate-800">{t('appName')}</h1>
          <div className="w-10" />
        </div>

        <TopNav pageTitle={t('title')} />

        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 mt-20">
          <SearchBar />
          <SummaryCards stats={stats} loading={loading} />
          <ChartsSection charts={charts} loading={loading} />
          <RecentActivity activities={activities} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboardPage;
