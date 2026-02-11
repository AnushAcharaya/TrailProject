import { FaNotesMedical } from 'react-icons/fa';

const MedicalHistory = ({ medicalHistory, onChange }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaNotesMedical className="w-6 h-6 text-emerald-600" />
        Medical History
      </h3>
      
      <textarea
        className="form-input"
        placeholder="Previous treatments, diagnoses, vet visits (e.g., Diarrhea treatment - Dr. Sharma, 2025-02-10)..."
        value={medicalHistory}
        onChange={(e) => onChange('medicalHistory', e.target.value)}
      />
    </div>
  );
};

export default MedicalHistory;
