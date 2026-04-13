import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sendFriendRequest, checkFriendshipStatus } from '../../../services/friendsApi';

function ProfileCard({ farmer }) {
  const navigate = useNavigate();
  const { t } = useTranslation('vetDashboard');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState('none'); // 'none', 'pending', 'friends'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    loadFriendshipStatus();
  }, [farmer.username]);

  const loadFriendshipStatus = async () => {
    const result = await checkFriendshipStatus(farmer.username);
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
  const profileImageUrl = farmer.profile_image_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.full_name || farmer.username)}&background=059669&color=fff&size=128`;

  const handleViewAnimals = () => {
    // Store farmer username to fetch details on the next page
    localStorage.setItem('selectedFarmerUsername', farmer.username);
    navigate('/vet/farmer-details');
  };

  const handleAddFriend = async () => {
    setIsSendingRequest(true);
    const result = await sendFriendRequest(farmer.username);
    
    if (result.success) {
      setFriendshipStatus('pending');
      showNotification(t('farmerProfiles.friendRequestSent'), 'success');
    } else {
      showNotification(result.error, 'error');
      // Reload status in case the error was due to existing request
      await loadFriendshipStatus();
    }
    
    setIsSendingRequest(false);
  };

  const handleMessage = () => {
    showNotification(t('farmerProfiles.messagingComingSoon'), 'info');
  };

  const renderActionButton = () => {
    if (friendshipStatus === 'friends') {
      return (
        <button 
          onClick={handleMessage}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FaEnvelope className="w-4 h-4" />
          {t('farmerProfiles.message')}
        </button>
      );
    }

    if (friendshipStatus === 'pending') {
      return (
        <button 
          disabled
          className="w-full px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {t('farmerProfiles.pending')}
        </button>
      );
    }

    return (
      <button 
        onClick={handleAddFriend}
        disabled={isSendingRequest}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        {isSendingRequest ? t('farmerProfiles.sending') : t('farmerProfiles.addFriend')}
      </button>
    );
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <img 
            src={profileImageUrl} 
            alt={farmer.full_name || farmer.username}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.full_name || farmer.username)}&background=059669&color=fff&size=128`;
            }}
          />
          
          {/* Info */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {farmer.full_name || farmer.username}
            </h3>
            
            <div className="space-y-1">
              {farmer.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  <span>{farmer.address}</span>
                </div>
              )}
              
              {farmer.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaPhone className="mr-2 text-gray-400" />
                  <span>{farmer.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Animals count */}
        <p className="text-sm text-gray-500 mb-4">{t('farmerProfiles.animals', { count: farmer.animal_count || 0 })}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleViewAnimals}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('farmerProfiles.viewAnimals')}
          </button>
          {renderActionButton()}
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
}

export default ProfileCard;
