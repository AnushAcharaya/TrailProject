// components/profile-transfer/farmer-side/send-transfer/components/StatusBadge.jsx
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
  const { t } = useTranslation('profileTransfer');
  
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Receiver Approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Admin Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'Pending':
        return t('status.pending');
      case 'Receiver Approved':
        return t('status.receiverApproved');
      case 'Admin Approved':
        return t('status.adminApproved');
      case 'Rejected':
        return t('status.rejected');
      case 'Completed':
        return t('status.completed');
      case 'Cancelled':
        return t('status.cancelled');
      default:
        return status;
    }
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {getStatusLabel()}
    </div>
  );
}
