import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import { FaFileInvoice, FaCalendarAlt } from 'react-icons/fa';

const ClaimCard = ({ claimNumber, status, date, title, description, type, onViewDetails }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('insurance');

  const handleViewDetails = () => {
    // Extract the actual ID from claimNumber (e.g., "enrollment-3" or "claim-5")
    const actualId = claimNumber.split('-')[1];
    
    if (type === 'claim') {
      // Navigate to track claim page with claim ID
      navigate(`/farmerinsurancetrackclaim/${actualId}`);
    } else if (type === 'enrollment') {
      // For enrollments, call the onViewDetails callback if provided
      if (onViewDetails) {
        onViewDetails(claimNumber, type);
      } else {
        // Fallback to insurance plan page
        navigate('/farmerinsuranceplan');
      }
    }
  };

  // Get badge text based on type and status
  const getBadge = () => {
    if (type === 'claim') {
      const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-');
      
      // Map claim statuses to badge display
      if (normalizedStatus === 'submitted' || normalizedStatus === 'under-review' || normalizedStatus === 'pending-verification') {
        return { text: t('trackClaim.status.underReview'), className: 'enrollment-badge-review' };
      }
      if (normalizedStatus === 'verified') {
        return { text: t('verify.title'), className: 'enrollment-badge-verified' };
      }
      if (normalizedStatus === 'approved' || normalizedStatus === 'paid') {
        return { text: t('trackClaim.status.approved'), className: 'enrollment-badge-enrolled' };
      }
      if (normalizedStatus === 'rejected') {
        return { text: t('trackClaim.status.rejected'), className: 'enrollment-badge-rejected' };
      }
    } else if (type === 'enrollment') {
      // "pending" status means not yet approved by admin - show "In Review"
      if (status === 'pending') {
        return { text: t('trackClaim.status.underReview'), className: 'enrollment-badge-review' };
      }
      // "active" status means approved by admin - show "Enrolled"
      if (status === 'active') {
        return { text: t('dashboard.stats.enrollments'), className: 'enrollment-badge-enrolled' };
      }
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div className="claim-card group hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="claim-title">
          <FaFileInvoice className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
          {title}
        </div>
        {badge ? (
          <span className={`enrollment-badge ${badge.className}`}>
            {badge.text}
          </span>
        ) : (
          <StatusBadge status={status} />
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FaCalendarAlt className="w-4 h-4 text-gray-500" />
          <span>{date}</span>
        </div>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          CLM-{claimNumber}
        </span>
        <button 
          onClick={handleViewDetails}
          className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          {t('trackClaim.buttons.viewDetails')} <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default ClaimCard;
