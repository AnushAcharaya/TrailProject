import { FaShieldAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getActiveEnrollments } from '../../../../services/insuranceApi';

const ClaimDetailsForm = ({
  claimType,
  incidentDate,
  incidentLocation,
  claimAmount,
  description,
  enrollment,
  onChange
}) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getActiveEnrollments();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setEnrollments([]);
    }
    setLoading(false);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaShieldAlt className="w-6 h-6 text-emerald-600" />
        Claim Details
      </h3>
      
      {/* Insurance Enrollment Selection */}
      <div className="form-group">
        <label className="form-label">Insurance Enrollment *</label>
        {loading ? (
          <p className="text-sm text-gray-500">Loading enrollments...</p>
        ) : (
          <select
            className="form-select"
            value={enrollment || ''}
            onChange={(e) => onChange('enrollment', e.target.value)}
            required
          >
            <option value="">Select insured livestock...</option>
            {enrollments.map((enroll) => (
              <option key={enroll.id} value={enroll.id}>
                {enroll.livestock_details?.tag_id} - {enroll.plan_details?.name} 
                (Coverage: NPR {enroll.plan_details?.coverage_amount})
              </option>
            ))}
          </select>
        )}
        {!loading && enrollments.length === 0 && (
          <p className="text-sm text-red-500 mt-1">
            No active insurance enrollments found. Please enroll livestock first.
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Claim Type *</label>
        <select
          className="form-select"
          value={claimType}
          onChange={(e) => onChange('claimType', e.target.value)}
          required
        >
          <option value="">Select claim type...</option>
          <option value="Death">Death</option>
          <option value="Theft">Theft</option>
          <option value="Disease">Disease</option>
          <option value="Accident">Accident</option>
          <option value="Natural Disaster">Natural Disaster</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Claim Amount (NPR) *</label>
        <input
          type="number"
          className="form-input"
          value={claimAmount || ''}
          onChange={(e) => onChange('claimAmount', e.target.value)}
          placeholder="Enter claim amount..."
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Incident Date *</label>
        <input
          type="date"
          className="form-input"
          value={incidentDate}
          onChange={(e) => onChange('incidentDate', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Incident Location *</label>
        <input
          type="text"
          className="form-input"
          value={incidentLocation || ''}
          onChange={(e) => onChange('incidentLocation', e.target.value)}
          placeholder="Enter location where incident occurred..."
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className="form-input"
          placeholder="Provide detailed description of the incident..."
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          rows="4"
          required
        />
      </div>
    </div>
  );
};

export default ClaimDetailsForm;
