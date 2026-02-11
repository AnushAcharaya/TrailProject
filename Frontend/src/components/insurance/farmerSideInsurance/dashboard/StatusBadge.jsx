import { FaCheck, FaClock } from 'react-icons/fa';

const StatusBadge = ({ status, size = 'normal' }) => {
  const sizeClasses = size === 'small' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs';
  
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-500', border: 'border-green-600', icon: <FaCheck className="w-3 h-3" /> };
      case 'pending':
        return { bg: 'bg-yellow-500', border: 'border-yellow-600', icon: <FaClock className="w-3 h-3" /> };
      case 'approved':
        return { bg: 'bg-emerald-500', border: 'border-emerald-600', icon: <FaCheck className="w-3 h-3" /> };
      default:
        return { bg: 'bg-gray-500', border: 'border-gray-600', icon: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`status-badge ${sizeClasses} ${config.bg} ${config.border} shadow-md flex items-center justify-center`}>
      {config.icon}
    </div>
  );
};

export default StatusBadge;
