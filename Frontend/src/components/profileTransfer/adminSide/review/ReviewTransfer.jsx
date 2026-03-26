import { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import TransferHeader from './TransferHeader';
import SenderPanel from './SenderPanel';
import ReceiverPanel from './ReceiverPanel';
import ActionSection from './ActionSection';
import { getTransferById } from '../../../../services/profileTransferApi';

function ReviewTransfer() {
  const navigate = useNavigate();
  const { transferId } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransferDetails();
  }, [transferId]);

  const fetchTransferDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransferById(transferId);
      setTransfer(data);
    } catch (err) {
      console.error('Error fetching transfer details:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load transfer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transfer details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/profile-transfer/admin/dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!transfer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Transfer not found</p>
            <button 
              onClick={() => navigate('/profile-transfer/admin/dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/profile-transfer/admin/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Review</h1>
            <p className="text-sm text-gray-600">ID: TR-{transfer.id}</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              transfer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              transfer.status === 'Receiver Approved' ? 'bg-blue-100 text-blue-800' :
              transfer.status === 'Admin Approved' ? 'bg-emerald-100 text-emerald-800' :
              transfer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              transfer.status === 'Completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {transfer.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Animal Profile */}
            <div className="lg:col-span-3">
              <TransferHeader transfer={transfer} />
            </div>
            
            {/* Middle Column - Sender & Receiver */}
            <div className="lg:col-span-1">
              <SenderPanel transfer={transfer} />
            </div>
            <div className="lg:col-span-1">
              <ReceiverPanel transfer={transfer} />
            </div>
            
            {/* Right Column - Actions */}
            <div className="lg:col-span-1">
              <ActionSection transfer={transfer} onUpdate={fetchTransferDetails} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ReviewTransfer;
