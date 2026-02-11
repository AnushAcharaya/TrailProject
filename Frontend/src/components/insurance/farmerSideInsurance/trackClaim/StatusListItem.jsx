import StatusBadge from './StatusBadge';

const StatusListItem = ({ status, date, description }) => {
  const getIconClasses = () => {
    switch (status) {
      case 'review':
        return 'status-review-icon';
      case 'submitted':
        return 'status-submitted-icon';
      case 'approved':
        return 'status-approved-icon';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="status-item">
      <div className={`status-icon ${getIconClasses()}`}>
        <StatusBadge status={status} />
      </div>
      <div className="flex-1">
        <div className="status-text">{description}</div>
      </div>
      <div className="status-date">{date}</div>
    </div>
  );
};

export default StatusListItem;
