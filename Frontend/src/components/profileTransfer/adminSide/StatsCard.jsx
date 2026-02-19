// components/profile-transfer/admin-side/dashboard/components/StatsCard.jsx
export default function StatsCard({ value, label, color }) {
  const colorConfig = {
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'bg-yellow-500',
      text: 'text-yellow-700'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-500',
      text: 'text-blue-700'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-500',
      text: 'text-red-700'
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'bg-emerald-500',
      text: 'text-emerald-700'
    }
  };

  const config = colorConfig[color] || colorConfig.green;

  return (
    <div className={`${config.bg} rounded-xl p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${config.text} mb-1`}>{label}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${config.icon} w-16 h-16 rounded-full flex items-center justify-center`}>
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}
