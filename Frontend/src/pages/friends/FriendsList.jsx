import { useState, useEffect } from "react";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import { getFriends, removeFriend } from "../../services/friendsApi";
import { FaUsers, FaEnvelope, FaUserTimes } from "react-icons/fa";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadFriends();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadFriends = async () => {
    setIsLoading(true);
    const result = await getFriends();
    
    if (result.success) {
      // Handle both array and paginated response
      const friendsList = Array.isArray(result.data) 
        ? result.data 
        : result.data.results || [];
      console.log('[FriendsList] Loaded friends:', friendsList);
      console.log('[FriendsList] First friend data:', friendsList[0]);
      setFriends(friendsList);
    } else {
      console.error("Failed to load friends:", result.error);
    }
    
    setIsLoading(false);
  };

  const handleRemoveFriend = async (friendshipId, friendName) => {
    if (!confirm(`Unfriend ${friendName}?`)) {
      return;
    }

    setRemovingId(friendshipId);
    const result = await removeFriend(friendshipId);
    
    if (result.success) {
      setFriends(friends.filter(f => f.id !== friendshipId));
      showNotification('Friend removed successfully', 'success');
    } else {
      showNotification(result.error, 'error');
    }
    
    setRemovingId(null);
  };

  const handleMessage = (friendName) => {
    showNotification(`Messaging ${friendName} - feature coming soon!`, 'success');
  };

  return (
    <FarmerLayout pageTitle="My Friends">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaUsers className="text-3xl text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-800">My Friends</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-600">
            Loading friends...
          </div>
        ) : friends.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No friends yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Send friend requests to vets to connect with them
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friendship) => {
              const friend = friendship.friend;
              console.log('[FriendsList] Friend data:', friend);
              console.log('[FriendsList] Profile image URL:', friend.profile_image_url);
              const profileImageUrl = friend.profile_image_url || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name || friend.username)}&background=059669&color=fff&size=128`;
              console.log('[FriendsList] Using image URL:', profileImageUrl);
              
              return (
                <div
                  key={friendship.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={profileImageUrl}
                      alt={friend.full_name || friend.username}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name || friend.username)}&background=059669&color=fff&size=128`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {friend.full_name || friend.username}
                      </h3>
                      <p className="text-gray-600 text-sm">{friend.role}</p>
                      {friend.phone && (
                        <p className="text-xs text-gray-500">{friend.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMessage(friend.full_name || friend.username)}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2"
                    >
                      <FaEnvelope />
                      Message
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friendship.id, friend.full_name || friend.username)}
                      disabled={removingId === friendship.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      title="Unfriend"
                    >
                      <FaUserTimes />
                      Unfriend
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
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
      </div>
    </FarmerLayout>
  );
};

export default FriendsList;
