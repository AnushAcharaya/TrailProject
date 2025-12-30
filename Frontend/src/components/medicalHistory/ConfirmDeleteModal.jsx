// src/components/medicalHistory/ConfirmDeleteModal.jsx
import "./../../styles/medicalHistory.css";

const ConfirmDeleteModal = ({ treatment, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
          Delete Treatment Record
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 mb-4">
          Are you sure you want to delete this treatment record? This action cannot be undone.
        </p>

        {/* Treatment Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Treatment:</span>
              <span className="text-sm text-gray-900">{treatment.treatmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Livestock:</span>
              <span className="text-sm text-gray-900">{treatment.livestockTag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Date:</span>
              <span className="text-sm text-gray-900">{treatment.treatmentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-sm text-gray-900">{treatment.status}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
