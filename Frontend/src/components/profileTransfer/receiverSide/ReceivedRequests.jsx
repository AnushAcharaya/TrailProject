// components/profile-transfer/receiver-side/received-requests/ReceivedRequests.jsx
import RequestCard from './RequestCard';

const requests = [
  {
    id: 1,
    senderAvatar: '/api/placeholder/48/48',
    senderName: 'Peter Ochieng',
    animalName: 'Clucky',
    animalTag: 'TG-035',
    animalBreed: 'Chicken - Rhode Island',
    animalImage: '/api/placeholder/200/200',
    time: '2h ago',
    reason: 'Inheriting flock direct farms'
  }
];

export default function ReceivedRequests() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Received Transfer Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Review and respond to incoming ownership transfer requests</p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="space-y-4">
          {requests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </div>
  );
}
