// src/components/medicalHistory/TreatmentCard.jsx
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./../../styles/medicalHistory.css";

const TreatmentCard = ({ treatment, onEdit, onDelete, onView }) => {
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
    <div className="treatment-card">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-body">{treatment.treatment_name || "N/A"}</h3>
          <p className="text-sm text-muted">Livestock: {treatment.livestock?.tag_id || "N/A"}</p>
        </div>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {treatment.status || "In Progress"}
        </span>
      </div>
      
      <div className="mt-2 space-y-1">
        <p className="text-sm"><strong>Diagnosis:</strong> {treatment.diagnosis || "N/A"}</p>
        <p className="text-sm">
          <strong>Medicines:</strong>{" "}
          {treatment.medicines && treatment.medicines.length > 0
            ? treatment.medicines.map(m => m.name).join(", ")
            : "N/A"}
        </p>
        <p className="text-sm text-muted">Vet: {treatment.vet_name || "N/A"}</p>
        <p className="text-sm text-muted">
          Start: {treatment.treatment_date || "N/A"}
          {treatment.next_treatment_date && ` | Next: ${treatment.next_treatment_date}`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView && onView(treatment);
          }}
          className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition flex items-center justify-center gap-1"
        >
          <FaEye size={14} />
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(treatment);
          }}
          className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1"
        >
          <FaEdit size={14} />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(treatment);
          }}
          className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition flex items-center justify-center gap-1"
        >
          <FaTrash size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TreatmentCard;