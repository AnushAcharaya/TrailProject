// src/components/medicalHistory/TreatmentCard.jsx
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import "./../../styles/medicalHistory.css";
import { tStatus } from "../../utils/translateEnum";

const TreatmentCard = ({ treatment, onEdit, onDelete, onView }) => {
  const { t } = useTranslation('medical');
  const { t: tCommon } = useTranslation('common');
  
  // Debug: Log medicines data
  console.log('[TreatmentCard] Treatment:', treatment.treatment_name);
  console.log('[TreatmentCard] Full treatment object:', treatment);
  console.log('[TreatmentCard] Medicines array:', treatment.medicines);
  console.log('[TreatmentCard] Medicines is array?', Array.isArray(treatment.medicines));
  console.log('[TreatmentCard] Medicines length:', treatment.medicines?.length);
  if (treatment.medicines && treatment.medicines.length > 0) {
    console.log('[TreatmentCard] First medicine:', treatment.medicines[0]);
    console.log('[TreatmentCard] Medicine names:', treatment.medicines.map(m => m.name));
  }
  
  return (
    <div className="treatment-card-compact">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-body text-sm">{treatment.treatment_name || "N/A"}</h3>
          <p className="text-xs text-muted">{t('card.livestock')}: {treatment.livestock?.tag_id || "N/A"}</p>
        </div>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          {treatment.status ? tStatus(tCommon, treatment.status) : t('card.status.inProgress')}
        </span>
      </div>
      
      <div className="mt-2 space-y-1">
        <p className="text-xs"><strong>{t('card.diagnosis')}:</strong> {treatment.diagnosis || "N/A"}</p>
        <p className="text-xs">
          <strong>{t('card.medicines')}:</strong>{" "}
          {treatment.medicines && treatment.medicines.length > 0
            ? treatment.medicines.map(m => m.name).join(", ")
            : "N/A"}
        </p>
        <p className="text-xs text-muted">{t('card.vet')}: {treatment.vet_name || "N/A"}</p>
        <p className="text-xs text-muted">
          {t('card.start')}: {treatment.treatment_date || "N/A"}
          {treatment.next_treatment_date && ` | ${t('card.next')}: ${treatment.next_treatment_date}`}
        </p>
      </div>

      {/* Action Buttons - Icons Only */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView && onView(treatment);
          }}
          className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center justify-center"
          title={t('buttons.view')}
        >
          <FaEye size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(treatment);
          }}
          className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition flex items-center justify-center"
          title={t('buttons.edit')}
        >
          <FaEdit size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(treatment);
          }}
          className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition flex items-center justify-center"
          title={t('buttons.delete')}
        >
          <FaTrash size={16} />
        </button>
      </div>
    </div>
  );
};

export default TreatmentCard;