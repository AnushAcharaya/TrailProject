import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApproveTransfer, adminRejectTransfer, completeTransfer } from '../../../../services/profileTransferApi';

function ActionSection({ transfer, onUpdate }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!transfer) return null;

  const [successMessage, setSuccessMessage] = useState(null);

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      await adminApproveTransfer(transfer.id, notes);
      setSuccessMessage('Transfer approved successfully!');
      if (onUpdate) {
        setTimeout(() => {
          onUpdate();
        }, 1500);
      }
    } catch (err) {
      console.error('Error approving transfer:', err);
      setError(err.response?.data?.error || 'Failed to approve transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminRejectTransfer(transfer.id, notes);
      setSuccessMessage('Transfer rejected successfully!');
      setTimeout(() => {
        navigate('/profile-transfer/admin/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error rejecting transfer:', err);
      setError(err.response?.data?.error || 'Failed to reject transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);
      await completeTransfer(transfer.id);
      setSuccessMessage('Transfer completed successfully!');
      setTimeout(() => {
        navigate('/profile-transfer/admin/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error completing transfer:', err);
      setError(err.response?.data?.error || 'Failed to complete transfer');
    } finally {
      setLoading(false);
    }
  };

  const canApproveOrReject = transfer.status === 'Receiver Approved';
  const canComplete = transfer.status === 'Admin Approved';

  return (
    <div className="space-y-6">
      {/* Ownership History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Transfer Status</h3>
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
              <p className="text-xs text-gray-500 mt-1">
                {new Date(transfer.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Receiver Approval */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                transfer.status === 'Pending' ? 'bg-gray-300' :
                transfer.status === 'Rejected' ? 'bg-red-500' :
                'bg-green-500'
              }`}>
                {transfer.status === 'Pending' ? (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                ) : transfer.status === 'Rejected' ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Receiver Response</p>
              <p className="text-xs text-gray-500 mt-1">
                {transfer.receiver_approved_at ? 
                  new Date(transfer.receiver_approved_at).toLocaleString() :
                  'Pending receiver confirmation'}
              </p>
            </div>
          </div>

          {/* Admin Approval */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                transfer.status === 'Admin Approved' || transfer.status === 'Completed' ? 'bg-green-500' :
                transfer.status === 'Rejected' ? 'bg-red-500' :
                'bg-gray-300'
              }`}>
                {transfer.status === 'Admin Approved' || transfer.status === 'Completed' ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : transfer.status === 'Rejected' ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin Review</p>
              <p className="text-xs text-gray-500 mt-1">
                {transfer.admin_approved_at ? 
                  new Date(transfer.admin_approved_at).toLocaleString() :
                  'Awaiting admin review'}
              </p>
            </div>
          </div>

          {/* Transfer Completed */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                transfer.status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {transfer.status === 'Completed' ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Transfer Completed</p>
              <p className="text-xs text-gray-500 mt-1">
                {transfer.completed_at ? 
                  new Date(transfer.completed_at).toLocaleString() :
                  'Final transfer completion'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Decision */}
      {(canApproveOrReject || canComplete) && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            {canComplete ? 'Complete Transfer' : 'Admin Decision'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {canApproveOrReject && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (required for rejection)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Enter notes or reason for rejection..."
                  disabled={loading}
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Reject Transfer'}
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Approve Transfer'}
                </button>
              </div>
            </>
          )}

          {canComplete && (
            <button 
              onClick={handleComplete}
              disabled={loading}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Complete Transfer'}
            </button>
          )}
        </div>
      )}

      {transfer.status === 'Rejected' && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <h3 className="text-sm font-semibold text-red-700 mb-2 uppercase tracking-wide">Transfer Rejected</h3>
          <p className="text-sm text-red-600">
            {transfer.admin_notes || transfer.receiver_notes || 'No reason provided'}
          </p>
        </div>
      )}

      {transfer.status === 'Completed' && (
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <h3 className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">Transfer Completed</h3>
          <p className="text-sm text-green-600">
            This transfer has been successfully completed. Ownership has been transferred to the receiver.
          </p>
        </div>
      )}
    </div>
  );
}

export default ActionSection;
