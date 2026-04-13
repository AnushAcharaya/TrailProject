// src/components/medicalHistory/ViewTreatmentModal.jsx
import { useTranslation } from 'react-i18next';
import "./../../styles/medicalHistory.css";
import StatusBadge from "./StatusBadge";

const ViewTreatmentModal = ({ treatment, onClose }) => {
  const { t } = useTranslation('medical');
  
  if (!treatment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{t('viewModal.title')}</h2>
            <p className="text-sm text-muted mt-1">{t('page.subtitle')}</p>
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
            <h3 className="font-semibold text-lg mb-3 text-gray-900">{t('viewModal.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">{t('viewModal.treatmentName')}</label>
                <p className="text-gray-900 mt-1">{treatment.treatment_name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('viewModal.livestock')}</label>
                <p className="text-gray-900 mt-1">{treatment.livestock?.tag_id || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('viewModal.status')}</label>
                <div className="mt-1">
                  <StatusBadge status={treatment.status || t('card.status.inProgress')} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('viewModal.vet')}</label>
                <p className="text-gray-900 mt-1">{treatment.vet_name || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">{t('viewModal.diagnosis')}</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{treatment.diagnosis || "No diagnosis provided"}</p>
          </div>

          {/* Dates Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">{t('viewModal.treatmentDate')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">{t('card.start')}</label>
                <p className="text-gray-900 mt-1">{treatment.treatment_date || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('viewModal.nextFollowUp')}</label>
                <p className="text-gray-900 mt-1">{treatment.next_treatment_date || "Not scheduled"}</p>
              </div>
            </div>
          </div>

          {/* Medicines Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">{t('viewModal.medicines')}</h3>
            {treatment.medicines && treatment.medicines.length > 0 ? (
              <div className="space-y-4">
                {treatment.medicines.map((med, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t('form.medicines')} {index + 1}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">{t('viewModal.medicineDetails.dosage')}</label>
                        <p className="text-sm text-gray-900 mt-1">{med.dosage}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">{t('viewModal.medicineDetails.frequency')}</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {t('viewModal.medicineDetails.timesPerDay', { count: med.frequency })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">{t('viewModal.medicineDetails.duration')}</label>
                        <p className="text-sm text-gray-900 mt-1">{t('viewModal.medicineDetails.forDays', { days: med.duration })}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <label className="text-xs font-medium text-gray-600">{t('viewModal.medicineDetails.schedule')}</label>
                      <p className="text-sm text-gray-900 mt-1 capitalize">{med.scheduleType || med.schedule_type}</p>
                      
                      {(med.scheduleType === "interval" || med.schedule_type === "interval") ? (
                        <div className="mt-2 bg-blue-50 rounded p-2">
                          <p className="text-sm text-blue-900">
                            <span className="font-medium">{t('viewModal.medicineDetails.schedule')}:</span> {t('form.schedulePreview.interval', { hours: med.intervalHours || med.interval_hours, time: med.startTime || med.start_time })}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 bg-blue-50 rounded p-2">
                          <p className="text-sm text-blue-900">
                            <span className="font-medium">{t('form.exactTime', { number: '' })}:</span> {(med.exactTimes || med.exact_times)?.slice(0, med.frequency).join(", ")}
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
              <h3 className="font-semibold text-lg mb-3 text-gray-900">{t('form.document')}</h3>
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
            {t('viewModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTreatmentModal;
