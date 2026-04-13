import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import StatusListItem from './StatusListItem';

const ClaimCard = ({ 
  claimNumber, 
  overallStatus, 
  statuses, 
  incidentDetails,
  claimType,
  claimAmount,
  incidentDate,
  incidentLocation,
  supportingDocument,
  vaccinationHistory,
  medicalHistory,
  vetNotes,
  adminNotes
}) => {
  const { t } = useTranslation('insurance');
  
  const getStatusLabel = (status) => {
    const labels = {
      'submitted': t('trackClaim.status.submitted'),
      'under-review': t('trackClaim.status.underReview'),
      'verification': t('trackClaim.status.pendingVerification'),
      'verified': t('trackClaim.status.approved'),
      'approved': t('trackClaim.status.approved'),
      'rejected': t('trackClaim.status.rejected'),
      'paid': t('trackClaim.status.paid')
    };
    return labels[status] || t('trackClaim.status.submitted');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `NPR ${parseFloat(amount).toLocaleString('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="claim-card">
      {/* Header */}
      <div className="claim-header">
        <div>
          <h3 className="claim-number">{t('trackClaim.claimNumber', { number: claimNumber })}</h3>
        </div>
        <div className={`claim-status-badge status-${overallStatus}`}>
          {getStatusLabel(overallStatus)}
          <StatusBadge status={overallStatus} />
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

      {/* Claim Information */}
      <div className="claim-info-section">
        <h4 className="section-title">{t('submitClaim.form.claimDetails')}</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">{t('verify.claimDetails.type')}:</span>
            <span className="info-value">{claimType || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('verify.claimDetails.amount')}:</span>
            <span className="info-value">{formatCurrency(claimAmount)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('verify.claimDetails.incidentDate')}:</span>
            <span className="info-value">{formatDate(incidentDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('verify.claimDetails.location')}:</span>
            <span className="info-value">{incidentLocation || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="incident-details">
        <h4 className="incident-title">{t('verify.claimDetails.description')}</h4>
        <p className="incident-description">
          {incidentDetails}
        </p>
      </div>

      {/* Supporting Documents */}
      {(supportingDocument || vaccinationHistory || medicalHistory) && (
        <div className="documents-section">
          <h4 className="section-title">{t('submitClaim.form.uploadImage')}</h4>
          <div className="documents-list">
            {supportingDocument && (
              <div className="document-item">
                <span className="document-icon">📄</span>
                <a 
                  href={`http://localhost:8000${supportingDocument}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  {t('submitClaim.form.uploadImage')}
                </a>
              </div>
            )}
            {vaccinationHistory && (
              <div className="document-item">
                <span className="document-icon">💉</span>
                <a 
                  href={`http://localhost:8000${vaccinationHistory}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  {t('verify.vaccinationHistory.title')}
                </a>
              </div>
            )}
            {medicalHistory && (
              <div className="document-item">
                <span className="document-icon">🏥</span>
                <a 
                  href={`http://localhost:8000${medicalHistory}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  {t('verify.medicalHistory.title')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vet Notes */}
      {vetNotes && (
        <div className="notes-section">
          <h4 className="section-title">{t('verify.decision.notes')}</h4>
          <p className="notes-content">{vetNotes}</p>
        </div>
      )}

      {/* Admin Notes */}
      {adminNotes && (
        <div className="notes-section">
          <h4 className="section-title">{t('verify.decision.notes')}</h4>
          <p className="notes-content">{adminNotes}</p>
        </div>
      )}
    </div>
  );
};

export default ClaimCard;
