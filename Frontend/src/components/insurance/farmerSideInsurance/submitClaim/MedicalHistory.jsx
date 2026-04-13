import { FaNotesMedical, FaFileUpload, FaFileAlt, FaTimes } from 'react-icons/fa';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MedicalHistory = ({ medicalHistory, onChange }) => {
  const { t } = useTranslation('insurance');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (accept .txt files from reports)
      const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (validTypes.includes(file.type)) {
        onChange('medicalHistory', file);
      } else {
        alert(t('submitClaim.form.invalidFileType'));
      }
    }
  };

  const handleRemoveFile = () => {
    onChange('medicalHistory', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (validTypes.includes(file.type)) {
        onChange('medicalHistory', file);
      } else {
        alert('Please upload a valid document file (.txt, .pdf, .doc, .docx)');
      }
    }
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaNotesMedical className="w-6 h-6 text-emerald-600" />
        {t('submitClaim.sections.medicalHistory')}
      </h3>
      
      <div className="file-upload-container">
        {!medicalHistory ? (
          <div
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaFileUpload className="upload-icon" />
            <p className="upload-text">{t('submitClaim.form.dropMedicalFile')}</p>
            <p className="upload-subtext">{t('submitClaim.form.fileFormats')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-preview-content">
              <FaFileAlt className="file-icon" />
              <div className="file-details">
                <p className="file-name">{medicalHistory.name}</p>
                <p className="file-size">{Math.round(medicalHistory.size / 1024)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="remove-file-btn"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
