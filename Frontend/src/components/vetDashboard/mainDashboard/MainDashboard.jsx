import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../VetLayout';
import StatsGrid from './StatsGrid';
import ActivityCard from './ActivityCard';
import TaskAlertCard from './TaskAlertCard';
import { getDashboardStats, getRecentActivities, getPendingAlerts } from '../../../services/vetDashboardApi';

function MainDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all dashboard data in parallel
      const [statsResult, activitiesResult, alertsResult] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(10),
        getPendingAlerts()
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.error('Failed to fetch stats:', statsResult.error);
      }

      if (activitiesResult.success) {
        setActivities(activitiesResult.data);
      } else {
        console.error('Failed to fetch activities:', activitiesResult.error);
      }

      if (alertsResult.success) {
        setAlerts(alertsResult.data);
      } else {
        console.error('Failed to fetch alerts:', alertsResult.error);
      }

      // If all failed, show error
      if (!statsResult.success && !activitiesResult.success && !alertsResult.success) {
        setError('Failed to load dashboard data. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VetLayout pageTitle="Dashboard">
        {/* Dashboard Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-red-700">{error}</span>
                <button 
                  onClick={fetchDashboardData}
                  className="text-red-700 hover:text-red-900 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <StatsGrid stats={stats} loading={loading} />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            <button 
              onClick={() => navigate('/vet/farmer-profiles')}
              className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Search Farmer</span>
            </button>
            
            <button 
              onClick={() => navigate('/vet/farmer-profiles')}
              className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Add Treatment</span>
            </button>
            
            <button 
              onClick={() => navigate('/vet/farmer-profiles')}
              className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Add Vaccination</span>
            </button>
            
            <button 
              onClick={() => navigate('/vet/farmer-profiles')}
              className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">View Medical History</span>
            </button>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityCard activities={activities} loading={loading} />
            <TaskAlertCard alerts={alerts} loading={loading} />
          </div>
        </div>
    </VetLayout>
  );
}

export default MainDashboard;
