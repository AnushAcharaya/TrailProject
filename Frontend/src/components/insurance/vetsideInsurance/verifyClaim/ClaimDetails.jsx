import { FaExclamationTriangle, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const ClaimDetails = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
        Claim Details
      </h3>
      
      <div className="text-center mb-6">
        <div className="text-3xl font-black text-emerald-600 mb-2">NPR 25,000</div>
        <div className="inline-block px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide bg-orange-100 text-orange-800 border-2 border-orange-200 mb-3">
          Accident Claim
        </div>
        <div className="text-base font-semibold text-gray-700">
          CLM-101
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaCalendarAlt className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Incident Date</div>
            <div className="text-sm font-bold text-gray-900">Jul 20, 2025</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 flex-shrink-0">
            <FaMapMarkerAlt className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-600">Location</div>
            <div className="text-sm font-bold text-gray-900">Kathmandu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetails;
