// components/profile-transfer/farmer-side/send-transfer/SendTransfers.jsx
import { useState } from 'react';
import TransferItem from './TransferItem';
import TransferDetailsModal from './TransferDetailModals';

const transfers = [
  {
    id: 1,
    farmer: 'Bella',
    tag: 'TG-001',
    avatar: '/api/placeholder/40/40',
    recipient: 'Grace Wanijku',
    time: '2024-12-18',
    status: 'Pending',
    details: {
      animal: { name: 'Bella', tag: 'TG-001', breed: 'Cow - Holstein', image: '/api/placeholder/80/80' },
      recipient: 'Grace Wanijku',
      reason: 'Selling cow due to downsizing farm operations'
    }
  },
  {
    id: 2,
    farmer: 'Rocky',
    tag: 'TG-002',
    avatar: '/api/placeholder/40/40',
    recipient: 'Peter Ochieng',
    time: '2024-12-26',
    status: 'Receiver Approved',
    details: {
      animal: { name: 'Rocky', tag: 'TG-002', breed: 'Cow - Holstein', image: '/api/placeholder/80/80' },
      recipient: 'Peter Ochieng',
      reason: 'Transfer for breeding purposes'
    }
  },
  {
    id: 3,
    farmer: 'Dolly',
    tag: 'TG-003',
    avatar: '/api/placeholder/40/40',
    recipient: 'Mary Akinyi',
    time: '2024-01-05',
    status: 'Admin Approved',
    details: {
      animal: { name: 'Dolly', tag: 'TG-003', breed: 'Cow - Holstein', image: '/api/placeholder/80/80' },
      recipient: 'Mary Akinyi',
      reason: 'Sale transaction'
    }
  },
  {
    id: 4,
    farmer: 'Rosie',
    tag: 'TG-004',
    avatar: '/api/placeholder/40/40',
    recipient: 'David Kamau',
    time: '2024-01-10',
    status: 'Rejected',
    details: {
      animal: { name: 'Rosie', tag: 'TG-004', breed: 'Cow - Holstein', image: '/api/placeholder/80/80' },
      recipient: 'David Kamau',
      reason: 'Relocation to new farm'
    }
  }
];

export default function SendTransfers() {
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Sent Transfers</h1>
        <p className="text-sm text-gray-600 mt-1">Track the status of your ownership transfer requests</p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="space-y-3">
          {transfers.map(transfer => (
            <TransferItem
              key={transfer.id}
              transfer={transfer}
              onClick={() => setSelectedTransfer(transfer)}
            />
          ))}
        </div>
      </div>

      {selectedTransfer && (
        <TransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </div>
  );
}
