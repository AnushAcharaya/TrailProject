import { useState, useEffect } from 'react';
import { FaTimes, FaFileAlt, FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaPaw } from 'react-icons/fa';
import { getEnrollmentById } from '../../../../services/insuranceApi';
import '../../../../styles/farmerSideInsurance/enrollmentDetailsModal.css';

const EnrollmentDetailsModal = ({ enrollmentId, onClose }) => {
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrollmentDetails();
  }, [enrollmentId]);

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      const data = await getEnrollmentById(enrollmentId);
      setEnrollment(data);
    } catch (err) {
      console.error('Error fetching enrollment details:', err);
      setError('Failed to load enrollment details');
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
    return `NPR ${parseFloat(amount).toLocaleString('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getCoverageText = (coverageDetails) => {
    if (Array.isArray(coverageDetails)) {
      return coverageDetails.join(', ');
    }
    return 'N/A';
  };

  // Get enrollment badge based on status
  const getEnrollmentBadge = (status) => {
    if (status === 'Pending') {
      return { text: 'In Review', className: 'status-badge-review' };
    }
    if (status === 'Active') {
      return { text: 'Enrolled', className: 'status-badge-enrolled' };
    }
    if (status === 'Expired') {
      return { text: 'Expired', className: 'status-badge-expired' };
    }
    if (status === 'Cancelled') {
      return { text: 'Cancelled', className: 'status-badge-cancelled' };
    }
    return { text: status, className: 'status-badge-default' };
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading enrollment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">
            <p>{error || 'Enrollment not found'}</p>
            <button onClick={onClose} className="btn-close-error">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enrollment-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <FaFileAlt className="modal-icon" />
            <div>
              <h2>Enrollment Details</h2>
              <p className="modal-subtitle">Enrollment ID: {enrollment.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal">
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
                <span className={`modal-enrollment-badge ${getEnrollmentBadge(enrollment.status).className}`}>
                  {getEnrollmentBadge(enrollment.status).text}
                </span>
              </div>
              <div className="detail-item">
                <label>Enrollment Date</label>
                <div className="detail-value">
                  <FaCalendarAlt className="inline-icon" />
                  {formatDate(enrollment.enrollment_date)}
                </div>
              </div>
            </div>
          </div>

          {/* Livestock Information */}
          <div className="detail-section">
            <div className="section-header">
              <FaPaw className="section-icon" />
              <h3>Livestock Information</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Tag ID</label>
                <div className="detail-value highlight">{enrollment.livestock_details?.tag_id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Species</label>
                <div className="detail-value">{enrollment.livestock_details?.species_name || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Breed</label>
                <div className="detail-value">{enrollment.livestock_details?.breed_name || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Age</label>
                <div className="detail-value">{enrollment.livestock_details?.age ? `${enrollment.livestock_details.age} years` : 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Health Status</label>
                <div className="detail-value">
                  <span className={`health-badge ${enrollment.livestock_details?.health_status?.toLowerCase()}`}>
                    {enrollment.livestock_details?.health_status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Plan Details */}
          <div className="detail-section">
            <div className="section-header">
              <FaShieldAlt className="section-icon" />
              <h3>Insurance Plan</h3>
            </div>
            <div className="plan-card">
              <div className="plan-header">
                <h4>{enrollment.plan_details?.name || 'N/A'}</h4>
                <span className="plan-type">{enrollment.plan_details?.plan_type || 'N/A'}</span>
              </div>
              <p className="plan-description">{enrollment.plan_details?.description || 'No description available'}</p>
              
              <div className="plan-details-grid">
                <div className="plan-detail-item">
                  <label>Coverage Amount</label>
                  <div className="plan-value">{formatCurrency(enrollment.plan_details?.coverage_amount || 0)}</div>
                </div>
                <div className="plan-detail-item">
                  <label>Premium Amount</label>
                  <div className="plan-value">{formatCurrency(enrollment.plan_details?.premium_amount || 0)}</div>
                </div>
                <div className="plan-detail-item">
                  <label>Waiting Period</label>
                  <div className="plan-value">{enrollment.plan_details?.waiting_period_days || 0} days</div>
                </div>
              </div>

              <div className="coverage-section">
                <label>Coverage Includes:</label>
                <div className="coverage-tags">
                  {enrollment.plan_details?.coverage_details?.map((coverage, index) => (
                    <span key={index} className="coverage-tag">{coverage}</span>
                  )) || <span className="coverage-tag">No coverage details</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Period */}
          <div className="detail-section">
            <div className="section-header">
              <FaCalendarAlt className="section-icon" />
              <h3>Coverage Period</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Start Date</label>
                <div className="detail-value">{formatDate(enrollment.start_date)}</div>
              </div>
              <div className="detail-item">
                <label>End Date</label>
                <div className="detail-value">{formatDate(enrollment.end_date)}</div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="detail-section">
            <div className="section-header">
              <FaMoneyBillWave className="section-icon" />
              <h3>Payment Information</h3>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Premium Paid</label>
                <div className="detail-value highlight">{formatCurrency(enrollment.premium_paid)}</div>
              </div>
              <div className="detail-item">
                <label>Payment Date</label>
                <div className="detail-value">{formatDate(enrollment.payment_date)}</div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {enrollment.notes && (
            <div className="detail-section">
              <div className="section-header">
                <FaFileAlt className="section-icon" />
                <h3>Additional Notes</h3>
              </div>
              <div className="notes-content">
                {enrollment.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-close-footer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailsModal;
