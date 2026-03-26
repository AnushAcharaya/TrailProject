// components/profile-transfer/farmer-side/send-transfer/SendTransfers.jsx
import { useState, useEffect } from 'react';
import TransferItem from './TransferItem';
import TransferDetailsModal from './TransferDetailModals';
import { getSentTransfers } from '../../../../services/profileTransferApi';

export default function SendTransfers() {
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sent transfers on component mount
  useEffect(() => {
    fetchSentTransfers();
  }, []);

  const fetchSentTransfers = async () => {
    try {
      setLoading(true);
      const response = await getSentTransfers();
      
      // Handle paginated response - extract results array
      const data = response.results || response;
      
      // Transform API data to match component format
      const transformedTransfers = data.map(transfer => {
        // Handle image URL - prefix with backend URL if it's a relative path
        const getImageUrl = (imagePath) => {
          if (!imagePath) return '/api/placeholder/40/40';
          if (imagePath.startsWith('http')) return imagePath;
          return `http://localhost:8000${imagePath}`;
        };

        return {
          id: transfer.id,
          farmer: transfer.livestock_details?.species_name || 'Unknown',
          tag: transfer.livestock_details?.tag_id || 'N/A',
          avatar: getImageUrl(transfer.livestock_details?.image),
          recipient: transfer.receiver_details?.full_name || 'Unknown',
          time: new Date(transfer.created_at).toLocaleDateString(),
          status: transfer.status,
          details: {
            animal: {
              name: transfer.livestock_details?.species_name || 'Unknown',
              tag: transfer.livestock_details?.tag_id || 'N/A',
              breed: `${transfer.livestock_details?.species_name || 'Unknown'} - ${transfer.livestock_details?.breed_name || 'Unknown'}`,
              image: getImageUrl(transfer.livestock_details?.image)
            },
            recipient: transfer.receiver_details?.full_name || 'Unknown',
            reason: transfer.reason || 'No reason provided'
          },
          // Keep original data for reference
          originalData: transfer
        };
      });
      
      setTransfers(transformedTransfers);
      setError(null);
    } catch (err) {
      console.error('Error fetching sent transfers:', err);
      setError('Failed to fetch sent transfers');
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
          <p className="text-gray-600">Loading sent transfers...</p>
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
            onClick={fetchSentTransfers}
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
        <h1 className="text-2xl font-bold text-gray-900">Sent Transfers</h1>
        <p className="text-sm text-gray-600 mt-1">Track the status of your ownership transfer requests</p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {transfers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No sent transfers found.</p>
            <p className="text-gray-400 text-sm mt-2">Transfer requests you send will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map(transfer => (
              <TransferItem
                key={transfer.id}
                transfer={transfer}
                onClick={() => setSelectedTransfer(transfer)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTransfer && (
        <TransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          onUpdate={fetchSentTransfers}
        />
      )}
    </div>
  );
}
