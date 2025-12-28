// src/components/ConfirmDeleteModal.jsx
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmDeleteModal = ({ livestock, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Warning Icon */}
        <div className="warning-icon">
          <FaExclamationTriangle size={24} color="#d32f2f" />
        </div>

        {/* Title */}
        <h3 className="modal-title">Delete Livestock</h3>

        {/* Confirmation Message */}
        <p className="modal-message">
          Are you sure you want to delete this livestock? This action cannot be undone.
        </p>

        {/* Livestock Info */}
        <div className="livestock-info">
          <div className="info-row">
            <span className="label">Tag ID:</span>
            <span className="value">{livestock.tagId || "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="label">Species:</span>
            <span className="value">{livestock.livestockType || "N/A"}</span>
          </div>
          <div className="info-row">
            <span className="label">Breed:</span>
            <span className="value">{livestock.breed || "N/A"}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="modal-buttons">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;