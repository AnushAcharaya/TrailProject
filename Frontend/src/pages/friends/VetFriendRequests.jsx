import { useState, useEffect } from "react";
import VetLayout from "../../components/vetDashboard/VetLayout";
import { getReceivedRequests, acceptFriendRequest, rejectFriendRequest } from "../../services/friendsApi";
import { FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";

const VetFriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadRequests();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadRequests = async () => {
    setIsLoading(true);
    const result = await getReceivedRequests();
    
    if (result.success) {
      // Handle both array and paginated response
      const requestsList = Array.isArray(result.data) 
        ? result.data 
        : result.data.results || [];
      setRequests(requestsList);
    } else {
      console.error("Failed to load friend requests:", result.error);
    }
    
    setIsLoading(false);
  };

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    const result = await acceptFriendRequest(requestId);
    
    if (result.success) {
      setRequests(requests.filter(req => req.id !== requestId));
      showNotification('Friend request accepted!', 'success');
    } else {
      showNotification(result.error, 'error');
    }
    
    setProcessingId(null);
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    const result = await rejectFriendRequest(requestId);
    
    if (result.success) {
      setRequests(requests.filter(req => req.id !== requestId));
      showNotification('Friend request rejected', 'success');
    } else {
      showNotification(result.error, 'error');
    }
    
    setProcessingId(null);
  };

  return (
    <VetLayout pageTitle="Friend Requests">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaUserPlus className="text-3xl text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-800">Friend Requests</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-600">
            Loading friend requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaUserPlus className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No pending friend requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {request.sender.full_name?.charAt(0) || request.sender.username?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {request.sender.full_name || request.sender.username}
                    </h3>
                    <p className="text-gray-600">{request.sender.role}</p>
                    {request.sender.phone && (
                      <p className="text-sm text-gray-500">{request.sender.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <FaCheck />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <FaTimes />
                    Reject
                  </button>
                </div>
              </div>
            ))}
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
    </VetLayout>
  );
};

export default VetFriendRequests;
