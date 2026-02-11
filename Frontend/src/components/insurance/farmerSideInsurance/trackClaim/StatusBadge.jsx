import { FaCircle } from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'review':
        return { className: 'status-review', label: 'Review' };
      case 'submitted':
        return { className: 'status-submitted', label: 'Submitted' };
      case 'approved':
        return { className: 'status-approved', label: 'Approved' };
      default:
        return { className: 'bg-gray-300', label: 'Pending' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`status-badge ${config.className}`}>
      <FaCircle className="w-3 h-3" />
    </div>
  );
};

export default StatusBadge;
