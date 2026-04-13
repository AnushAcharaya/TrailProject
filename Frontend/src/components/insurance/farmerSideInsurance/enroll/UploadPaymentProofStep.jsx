import { useState } from 'react';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const UploadPaymentProofStep = ({ paymentProof, onProofUpload, onNext, onBack }) => {
  const { t } = useTranslation('insurance');
  const [preview, setPreview] = useState(paymentProof?.preview || null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('enroll.uploadProof.errors.invalidType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('enroll.uploadProof.errors.fileTooLarge'));
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
      <h2 className="form-title">{t('enroll.uploadProof.title')}</h2>
      <p className="form-subtitle">
        {t('enroll.uploadProof.subtitle')}
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
              <p className="upload-text">{t('enroll.uploadProof.clickToUpload')}</p>
              <p className="upload-hint">{t('enroll.uploadProof.fileTypes')}</p>
            </div>
          </label>
        ) : (
          <div className="preview-container">
            <div className="preview-header">
              <FaImage className="text-emerald-600" />
              <span className="preview-title">{t('enroll.uploadProof.paymentScreenshot')}</span>
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
                alt={t('enroll.uploadProof.paymentProofAlt')}
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
        <p className="info-title">{t('enroll.uploadProof.important')}:</p>
        <ul className="info-list">
          <li>{t('enroll.uploadProof.instructions.clearMessage')}</li>
          <li>{t('enroll.uploadProof.instructions.transactionVisible')}</li>
          <li>{t('enroll.uploadProof.instructions.verification')}</li>
        </ul>
      </div>

      <div className="btn-container">
        <button className="btn-back" onClick={onBack}>
          {t('enroll.uploadProof.back')}
        </button>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!preview}
        >
          {t('enroll.uploadProof.next')}
        </button>
      </div>
    </div>
  );
};

export default UploadPaymentProofStep;
