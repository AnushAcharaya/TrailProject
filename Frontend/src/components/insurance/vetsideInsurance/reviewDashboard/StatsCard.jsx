import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const StatsCard = ({ number, label, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <FaClock className="w-8 h-8" />;
      case 'review':
        return <FaCheckCircle className="w-8 h-8" />;
      case 'approved':
        return <FaTimesCircle className="w-8 h-8" />;
      default:
        return <FaCheckCircle className="w-8 h-8" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-emerald-600';
      case 'review':
        return 'text-emerald-600';
      case 'approved':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-4xl font-bold text-gray-900">{number}</p>
        </div>
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
