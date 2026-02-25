function StatsGrid() {
  const stats = [
    { value: '6', label: 'Total Farmers', icon: '👨‍🌾', color: 'bg-blue-500' },
    { value: '10', label: 'Total Animals', icon: '🐄', color: 'bg-cyan-500' },
    { value: '3', label: 'Pending Treatments', icon: '⚕️', color: 'bg-yellow-500' },
    { value: '2', label: "Today's Appointments", icon: '📅', color: 'bg-green-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
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
