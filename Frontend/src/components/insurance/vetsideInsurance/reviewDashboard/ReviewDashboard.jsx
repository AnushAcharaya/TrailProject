import StatsCard from './StatsCard';
import ClaimCard from './ClaimCard';

const ReviewDashboard = () => {
  const claims = [
    {
      number: '001',
      status: 'Pending Review',
      statusBadge: 'bg-emerald-100 text-emerald-700',
      farmer: 'Farmer John',
      livestock: 'Cattle (4 Heads)',
      date: '2025-01-21',
      description: 'Livestock showing signs of respiratory infection requiring immediate veterinary attention.'
    }
  ];

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatsCard number="1" label="Pending Review" status="pending" />
        <StatsCard number="2" label="Verified Claims" status="review" />
        <StatsCard number="0" label="Rejected Claims" status="approved" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button className="px-4 py-2 font-medium text-emerald-600 border-b-2 border-emerald-600">
          Pending (1)
        </button>
        <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
          Verified (2)
        </button>
        <button className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900">
          Rejected (0)
        </button>
      </div>

      {/* Claims Grid */}
      <div className="grid grid-cols-1 gap-6">
        {claims.map((claim, index) => (
          <ClaimCard key={index} claim={claim} />
        ))}
      </div>
    </div>
  );
};

export default ReviewDashboard;
