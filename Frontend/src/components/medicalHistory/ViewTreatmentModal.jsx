// src/components/medicalHistory/ViewTreatmentModal.jsx
import "./../../styles/medicalHistory.css";
import StatusBadge from "./StatusBadge";

const ViewTreatmentModal = ({ treatment, onClose }) => {
  if (!treatment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Treatment Details</h2>
            <p className="text-sm text-muted mt-1">View complete treatment information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Treatment Information */}
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Treatment Name</label>
                <p className="text-gray-900 mt-1">{treatment.treatmentName || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Livestock Tag</label>
                <p className="text-gray-900 mt-1">{treatment.livestockTag || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <StatusBadge status={treatment.status || "In Progress"} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Veterinarian</label>
                <p className="text-gray-900 mt-1">{treatment.vetName || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Diagnosis</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{treatment.diagnosis || "No diagnosis provided"}</p>
          </div>

          {/* Dates Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Treatment Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900 mt-1">{treatment.treatmentDate || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Next Follow-up</label>
                <p className="text-gray-900 mt-1">{treatment.nextTreatmentDate || "Not scheduled"}</p>
              </div>
            </div>
          </div>

          {/* Medicines Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Medicines Prescribed</h3>
            {treatment.medicines && treatment.medicines.length > 0 ? (
              <div className="space-y-4">
                {treatment.medicines.map((med, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Medicine {index + 1}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Dosage</label>
                        <p className="text-sm text-gray-900 mt-1">{med.dosage}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Frequency</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {med.frequency === 1 ? "Once" : med.frequency === 2 ? "Twice" : "Three times"} per day
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Duration</label>
                        <p className="text-sm text-gray-900 mt-1">{med.duration} days</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <label className="text-xs font-medium text-gray-600">Schedule Type</label>
                      <p className="text-sm text-gray-900 mt-1 capitalize">{med.scheduleType}</p>
                      
                      {med.scheduleType === "interval" ? (
                        <div className="mt-2 bg-blue-50 rounded p-2">
                          <p className="text-sm text-blue-900">
                            <span className="font-medium">Schedule:</span> Every {med.intervalHours} hours starting at {med.startTime}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 bg-blue-50 rounded p-2">
                          <p className="text-sm text-blue-900">
                            <span className="font-medium">Times:</span> {med.exactTimes?.slice(0, med.frequency).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medicines prescribed</p>
            )}
          </div>

          {/* Document Section */}
          {treatment.document && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Attached Document</h3>
              <p className="text-sm text-gray-600">Document attached: {treatment.document.name || "Medical document"}</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTreatmentModal;
