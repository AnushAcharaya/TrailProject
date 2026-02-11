import { FaShieldAlt } from 'react-icons/fa';

const ClaimDetailsForm = ({
  claimType,
  incidentDate,
  description,
  onChange
}) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaShieldAlt className="w-6 h-6 text-emerald-600" />
        Claim Details
      </h3>
      
      <div className="form-group">
        <label className="form-label">Claim Type</label>
        <select
          className="form-select"
          value={claimType}
          onChange={(e) => onChange('claimType', e.target.value)}
        >
          <option value="">Select claim type...</option>
          <option value="accident">Accident</option>
          <option value="disease">Disease</option>
          <option value="theft">Theft</option>
          <option value="death">Death</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Incident Date</label>
        <input
          type="date"
          className="form-input"
          value={incidentDate}
          onChange={(e) => onChange('incidentDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          placeholder="Provide detailed description of the incident..."
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
    </div>
  );
};

export default ClaimDetailsForm;
