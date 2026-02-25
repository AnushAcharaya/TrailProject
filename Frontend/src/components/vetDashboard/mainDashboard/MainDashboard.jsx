import { FaBell } from 'react-icons/fa';
import VetLayout from '../VetLayout';
import StatsGrid from './StatsGrid';
import ActivityCard from './ActivityCard';
import TaskAlertCard from './TaskAlertCard';

function MainDashboard() {
  return (
    <VetLayout pageTitle="Dashboard">
        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <StatsGrid />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            <button className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Search Farmer</span>
            </button>
            
            <button className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Add Treatment</span>
            </button>
            
            <button className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Add Vaccination</span>
            </button>
            
            <button className="flex items-center space-x-3 px-6 py-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all">
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
            <ActivityCard />
            <TaskAlertCard />
          </div>
        </div>
    </VetLayout>
  );
}

export default MainDashboard;
