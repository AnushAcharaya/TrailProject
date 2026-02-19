// components/profile-transfer/farmer-side/send-transfer/components/TransferDetailsModal.jsx
import { FaTimes } from 'react-icons/fa';
import ProgressStepper from './ProgressStepper';
import AnimalDetail from './AnimalDetail';

export default function TransferDetailsModal({ transfer, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-emerald-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transfer Details {transfer.details.animal.tag}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <AnimalDetail animal={transfer.details.animal} />
          
          {/* Transfer Info */}
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200/50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transfer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-semibold text-gray-900">{transfer.details.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-yellow-600">{transfer.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">{transfer.time}</span>
              </div>
              {transfer.details.reason && (
                <div className="pt-3 border-t border-emerald-200">
                  <span className="text-gray-600 block mb-2">Reason:</span>
                  <p className="text-gray-900">{transfer.details.reason}</p>
                </div>
              )}
            </div>
          </div>

          <ProgressStepper />
        </div>
      </div>
    </div>
  );
}
