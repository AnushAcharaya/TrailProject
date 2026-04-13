import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaUserMd, FaMapMarkerAlt, FaStethoscope, FaEnvelope } from "react-icons/fa";
import { sendFriendRequest, checkFriendshipStatus } from "../../services/friendsApi";

const VetProfileCard = ({ vet, onAppointVet }) => {
  const { t } = useTranslation('appointments');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState('none'); // 'none', 'pending', 'friends'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    loadFriendshipStatus();
  }, [vet.username]);

  const loadFriendshipStatus = async () => {
    const result = await checkFriendshipStatus(vet.username);
    if (result.success) {
      setFriendshipStatus(result.status);
    }
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get profile image URL or use default avatar
  const profileImageUrl = vet.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.full_name || vet.username)}&background=059669&color=fff&size=200`;

  const handleAddFriend = async () => {
    setIsSendingRequest(true);
    const result = await sendFriendRequest(vet.username);
    
    if (result.success) {
      setFriendshipStatus('pending');
      showNotification('Friend request sent successfully!', 'success');
    } else {
      showNotification(result.error, 'error');
      // Reload status in case the error was due to existing request
      await loadFriendshipStatus();
    }
    
    setIsSendingRequest(false);
  };

  const handleMessage = () => {
    showNotification('Messaging feature coming soon!', 'info');
  };

  const renderFriendButton = () => {
    if (friendshipStatus === 'friends') {
      return (
        <button
          onClick={handleMessage}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium flex items-center justify-center gap-2"
        >
          <FaEnvelope className="w-4 h-4" />
          {t('farmer.vets.message')}
        </button>
      );
    }

    if (friendshipStatus === 'pending') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {t('farmer.vets.friendPending')}
        </button>
      );
    }

    return (
      <button
        onClick={handleAddFriend}
        disabled={isSendingRequest}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        {isSendingRequest ? t('farmer.vets.sending') : t('farmer.vets.addFriend')}
      </button>
    );
  };

  return (
    <>
      <div className="vet-profile-card">
        {/* Profile Image */}
        <div className="vet-profile-image-container">
          <img
            src={profileImageUrl}
            alt={vet.full_name || vet.username}
            className="vet-profile-image"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.full_name || vet.username)}&background=059669&color=fff&size=200`;
            }}
          />
        </div>

        {/* Vet Information */}
        <div className="vet-profile-info">
          <h3 className="vet-profile-name">
            <FaUserMd className="inline mr-2 text-emerald-600" />
            {vet.full_name || vet.username}
          </h3>

          {/* Address */}
          {vet.address && (
            <p className="vet-profile-detail">
              <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
              <span className="text-gray-700">{vet.address}</span>
            </p>
          )}

          {/* Specialization */}
          {vet.specialization && (
            <p className="vet-profile-detail">
              <FaStethoscope className="inline mr-2 text-gray-500" />
              <span className="text-gray-700">{vet.specialization}</span>
            </p>
          )}

          {/* Bio (if available) */}
          {vet.bio && (
            <p className="vet-profile-bio">{vet.bio}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => onAppointVet(vet)}
              className="btn-appoint-vet"
            >
              {t('farmer.vets.appointButton')}
            </button>
            {renderFriendButton()}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            toastType === 'success' ? 'bg-green-500' : 
            toastType === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
          } text-white`}>
            {toastType === 'success' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {toastType === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default VetProfileCard;
