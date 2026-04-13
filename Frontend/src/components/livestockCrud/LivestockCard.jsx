// src/components/LivestockCard.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GiCow } from "react-icons/gi";
import { FaSyringe } from "react-icons/fa";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const LivestockCard = ({ livestock, onDelete }) => {
  const { t } = useTranslation('livestock');
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(livestock.id);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleAddVaccine = () => {
    // Navigate to add vaccination page with this livestock pre-selected
    navigate('/vaccination/add', { 
      state: { preSelectedLivestock: livestock.tag_id } 
    });
  };

  return (
    <div className="livestock-card">
      {/* Image/Icon at top center */}
      <div className="card-image-container">
        {livestock.image_preview ? (
          <img
            src={livestock.image_preview}
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
      <h3 className="card-title">{livestock.species_name}</h3>

      {/* Two-column layout for info */}
      <div className="card-info-grid">
        <div className="info-item">
          <span className="info-label">{t('card.labels.tagId')}</span>
          <span className="info-value">{livestock.tag_id}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('card.labels.breed')}</span>
          <span className="info-value">{livestock.breed_name || t('card.values.na')}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('card.labels.age')}</span>
          <span className="info-value">{livestock.age || t('card.values.na')} {t('card.values.years')}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('card.labels.gender')}</span>
          <span className="info-value">{livestock.gender}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('card.labels.weight')}</span>
          <span className="info-value">{livestock.weight || t('card.values.na')} {t('card.values.kg')}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('card.labels.health')}</span>
          <span className="info-value">{livestock.health_status || t('card.values.na')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <button onClick={handleAddVaccine} className="btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-2">
          <FaSyringe size={14} />
          {t('form.buttons.addVaccine')}
        </button>
        <Link to={`/livestock/edit/${livestock.id}`} className="edit-btn">
          {t('form.buttons.edit')}
        </Link>
        <button onClick={handleDeleteClick} className="delete-btn">
          {t('form.buttons.delete')}
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