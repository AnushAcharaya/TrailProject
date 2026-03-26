import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import StatsCard from './StatsCard';
import TransferTable from './TransferTable';
import { getTransfers } from '../../../services/profileTransferApi';

function AdminDashboard() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { value: 0, label: 'Pending Transfers', color: 'yellow' },
    { value: 0, label: 'Approved Transfer', color: 'blue' },
    { value: 0, label: 'Rejected Transfer', color: 'red' },
    { value: 0, label: 'Total Transfers', color: 'green' }
  ]);

  // Fetch transfers on component mount
  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTransfers();
      
      // Handle paginated response - extract results array
      const data = response.results || response;
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', data);
        throw new Error('Invalid data format received from server');
      }
      
      // Calculate stats
      const pendingCount = data.filter(t => t.status === 'Pending' || t.status === 'Receiver Approved').length;
      const approvedCount = data.filter(t => t.status === 'Admin Approved' || t.status === 'Completed').length;
      const rejectedCount = data.filter(t => t.status === 'Rejected').length;
      
      setStats([
        { value: pendingCount, label: 'Pending Transfers', color: 'yellow' },
        { value: approvedCount, label: 'Approved Transfer', color: 'blue' },
        { value: rejectedCount, label: 'Rejected Transfer', color: 'red' },
        { value: data.length, label: 'Total Transfers', color: 'green' }
      ]);
      
      // Transform API data to match table format
      const transformedData = data.map(transfer => ({
        id: transfer.id,
        animalTag: transfer.livestock_details?.tag_id || 'N/A',
        from: transfer.sender_details?.username || transfer.sender_details?.full_name || 'Unknown',
        to: transfer.receiver_details?.username || transfer.receiver_details?.full_name || 'Unknown',
        status: transfer.status,
        date: new Date(transfer.created_at).toLocaleDateString(),
        action: 'Review',
        // Keep original data for reference
        originalData: transfer
      }));
      
      setTransfers(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      // Show more detailed error message
      let errorMessage = 'Failed to fetch transfers';
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error || err.response.data?.detail || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        // Something else happened
        errorMessage = err.message || 'Failed to fetch transfers';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchTransfers}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Content */}
      <div className="p-8 bg-emerald-50">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} value={stat.value} label={stat.label} color={stat.color} />
          ))}
        </div>

        {/* Transfers Table */}
        {transfers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No transfers found.</p>
          </div>
        ) : (
          <TransferTable data={transfers} onUpdate={fetchTransfers} />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
