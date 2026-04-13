// components/profile-transfer/receiver-side/received-requests/components/RequestCard.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser } from 'react-icons/fa';
import { MdPets } from 'react-icons/md';
import AcceptButton from './AcceptButton';
import DeclineButton from './DeclineButton';
import { receiverApproveTransfer, receiverRejectTransfer } from '../../../services/profileTransferApi';

export default function RequestCard({ request, onUpdate }) {
  const { t } = useTranslation('profileTransfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionCompleted, setActionCompleted] = useState(false);
  
  // Get current status from request
  const currentStatus = request.status;
  const isPending = currentStatus === 'Pending';
  const isReceiverApproved = currentStatus === 'Receiver Approved';
  const isAdminApproved = currentStatus === 'Admin Approved';
  const isCompleted = currentStatus === 'Completed';
  const isRejected = currentStatus === 'Rejected';

  const handleAccept = async () => {
    // Prevent multiple clicks
    if (loading || actionCompleted) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await receiverApproveTransfer(request.originalData.id);
      
      // Mark action as completed to prevent further clicks
      setActionCompleted(true);
      
      // Show success message
      setSuccess(t('requestCard.messages.acceptSuccess'));
      
      // Refresh the list to show updated status
      setTimeout(() => {
        if (onUpdate) {
          onUpdate();
        }
      }, 2000);
    } catch (err) {
      console.error('Error accepting transfer:', err);
      const errorMessage = err.response?.data?.error || t('requestCard.messages.acceptError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // Prevent multiple clicks
    if (loading || actionCompleted) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await receiverRejectTransfer(request.originalData.id);
      
      // Mark action as completed to prevent further clicks
      setActionCompleted(true);
      
      // Show success message
      setSuccess(t('requestCard.messages.declineSuccess'));
      
      // Refresh the list after a short delay to show success message
      setTimeout(() => {
        if (onUpdate) {
          onUpdate();
        }
      }, 1500);
    } catch (err) {
      console.error('Error rejecting transfer:', err);
      const errorMessage = err.response?.data?.error || t('requestCard.messages.declineError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex gap-6">
        {/* Left side - Animal Image */}
        <div className="flex-shrink-0">
          <img 
            src={request.animalImage} 
            alt={request.animalName}
            className="w-32 h-32 rounded-lg object-cover"
          />
        </div>

        {/* Middle - Animal Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{request.animalName}</h3>
              <p className="text-sm text-gray-600">{request.animalTag} - {request.animalBreed}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {t('requestCard.healthy')}
              </span>
            </div>
          </div>

          {/* From Section */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaUser className="text-gray-400" />
              <span className="font-medium">{t('requestCard.from')}:</span>
              <span className="font-semibold text-gray-900">{request.senderName}</span>
            </div>
          </div>

          {/* Reason Section */}
          <div className="mb-3">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MdPets className="text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium">{t('requestCard.reason')}:</span>
                <p className="text-gray-700 mt-1">{request.reason}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right side - Actions or Status Badge */}
        <div className="flex flex-col justify-between items-end">
          <div className="text-xs text-gray-500 mb-4">{request.time}</div>
          
          {/* Show status badge if already approved or rejected, or if action just completed */}
          {(isReceiverApproved || (actionCompleted && success && success.includes('accepted'))) && (
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium flex items-center gap-2">
              <span>✓</span>
              <span>{t('requestCard.accepted')}</span>
            </div>
          )}
          
          {(isRejected || (actionCompleted && success && success.includes('rejected'))) && (
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium flex items-center gap-2">
              <span>✕</span>
              <span>{t('requestCard.rejected')}</span>
            </div>
          )}
          
          {/* Show action buttons only if pending and action not completed */}
          {isPending && !actionCompleted && (
            <div className="flex gap-2">
              <DeclineButton onClick={handleReject} loading={loading} />
              <AcceptButton onClick={handleAccept} loading={loading} />
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {/* Step 1: Request Created - Always completed */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <span className="text-sm font-medium text-gray-700">{t('progressStepper.step1')}</span>
          </div>
          
          {/* Connector line 1-2 */}
          <div className={`flex-1 h-1 mx-4 ${isReceiverApproved || isAdminApproved || isCompleted || isRejected || (actionCompleted && success) ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
          
          {/* Step 2: Receiver Approval */}
          <div className="flex items-center gap-2">
            {isReceiverApproved || isAdminApproved || isCompleted || (actionCompleted && success && success.includes('accepted')) ? (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                ✓
              </div>
            ) : isRejected || (actionCompleted && success && success.includes('rejected')) ? (
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                ✕
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center text-yellow-900 font-bold text-sm">
                2
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{t('progressStepper.step2')}</span>
          </div>
          
          {/* Connector line 2-3 */}
          <div className={`flex-1 h-1 mx-4 ${isAdminApproved || isCompleted ? 'bg-green-500' : isReceiverApproved || (actionCompleted && success && success.includes('accepted')) ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
          
          {/* Step 3: Admin Approval */}
          <div className="flex items-center gap-2">
            {isAdminApproved || isCompleted ? (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                ✓
              </div>
            ) : isRejected ? (
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                ✕
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full ${isReceiverApproved || (actionCompleted && success && success.includes('accepted')) ? 'bg-yellow-400 border-4 border-yellow-300 text-yellow-900' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold text-sm`}>
                3
              </div>
            )}
            <span className={`text-sm font-medium ${isAdminApproved || isCompleted || isReceiverApproved || (actionCompleted && success && success.includes('accepted')) ? 'text-gray-700' : 'text-gray-500'}`}>{t('progressStepper.step3')}</span>
          </div>
          
          {/* Connector line 3-4 */}
          <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-500' : isAdminApproved ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
          
          {/* Step 4: Transfer Completed */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                ✓
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full ${isAdminApproved ? 'bg-yellow-400 border-4 border-yellow-300 text-yellow-900' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold text-sm`}>
                4
              </div>
            )}
            <span className={`text-sm font-medium ${isCompleted ? 'text-gray-700' : isAdminApproved ? 'text-gray-700' : 'text-gray-500'}`}>{t('progressStepper.step4')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
