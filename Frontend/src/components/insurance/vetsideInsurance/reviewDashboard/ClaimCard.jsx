import { FaUser, FaPaw, FaCalendar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ClaimCard = ({ claim }) => {
  const navigate = useNavigate();

  const handleReviewClaim = () => {
    navigate('/vetinsuranceverifyclaim');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">CLM-{claim.number}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${claim.statusBadge}`}>
          {claim.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 text-sm">
          <FaUser className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Farmer:</span>
          <span className="font-medium text-gray-900">{claim.farmer}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <FaPaw className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Livestock:</span>
          <span className="font-medium text-gray-900">{claim.livestock}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <FaCalendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Created:</span>
          <span className="font-medium text-gray-900">{claim.date}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {claim.description}
      </p>

      {/* Action Button */}
      <button 
        onClick={handleReviewClaim}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
      >
        Review Claim
      </button>
    </div>
  );
};

export default ClaimCard;
