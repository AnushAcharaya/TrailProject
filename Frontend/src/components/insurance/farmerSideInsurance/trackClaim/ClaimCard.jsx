import StatusBadge from './StatusBadge';
import StatusListItem from './StatusListItem';

const ClaimCard = ({ claimNumber, overallStatus, statuses, incidentDetails }) => {
  return (
    <div className="claim-card">
      {/* Header */}
      <div className="claim-header">
        <div>
          <h3 className="claim-number">CLM-{claimNumber}</h3>
        </div>
        <div className={`claim-status-badge ${overallStatus === 'under-review' ? 'status-under-review' : 'status-submitted'}`}>
          {overallStatus === 'under-review' ? 'Under Review' : 'Submitted'}
          <StatusBadge status={overallStatus === 'under-review' ? 'review' : 'submitted'} />
        </div>
      </div>

      {/* Status Timeline */}
      <div className="status-list">
        {statuses.map((statusItem, index) => (
          <>
            <StatusListItem
              key={index}
              status={statusItem.status}
              date={statusItem.date}
              description={statusItem.description}
            />
            {index < statuses.length - 1 && <div className="status-separator" />}
          </>
        ))}
      </div>

      {/* Incident Details */}
      <div className="incident-details">
        <h4 className="incident-title">Incident Details</h4>
        <p className="incident-description">
          {incidentDetails}
        </p>
      </div>
    </div>
  );
};

export default ClaimCard;
