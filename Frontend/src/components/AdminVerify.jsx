import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf,
  FaDownload
} from "react-icons/fa";

const AccountCard = ({ data, onApprove, onDecline }) => {
  const [open, setOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(data.status);

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
            {open ? "View Less" : "View More"}
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
                <div className="section-title">Farm Name</div>
                <div className="section-text">{farmName}</div>
              </>
            )}

            {/* SPECIALIZATION */}
            {role === "Veterinarian" && (
              <>
                <div className="section-title">Specialization</div>
                <div className="section-text">{specialization}</div>
              </>
            )}

            {/* DOCUMENTS */}
            <div className="section-title">Uploaded Documents</div>

            <div className="docs-grid">
              {documents.map((doc, index) => (
                <div className="doc-card" key={index}>
                  <FaFilePdf className="pdf-icon" />

                  <div className="doc-info">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-meta">
                      {doc.type} – {doc.size}
                    </div>
                  </div>

                  <FaDownload className="download-icon" />
                </div>
              ))}
            </div>

            {/* SUBMITTED DATE */}
            <div className="submitted-text">
              Submitted: {submittedDate}
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
            <FaCheck /> Approve
          </button>
          <button 
            className="decline-btn" 
            onClick={handleDecline}
            disabled={currentStatus === "Declined"}
          >
            <FaTimes /> Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
