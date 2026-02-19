import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import TransferHeader from './TransferHeader';
import SenderPanel from './SenderPanel';
import ReceiverPanel from './ReceiverPanel';
import ActionSection from './ActionSection';

function ReviewTransfer() {
  const navigate = useNavigate();

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
            <p className="text-sm text-gray-600">ID: TR-001</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Pending
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
              <TransferHeader />
            </div>
            
            {/* Middle Column - Sender & Receiver */}
            <div className="lg:col-span-1">
              <SenderPanel />
            </div>
            <div className="lg:col-span-1">
              <ReceiverPanel />
            </div>
            
            {/* Right Column - Actions */}
            <div className="lg:col-span-1">
              <ActionSection />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ReviewTransfer;
