function TaskAlertCard({ alerts, loading }) {
  // Get icon and color based on priority
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: '🔴', bgColor: 'bg-red-50' };
      case 'medium':
        return { icon: '🟡', bgColor: 'bg-yellow-50' };
      case 'low':
        return { icon: '🟢', bgColor: 'bg-green-50' };
      default:
        return { icon: '⚪', bgColor: 'bg-gray-50' };
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks & Alerts</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 py-2 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks & Alerts</h3>
        <div className="text-center py-8 text-gray-500">
          <p className="text-green-600 font-medium">✓ All tasks complete!</p>
          <p className="text-sm mt-2">No pending alerts at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks & Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const style = getPriorityStyle(alert.priority);
          return (
            <div key={alert.id} className="flex items-start space-x-3 py-2">
              <div className={`w-8 h-8 ${style.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 text-lg`}>
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">{alert.description}</p>
                {alert.days_overdue && (
                  <p className="text-xs text-red-600 mt-1">Overdue by {alert.days_overdue} days</p>
                )}
                {alert.days_until_due !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">Due in {alert.days_until_due} days</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskAlertCard;
