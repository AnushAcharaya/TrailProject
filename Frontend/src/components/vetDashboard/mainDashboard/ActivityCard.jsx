import { useTranslation } from 'react-i18next';

function ActivityCard({ activities, loading }) {
  const { t } = useTranslation('vetDashboard');

  // Helper function to format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    if (diffInSeconds < 60) return t('dashboard.timeAgo.justNow');
    if (diffInSeconds < 3600) return t('dashboard.timeAgo.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('dashboard.timeAgo.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    return t('dashboard.timeAgo.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
  };

  // Get icon based on activity type
  const getIcon = (type) => {
    switch (type) {
      case 'treatment': return '🏥';
      case 'vaccination': return '💉';
      case 'new_animal': return '🐄';
      default: return '📋';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.recentActivities')}</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-3 py-2 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.recentActivities')}</h3>
        <div className="text-center py-8 text-gray-500">
          <p>{t('dashboard.noRecentActivities')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.recentActivities')}</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 py-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityCard;
