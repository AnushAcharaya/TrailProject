import { useState } from 'react';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';

const UploadPaymentProofStep = ({ paymentProof, onProofUpload, onNext, onBack }) => {
  const [preview, setPreview] = useState(paymentProof?.preview || null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onProofUpload({
        file: file,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onProofUpload(null);
    setError('');
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Upload Payment Proof</h2>
      <p className="form-subtitle">
        Upload a screenshot of your successful eSewa payment
      </p>

      <div className="upload-section">
        {!preview ? (
          <label className="upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="upload-content">
              <FaUpload className="upload-icon" />
              <p className="upload-text">Click to upload payment screenshot</p>
              <p className="upload-hint">PNG, JPG up to 5MB</p>
            </div>
          </label>
        ) : (
          <div className="preview-container">
            <div className="preview-header">
              <FaImage className="text-emerald-600" />
              <span className="preview-title">Payment Screenshot</span>
              <button
                type="button"
                onClick={handleRemove}
                className="remove-btn"
              >
                <FaTimes />
              </button>
            </div>
            <div className="preview-image-wrapper">
              <img
                src={preview}
                alt="Payment proof"
                className="preview-image"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="info-box">
        <p className="info-title">Important:</p>
        <ul className="info-list">
          <li>Make sure the screenshot clearly shows the payment success message</li>
          <li>Transaction ID and amount should be visible</li>
          <li>This will be verified by our team</li>
        </ul>
      </div>

      <div className="btn-container">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!preview}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default UploadPaymentProofStep;
