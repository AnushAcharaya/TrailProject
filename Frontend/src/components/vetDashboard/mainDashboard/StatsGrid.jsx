import { useTranslation } from 'react-i18next';

function StatsGrid({ stats, loading }) {
  const { t } = useTranslation('vetDashboard');

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default values if stats not loaded
  const statsData = [
    { 
      value: stats?.total_farmers || '0', 
      label: t('dashboard.stats.farmersTreated'), 
      icon: '👨‍🌾', 
      color: 'bg-blue-500' 
    },
    { 
      value: stats?.total_animals || '0', 
      label: t('dashboard.stats.animalsTreated'), 
      icon: '🐄', 
      color: 'bg-cyan-500' 
    },
    { 
      value: stats?.pending_treatments || '0', 
      label: t('dashboard.stats.pendingAppointments'), 
      icon: '⏳', 
      color: 'bg-yellow-500' 
    },
    { 
      value: stats?.todays_appointments || '0', 
      label: t('dashboard.stats.todaysAccepted'), 
      icon: '✅', 
      color: 'bg-green-500' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
