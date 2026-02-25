function ActivityCard() {
  const activities = [
    { text: 'Treated Sheru (Buffalo) for foot rot', time: '2 days ago', icon: '🐃' },
    { text: 'New Animal (Moti) (Goat) added for Kamla Sharma', time: '3 days ago', icon: '🐐' },
    { text: 'FMD Vaccination given to Ganga (Cow)', time: '1 day ago', icon: '💉' },
    { text: 'HS fever treatment for Lakshmi (Cow)', time: '4 days ago', icon: '🏥' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 py-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">{activity.text}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityCard;
