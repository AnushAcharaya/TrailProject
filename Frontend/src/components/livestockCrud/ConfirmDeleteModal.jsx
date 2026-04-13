// src/components/ConfirmDeleteModal.jsx
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmDeleteModal = ({ livestock, onConfirm, onCancel }) => {
  const { t } = useTranslation('livestock');
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Warning Icon */}
        <div className="warning-icon">
          <FaExclamationTriangle size={24} color="#d32f2f" />
        </div>

        {/* Title */}
        <h3 className="modal-title">{t('deleteModal.title')}</h3>

        {/* Confirmation Message */}
        <p className="modal-message">
          {t('deleteModal.message')}
        </p>

        {/* Livestock Info */}
        <div className="livestock-info">
          <div className="info-row">
            <span className="label">{t('deleteModal.labels.tagId')}</span>
            <span className="value">{livestock.tag_id || t('card.values.na')}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('deleteModal.labels.species')}</span>
            <span className="value">{livestock.species_name || t('card.values.na')}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('deleteModal.labels.breed')}</span>
            <span className="value">{livestock.breed_name || t('card.values.na')}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="modal-buttons">
          <button onClick={onCancel} className="cancel-btn">
            {t('deleteModal.buttons.cancel')}
          </button>
          <button onClick={onConfirm} className="delete-btn">
            {t('deleteModal.buttons.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;