const ClaimMiniCard = () => {
  return (
    <div className="mini-claim-card">
      <div className="claim-header-row">
        <div className="claim-number-mini">CLM-101</div>
        <div className={`claim-status-mini status-pending-mini`}>
          Pending Review
        </div>
      </div>

      <div className="claim-details-grid">
        <div className="detail-item">
          <div className="detail-label">Livestock</div>
          <div className="detail-value">Dolly (Sheep)</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Type</div>
          <div className="detail-value">Accident</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Date</div>
          <div className="detail-value">Jul 20, 2025</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Amount</div>
          <div className="detail-value">NPR 25,000</div>
        </div>
      </div>

      <button className="action-button btn-review">
        Review Claim
      </button>
    </div>
  );
};

export default ClaimMiniCard;
