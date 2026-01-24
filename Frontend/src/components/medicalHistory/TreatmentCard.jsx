// src/components/medicalHistory/TreatmentCard.jsx
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./../../styles/medicalHistory.css";
import StatusBadge from "./StatusBadge";

const TreatmentCard = ({ treatment, onEdit, onDelete, onView }) => {
  return (
    <div className="treatment-card">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-body">{treatment.treatmentName || "N/A"}</h3>
          <p className="text-sm text-muted">Livestock: {treatment.livestockTag || "N/A"}</p>
        </div>
        <StatusBadge status={treatment.status || "In Progress"} />
      </div>
      
      <div className="mt-2 space-y-1">
        <p className="text-sm"><strong>Diagnosis:</strong> {treatment.diagnosis || "N/A"}</p>
        <p className="text-sm"><strong>Medicines:</strong> {treatment.medicines?.map(m => m.name).join(", ") || "N/A"}</p>
        <p className="text-sm text-muted">Vet: {treatment.vetName || "N/A"}</p>
        <p className="text-sm text-muted">
          Start: {treatment.treatmentDate || "N/A"}
          {treatment.nextTreatmentDate && ` | Next: ${treatment.nextTreatmentDate}`}
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