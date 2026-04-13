import { useTranslation } from 'react-i18next';
import { FaCircle } from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation('insurance');
  
  const getStatusConfig = () => {
    switch (status) {
      case 'review':
        return { className: 'status-review', label: t('trackClaim.status.underReview') };
      case 'submitted':
        return { className: 'status-submitted', label: t('trackClaim.status.submitted') };
      case 'approved':
        return { className: 'status-approved', label: t('trackClaim.status.approved') };
      default:
        return { className: 'bg-gray-300', label: t('trackClaim.status.submitted') };
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
