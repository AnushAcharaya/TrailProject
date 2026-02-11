import StatusBadge from './StatusBadge';
import { FaFileInvoice, FaCalendarAlt } from 'react-icons/fa';

const ClaimCard = ({ claimNumber, status, date, title, description }) => {
  return (
    <div className="claim-card group hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="claim-title">
          <FaFileInvoice className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" />
          {title}
        </div>
        <StatusBadge status={status} />
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
        <button className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1 transition-colors">
          View Details <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default ClaimCard;
