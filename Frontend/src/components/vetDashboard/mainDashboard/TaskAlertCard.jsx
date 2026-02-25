function TaskAlertCard() {
  const alerts = [
    { text: 'Anthrax Vaccine overdue for Ganga (TAG-1001)', icon: '🔴', priority: 'high' },
    { text: 'Deworming (TAG-1003) needs follow-up check-up', icon: '🟡', priority: 'medium' },
    { text: 'Blood Test (TAG-4001) scheduled cookie pending', icon: '🟡', priority: 'medium' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks & Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start space-x-3 py-2">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
              {alert.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">{alert.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskAlertCard;
