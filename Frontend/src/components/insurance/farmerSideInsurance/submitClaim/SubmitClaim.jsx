import { useState } from 'react';
import ClaimDetailsForm from './ClaimDetailsForm';
import VaccinationHistory from './VaccinationHistory';
import MedicalHistory from './MedicalHistory';
import FileUpload from './FileUpload';
import { FaPaperPlane, FaFileImage } from 'react-icons/fa';

const SubmitClaim = () => {
  const [formData, setFormData] = useState({
    claimType: '',
    incidentDate: '',
    description: '',
    vaccinationHistory: '',
    medicalHistory: '',
    uploadedFile: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (file) => {
    setFormData(prev => ({
      ...prev,
      uploadedFile: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Claim submitted:', formData);
    alert('Claim submitted successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="main-form-card">
        <h2 className="form-title">Submit a Claim</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Fill in claim details and vaccination history to attach
        </p>

        <div className="form-grid">
          <ClaimDetailsForm
            claimType={formData.claimType}
            incidentDate={formData.incidentDate}
            description={formData.description}
            onChange={handleInputChange}
          />
          
          <div>
            <VaccinationHistory
              vaccinationHistory={formData.vaccinationHistory}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-grid">
          <MedicalHistory
            medicalHistory={formData.medicalHistory}
            onChange={handleInputChange}
          />
          
          <div>
            <div className="form-group">
              <label className="form-label">Upload Images</label>
              <FileUpload onFileSelect={handleFileSelect} />
              {formData.uploadedFile && (
                <div className="file-info">
                  <div className="flex items-center gap-3">
                    <FaFileImage className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-sm text-gray-900">
                        {formData.uploadedFile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(formData.uploadedFile.size / 1024)} KB
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="btn-container">
          <button
            type="submit"
            className="btn-primary"
            disabled={!formData.claimType || !formData.incidentDate}
          >
            <FaPaperPlane className="w-5 h-5" />
            Submit Claim
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubmitClaim;
