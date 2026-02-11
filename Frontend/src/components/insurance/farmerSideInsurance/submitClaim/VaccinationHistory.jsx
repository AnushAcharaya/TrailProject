import { FaSyringe } from 'react-icons/fa';

const VaccinationHistory = ({ vaccinationHistory, onChange }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaSyringe className="w-6 h-6 text-emerald-600" />
        Vaccination History
      </h3>
      
      <textarea
        className="form-input"
        placeholder="List vaccination dates and types (e.g., FMD - 2025-01-15, PPR - 2025-03-20)..."
        value={vaccinationHistory}
        onChange={(e) => onChange('vaccinationHistory', e.target.value)}
      />
    </div>
  );
};

export default VaccinationHistory;
