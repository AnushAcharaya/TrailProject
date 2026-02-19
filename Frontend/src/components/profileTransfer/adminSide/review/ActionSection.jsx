function ActionSection() {
  return (
    <div className="space-y-6">
      {/* Transfer Reason */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Transfer Reason</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Selling cow due to cross-county farm operations
        </p>
      </div>

      {/* Insurance Details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Insurance Details</h3>
        <p className="text-sm text-gray-700">
          <span className="font-medium">No insurance on file</span>
        </p>
      </div>

      {/* Ownership History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Ownership History</h3>
        <div className="space-y-4">
          {/* Request Created */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Request Created</p>
              <p className="text-xs text-gray-500 mt-1">Transfer request initiated by sender</p>
            </div>
          </div>

          {/* Receiver Approval */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Receiver Approval</p>
              <p className="text-xs text-gray-500 mt-1">Pending receiver confirmation</p>
            </div>
          </div>

          {/* Admin Approval */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin Approval</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting admin review</p>
            </div>
          </div>

          {/* Transfer Completed */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Transfer Completed</p>
              <p className="text-xs text-gray-500 mt-1">Final transfer completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Decision */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Admin Decision</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer record (required for rejection)
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows="3"
            placeholder="Enter reason for rejection..."
          ></textarea>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200">
            Reject Transfer
          </button>
          <button className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200">
            Approve Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionSection;
