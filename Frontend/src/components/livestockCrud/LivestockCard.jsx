// src/components/LivestockCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { GiCow } from "react-icons/gi";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const LivestockCard = ({ livestock, index, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(index);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="livestock-card">
      {/* Image/Icon at top center */}
      <div className="card-image-container">
        {livestock.imagePreview ? (
          <img
            src={livestock.imagePreview}
            alt="Livestock"
            className="card-livestock-image"
          />
        ) : (
          <div className="card-icon-placeholder">
            <GiCow size={48} color="#2e7d32" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="card-title">{livestock.livestockType}</h3>

      {/* Two-column layout for info */}
      <div className="card-info-grid">
        <div className="info-item">
          <span className="info-label">Tag ID:</span>
          <span className="info-value">{livestock.tagId}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Breed:</span>
          <span className="info-value">{livestock.breed || "N/A"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Age:</span>
          <span className="info-value">{livestock.age || "N/A"} years</span>
        </div>
        <div className="info-item">
          <span className="info-label">Gender:</span>
          <span className="info-value">{livestock.gender}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Weight:</span>
          <span className="info-value">{livestock.weight || "N/A"} kg</span>
        </div>
        <div className="info-item">
          <span className="info-label">Health:</span>
          <span className="info-value">{livestock.healthStatus || "N/A"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <Link to={`/livestock/edit/${index}`} className="edit-btn">
          Edit
        </Link>
        <button onClick={handleDeleteClick} className="delete-btn">
          Delete
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmDeleteModal
          livestock={livestock}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default LivestockCard;