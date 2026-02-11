import ClaimCard from './ClaimCard';

const TrackClaim = () => {
  const claims = [
    {
      claimNumber: '101',
      overallStatus: 'under-review',
      statuses: [
        {
          status: 'submitted',
          date: 'Jul 20, 2025',
          description: 'Claim Submitted'
        },
        {
          status: 'review',
          date: 'Jul 21, 2025',
          description: 'Under Review'
        }
      ],
      incidentDetails: 'Cow slipped during transport resulting in broken leg. Veterinary treatment administered immediately. X-rays and treatment records attached.'
    },
    {
      claimNumber: '102',
      overallStatus: 'submitted',
      statuses: [
        {
          status: 'submitted',
          date: 'Jul 22, 2025',
          description: 'Claim Submitted'
        }
      ],
      incidentDetails: 'Severe diarrhea outbreak affecting 5 goats. Samples sent to veterinary lab for diagnosis. Treatment ongoing with antibiotics.'
    }
  ];

  return (
    <div className="claims-grid">
      {claims.map((claim, index) => (
        <ClaimCard
          key={index}
          claimNumber={claim.claimNumber}
          overallStatus={claim.overallStatus}
          statuses={claim.statuses}
          incidentDetails={claim.incidentDetails}
        />
      ))}
    </div>
  );
};

export default TrackClaim;
