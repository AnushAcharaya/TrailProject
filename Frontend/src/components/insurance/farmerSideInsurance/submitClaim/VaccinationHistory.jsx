import { FaSyringe, FaFileUpload, FaFileAlt, FaTimes } from 'react-icons/fa';
import { useRef } from 'react';

const VaccinationHistory = ({ vaccinationHistory, onChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (accept .txt files from reports)
      const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (validTypes.includes(file.type)) {
        onChange('vaccinationHistory', file);
      } else {
        alert('Please upload a valid document file (.txt, .pdf, .doc, .docx)');
      }
    }
  };

  const handleRemoveFile = () => {
    onChange('vaccinationHistory', null);
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
        onChange('vaccinationHistory', file);
      } else {
        alert('Please upload a valid document file (.txt, .pdf, .doc, .docx)');
      }
    }
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaSyringe className="w-6 h-6 text-emerald-600" />
        Vaccination History
      </h3>
      
      <div className="file-upload-container">
        {!vaccinationHistory ? (
          <div
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaFileUpload className="upload-icon" />
            <p className="upload-text">Drop vaccination history file here or click to upload</p>
            <p className="upload-subtext">TXT, PDF, DOC, DOCX (Downloaded from Reports)</p>
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
                <p className="file-name">{vaccinationHistory.name}</p>
                <p className="file-size">{Math.round(vaccinationHistory.size / 1024)} KB</p>
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

export default VaccinationHistory;
