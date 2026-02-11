import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const VerificationDecision = () => {
  const handleApprove = () => {
    alert('Claim Approved!');
  };

  const handleReject = () => {
    alert('Claim Rejected!');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
        Verification Decision
      </h3>
      
      <div className="text-center mb-6">
        <div className="text-base font-bold text-gray-900 mb-1">Final Decision</div>
        <div className="text-xs text-gray-600 mb-6">
          Review all details before making decision
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleApprove} 
          className="py-3 px-4 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaCheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button 
          onClick={handleReject} 
          className="py-3 px-4 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaTimesCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
};

export default VerificationDecision;
