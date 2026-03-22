import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes, FaFileAlt, FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaPaw, FaMapMarkerAlt, FaFileDownload } from 'react-icons/fa';
import { getClaimById } from '../../../../services/insuranceApi';
import '../../../../styles/farmerSideInsurance/trackClaim.css';

const TrackClaim = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const data = await getClaimById(claimId);
      console.log('Claim details:', data);
      setClaim(data);
    } catch (err) {
      console.error('Error fetching claim:', err);
      setError('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getStatusBadge = (status) => {
    const badges = {
      'Submitted': { text: 'Submitted', className: 'status-badge-submitted' },
      'Under Review': { text: 'Under Review', className: 'status-badge-review' },
      'Approved': { text: 'Approved', className: 'status-badge-approved' },
      'Rejected': { text: 'Rejected', className: 'status-badge-rejected' },
      'Paid': { text: 'Paid', className: 'status-badge-paid' }
    };
    return badges[status] || { text: status, className: 'status-badge-default' };
  };

  const handleClose = () => {
    navigate('/farmerinsurancedashboard');
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading claim details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-error">
            <p>{error || 'Claim not found'}</p>
            <button onClick={handleClose} className="btn-close-error">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content claim-details-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <FaFileAlt className="modal-icon" />
            <div>
              <h2>Claim Details</h2>
              <p className="modal-subtitle">Claim ID: CLM-{claim.id}</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-close-modal">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Section */}
          <div className="detail-section">
            <div className="section-header">
              <FaShieldAlt className="section-icon" />
              <h3>Status Information</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Current Status</label>
                <span className={`modal-claim-badge ${getStatusBadge(claim.status).className}`}>
                  {getStatusBadge(claim.status).text}
                </span>
              </div>
              <div className="detail-item">
                <label>Submission Date</label>
                <div className="detail-value">
                  <FaCalendarAlt className="inline-icon" />
                  {formatDate(claim.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Claim Information */}
          <div className="detail-section">
            <div className="section-header">
              <FaFileAlt className="section-icon" />
              <h3>Claim Information</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Claim Type</label>
                <div className="detail-value highlight">{claim.claim_type || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Claim Amount</label>
                <div className="detail-value highlight">{formatCurrency(claim.claim_amount)}</div>
              </div>
              <div className="detail-item">
                <label>Incident Date</label>
                <div className="detail-value">
                  <FaCalendarAlt className="inline-icon" />
                  {formatDate(claim.incident_date)}
                </div>
              </div>
              <div className="detail-item">
                <label>Incident Location</label>
                <div className="detail-value">
                  <FaMapMarkerAlt className="inline-icon" />
                  {claim.incident_location || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Incident Description */}
          <div className="detail-section">
            <div className="section-header">
              <FaFileAlt className="section-icon" />
              <h3>Incident Description</h3>
            </div>
            <div className="notes-content">
              {claim.description || 'No description provided'}
            </div>
          </div>

          {/* Livestock Information */}
          {claim.enrollment_details && (
            <div className="detail-section">
              <div className="section-header">
                <FaPaw className="section-icon" />
                <h3>Livestock Information</h3>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Tag ID</label>
                  <div className="detail-value highlight">{claim.enrollment_details.livestock_details?.tag_id || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label>Species</label>
                  <div className="detail-value">{claim.enrollment_details.livestock_details?.species_name || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label>Breed</label>
                  <div className="detail-value">{claim.enrollment_details.livestock_details?.breed_name || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <div className="detail-value">{claim.enrollment_details.livestock_details?.age ? `${claim.enrollment_details.livestock_details.age} years` : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          {(claim.incident_image || claim.vaccination_history || claim.medical_history) && (
            <div className="detail-section">
              <div className="section-header">
                <FaFileDownload className="section-icon" />
                <h3>Supporting Documents</h3>
              </div>
              <div className="documents-list">
                {claim.incident_image && (
                  <a 
                    href={claim.incident_image.startsWith('http') ? claim.incident_image : `http://localhost:8000${claim.incident_image}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                    download
                  >
                    <span className="document-icon">📄</span>
                    <span>Incident Image</span>
                    <FaFileDownload className="download-icon" />
                  </a>
                )}
                {claim.vaccination_history && (
                  <a 
                    href={claim.vaccination_history.startsWith('http') ? claim.vaccination_history : `http://localhost:8000${claim.vaccination_history}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                    download
                  >
                    <span className="document-icon">💉</span>
                    <span>Vaccination History</span>
                    <FaFileDownload className="download-icon" />
                  </a>
                )}
                {claim.medical_history && (
                  <a 
                    href={claim.medical_history.startsWith('http') ? claim.medical_history : `http://localhost:8000${claim.medical_history}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="document-link"
                    download
                  >
                    <span className="document-icon">🏥</span>
                    <span>Medical History</span>
                    <FaFileDownload className="download-icon" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {claim.admin_notes && (
            <div className="detail-section">
              <div className="section-header">
                <FaFileAlt className="section-icon" />
                <h3>Admin Notes</h3>
              </div>
              <div className="notes-content admin-notes">
                {claim.admin_notes}
              </div>
              {claim.decision_date && (
                <div className="notes-meta">
                  Decision made on: {formatDate(claim.decision_date)}
                </div>
              )}
            </div>
          )}

          {/* Approved Amount (if approved) */}
          {claim.approved_amount && (
            <div className="detail-section">
              <div className="section-header">
                <FaMoneyBillWave className="section-icon" />
                <h3>Approved Amount</h3>
              </div>
              <div className="approved-amount">
                {formatCurrency(claim.approved_amount)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={handleClose} className="btn-close-footer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackClaim;
