import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimDetailsForm from './ClaimDetailsForm';
import VaccinationHistory from './VaccinationHistory';
import MedicalHistory from './MedicalHistory';
import FileUpload from './FileUpload';
import { FaPaperPlane, FaFileImage, FaCheckCircle } from 'react-icons/fa';
import { createClaim } from '../../../../services/insuranceApi';

const SubmitClaim = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    enrollment: '',
    claimType: '',
    claimAmount: '',
    incidentDate: '',
    incidentLocation: '',
    description: '',
    vaccinationHistory: null,
    medicalHistory: null,
    uploadedFile: null
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setShowErrorToast(false);
    
    try {
      // Prepare claim data for API
      const claimData = {
        enrollment: parseInt(formData.enrollment),
        claim_type: formData.claimType,
        claim_amount: parseFloat(formData.claimAmount),
        incident_date: formData.incidentDate,
        incident_location: formData.incidentLocation,
        description: formData.description,
        incident_image: formData.uploadedFile,
        vaccination_history: formData.vaccinationHistory,
        medical_history: formData.medicalHistory
      };
      
      console.log('Submitting claim:', claimData);
      
      const response = await createClaim(claimData);
      console.log('Claim created:', response);
      
      // Show success toast
      setShowSuccessToast(true);
      
      // Redirect to insurance dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/farmerinsurancedashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Failed to submit claim. Please try again.';
      setErrorMessage(errorMsg);
      setShowErrorToast(true);
      
      // Hide error toast after 5 seconds
      setTimeout(() => {
        setShowErrorToast(false);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <FaCheckCircle className="w-6 h-6" />
            <span className="font-medium text-lg">Claim submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Error Toast Notification */}
      {showErrorToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="font-medium text-lg">{errorMessage}</span>
            <button 
              onClick={() => setShowErrorToast(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="main-form-card">
        <h2 className="form-title">Submit a Claim</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Fill in claim details and vaccination history to attach
        </p>

        <div className="form-grid">
          <ClaimDetailsForm
            enrollment={formData.enrollment}
            claimType={formData.claimType}
            claimAmount={formData.claimAmount}
            incidentDate={formData.incidentDate}
            incidentLocation={formData.incidentLocation}
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
            disabled={
              !formData.enrollment || 
              !formData.claimType || 
              !formData.claimAmount || 
              !formData.incidentDate || 
              !formData.incidentLocation || 
              !formData.description || 
              submitting
            }
          >
            <FaPaperPlane className="w-5 h-5" />
            {submitting ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubmitClaim;
