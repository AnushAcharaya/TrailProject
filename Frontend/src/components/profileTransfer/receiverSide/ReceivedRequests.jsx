// components/profile-transfer/receiver-side/received-requests/ReceivedRequests.jsx
import { useState, useEffect } from 'react';
import RequestCard from './RequestCard';
import { getReceivedTransfers } from '../../../services/profileTransferApi';

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch received transfers on component mount
  useEffect(() => {
    fetchReceivedTransfers();
  }, []);

  const fetchReceivedTransfers = async () => {
    try {
      setLoading(true);
      const response = await getReceivedTransfers();
      
      // Handle paginated response - extract results array
      const data = response.results || response;
      
      // Show all received transfers (not just pending)
      // Transform API data to match component format
      const transformedRequests = data.map(transfer => {
        // Handle image URL - prefix with backend URL if it's a relative path
        const getImageUrl = (imagePath) => {
          if (!imagePath) return '/api/placeholder/200/200';
          if (imagePath.startsWith('http')) return imagePath;
          return `http://localhost:8000${imagePath}`;
        };

        return {
          id: transfer.id,
          senderAvatar: '/api/placeholder/48/48', // User profile pictures not implemented yet
          senderName: transfer.sender_details?.full_name || 'Unknown',
          animalName: transfer.livestock_details?.species_name || 'Unknown',
          animalTag: transfer.livestock_details?.tag_id || 'N/A',
          animalBreed: `${transfer.livestock_details?.species_name || 'Unknown'} - ${transfer.livestock_details?.breed_name || 'Unknown'}`,
          animalImage: getImageUrl(transfer.livestock_details?.image),
          time: new Date(transfer.created_at).toLocaleDateString(),
          reason: transfer.reason || 'No reason provided',
          status: transfer.status,
          // Keep original data for reference
          originalData: transfer
        };
      });
      
      setRequests(transformedRequests);
      setError(null);
    } catch (err) {
      console.error('Error fetching received transfers:', err);
      setError('Failed to fetch received transfers');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading received requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchReceivedTransfers}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Received Transfer Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Review and respond to incoming ownership transfer requests</p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No received transfer requests.</p>
            <p className="text-gray-400 text-sm mt-2">Transfer requests sent to you will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request}
                onUpdate={fetchReceivedTransfers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
