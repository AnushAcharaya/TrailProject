import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf,
  FaDownload,
  FaImage,
  FaTimes as FaClose
} from "react-icons/fa";

const AccountCard = ({ data, onApprove, onDecline }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(data.status);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    id,
    name,
    role,
    phone,
    email,
    address,
    farmName,
    specialization,
    documents,
    submittedDate,
  } = data;

  const handleApprove = async () => {
    if (onApprove) {
      const success = await onApprove(id);
      if (success) {
        setCurrentStatus("Approved");
      }
    }
  };

  const handleDecline = async () => {
    if (onDecline) {
      const success = await onDecline(id);
      if (success) {
        setCurrentStatus("Declined");
      }
    }
  };

  const handleDownload = (doc) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = doc.url || doc.file;
    link.download = doc.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewImage = (doc) => {
    setSelectedImage(doc);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  return (
    <div className="account-wrapper">
      <div className="account-card">
        {/* TOP SECTION */}
        <div className="top-row">
          <div className="user-block">
            <div>
              <h3 className="username">{name}</h3>

              <div className="tag-row">
                <span className="tag role">{role}</span>
                <span className={`tag status ${currentStatus.toLowerCase()}`}>
                  {currentStatus}
                </span>
              </div>
            </div>
          </div>

          <button className="view-btn" onClick={() => setOpen(!open)}>
            {open ? t('accountCard.viewLess') : t('accountCard.viewMore')}
            {open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        </div>

        {/* Contact Info */}
        <div className="info-row">
          <div className="info-item">
            <FaPhone size={14} />
            {phone}
          </div>

          <div className="info-item">
            <FaEnvelope size={14} />
            {email}
          </div>

          <div className="info-item">
            <FaMapMarkerAlt size={14} />
            {address}
          </div>
        </div>

        {/* EXPANDED SECTION */}
        {open && (
          <div className="expanded-area">

            {/* FARM NAME */}
            {role === "Farmer" && (
              <>
                <div className="section-title">{t('accountCard.farmName')}</div>
                <div className="section-text">{farmName}</div>
              </>
            )}

            {/* SPECIALIZATION */}
            {role === "Veterinarian" && (
              <>
                <div className="section-title">{t('accountCard.specialization')}</div>
                <div className="section-text">{specialization}</div>
              </>
            )}

            {/* DOCUMENTS */}
            <div className="section-title">{t('accountCard.uploadedDocuments')}</div>

            <div className="docs-grid">
              {documents.map((doc, index) => (
                <div className="doc-card" key={index}>
                  {doc.type === 'Image' || doc.type?.includes('image') ? (
                    <FaImage className="pdf-icon" style={{ color: '#4CAF50' }} />
                  ) : (
                    <FaFilePdf className="pdf-icon" />
                  )}

                  <div className="doc-info">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-meta">
                      {doc.type} – {doc.size}
                    </div>
                  </div>

                  <div className="doc-actions">
                    {(doc.type === 'Image' || doc.type?.includes('image')) && (
                      <button 
                        className="icon-btn" 
                        onClick={() => handleViewImage(doc)}
                        title="View Image"
                      >
                        <FaImage size={16} />
                      </button>
                    )}
                    <button 
                      className="icon-btn" 
                      onClick={() => handleDownload(doc)}
                      title="Download"
                    >
                      <FaDownload size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMITTED DATE */}
            <div className="submitted-text">
              {t('accountCard.submitted')}: {submittedDate}
            </div>
          </div>
        )}

        {/* BUTTONS */}
        <div className="btn-row">
          <button 
            className="approve-btn" 
            onClick={handleApprove}
            disabled={currentStatus === "Approved"}
          >
            <FaCheck /> {t('accountCard.approve')}
          </button>
          <button 
            className="decline-btn" 
            onClick={handleDecline}
            disabled={currentStatus === "Declined"}
          >
            <FaTimes /> {t('accountCard.decline')}
          </button>
        </div>
      </div>

      {/* IMAGE VIEWER MODAL */}
      {selectedImage && (
        <div className="image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-viewer-btn" onClick={closeImageViewer}>
              <FaClose size={24} />
            </button>
            
            <div className="image-viewer-content">
              <img 
                src={selectedImage.url || selectedImage.file} 
                alt={selectedImage.name}
                className="viewer-image"
              />
              
              <div className="image-viewer-footer">
                <span className="image-name">{selectedImage.name}</span>
                <button 
                  className="download-viewer-btn" 
                  onClick={() => handleDownload(selectedImage)}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCard;
