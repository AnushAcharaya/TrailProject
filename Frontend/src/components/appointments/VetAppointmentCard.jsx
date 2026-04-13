import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { FiUser, FiCalendar, FiFileText, FiClock } from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { 
  approveAppointment, 
  declineAppointment, 
  completeAppointment,
  formatAppointmentDate,
  formatAppointmentTime 
} from "../../services/appointmentApi";
import "../../styles/appointments.css";

const VetAppointmentCard = ({ appointment, onUpdate }) => {
  const { t } = useTranslation('appointments');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionType, setActionType] = useState(null); // 'decline' or 'complete'

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusMap = {
      'paid': { label: t('vet.paymentStatus.paid'), class: 'badge badge-green' },
      'pending': { label: t('vet.paymentStatus.pending'), class: 'badge badge-yellow' },
      'failed': { label: t('vet.paymentStatus.failed'), class: 'badge badge-red' },
      'not_required': { label: t('vet.paymentStatus.notRequired'), class: 'badge badge-gray' },
    };
    return statusMap[paymentStatus] || { label: t('vet.paymentStatus.unknown'), class: 'badge badge-gray' };
  };

  const getPaymentMethodLabel = (appointment) => {
    if (appointment.payment_status === 'paid' && appointment.payment) {
      return t('vet.paymentMethod.esewa');
    }
    if (appointment.payment_status === 'pending') {
      return t('vet.paymentMethod.cash');
    }
    return t('vet.paymentMethod.na');
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      await approveAppointment(appointment.id);
      onUpdate();
    } catch (err) {
      console.error("Error approving appointment:", err);
      setError(t('vet.errors.approveFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    setActionType('decline');
    setShowNotesModal(true);
  };

  const handleComplete = () => {
    setActionType('complete');
    setShowNotesModal(true);
  };

  const handleSubmitNotes = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      if (actionType === 'decline') {
        await declineAppointment(appointment.id, notes);
      } else if (actionType === 'complete') {
        await completeAppointment(appointment.id, notes);
      }
      setShowNotesModal(false);
      setNotes("");
      setActionType(null);
      onUpdate();
    } catch (err) {
      console.error(`Error ${actionType}ing appointment:`, err);
      setError(t('vet.errors.actionFailed', { action: actionType }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelModal = () => {
    setShowNotesModal(false);
    setNotes("");
    setActionType(null);
    setError(null);
  };

  const farmerName = appointment.farmer_details?.full_name || appointment.farmer_details?.username || t('vet.unknownFarmer');
  const animalType = appointment.animal_type?.charAt(0).toUpperCase() + appointment.animal_type?.slice(1) || t('vet.unknownAnimal');
  const createdDate = formatAppointmentDate(appointment.created_at);
  const preferredDate = formatAppointmentDate(appointment.preferred_date);
  const preferredTime = formatAppointmentTime(appointment.preferred_time);

  return (
    <>
      <div className="app-card">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{farmerName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <MdPets size={16} />
                <span>{animalType}</span>
                <span>·</span>
                <FiCalendar size={14} />
                <span>{t('vet.requested')} {createdDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <FiFileText className="text-gray-500 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {appointment.reason}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
            <FiClock size={16} />
            <span>{t('vet.preferred')}: {preferredDate} {t('vet.at')} {preferredTime}</span>
          </div>

          {appointment.vet_notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium">{t('vet.notes')}:</span> {appointment.vet_notes}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <span
            className={`badge self-end ${
              appointment.status === "Approved"
                ? "badge-green"
                : appointment.status === "Pending"
                ? "badge-yellow"
                : appointment.status === "Completed"
                ? "badge-blue"
                : appointment.status === "Declined"
                ? "badge-red"
                : "badge-gray"
            }`}
          >
            {appointment.status}
          </span>

          {/* Payment Badges and Action Buttons in Same Row */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Payment Information Badges */}
            <span className="badge badge-gray px-4 py-2 text-xs font-semibold rounded-md shadow-sm whitespace-nowrap">
              {getPaymentMethodLabel(appointment)}
            </span>
            <span className={`${getPaymentStatusBadge(appointment.payment_status).class} px-4 py-2 text-xs font-semibold rounded-md shadow-sm whitespace-nowrap`}>
              {getPaymentStatusBadge(appointment.payment_status).label}
            </span>

            {/* Spacer between badges and buttons */}
            <div className="w-8"></div>

            {/* Action Buttons */}
            {appointment.status === "Pending" && (
              <>
                <button 
                  className="px-5 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 hover:shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? t('vet.processing') : t('vet.actions.approve')}
                </button>
                <button 
                  className="px-5 py-2.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 hover:shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  onClick={handleDecline}
                  disabled={isProcessing}
                >
                  {t('vet.actions.decline')}
                </button>
              </>
            )}

            {appointment.status === "Approved" && (
              <button 
                className="px-5 py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 hover:shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                onClick={handleComplete}
                disabled={isProcessing}
              >
                {t('vet.actions.complete')}
              </button>
            )}
            
            <button 
              className="px-5 py-2.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 hover:shadow-md transition-all font-medium whitespace-nowrap"
              onClick={() => setShowDetailsModal(true)}
            >
              {t('vet.actions.viewDetails')}
            </button>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {actionType === 'decline' ? t('vet.modal.declineTitle') : t('vet.modal.completeTitle')}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'decline' 
                ? t('vet.modal.declinePrompt')
                : t('vet.modal.completePrompt')}
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('vet.modal.notesPlaceholder')}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-gray-700 mb-4"
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelModal}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('vet.modal.cancel')}
              </button>
              <button
                onClick={handleSubmitNotes}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'decline' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isProcessing ? t('vet.processing') : actionType === 'decline' ? t('vet.actions.decline') : t('vet.actions.complete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('vet.detailsModal.title')}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.farmer')}</label>
                  <p className="text-gray-900">{farmerName}</p>
                  <p className="text-sm text-gray-600">{appointment.farmer_details?.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.animalType')}</label>
                  <p className="text-gray-900 capitalize">{animalType}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.dateTime')}</label>
                  <p className="text-gray-900">
                    {preferredDate} {t('vet.at')} {preferredTime}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.status')}</label>
                  <p>
                    <span className={`badge ${
                      appointment.status === "Approved"
                        ? "badge-green"
                        : appointment.status === "Pending"
                        ? "badge-yellow"
                        : appointment.status === "Completed"
                        ? "badge-blue"
                        : appointment.status === "Declined"
                        ? "badge-red"
                        : "badge-gray"
                    }`}>
                      {appointment.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.paymentMethod')}</label>
                  <p className="text-gray-900 font-medium">
                    {getPaymentMethodLabel(appointment)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.paymentStatus')}</label>
                  <p>
                    <span className={getPaymentStatusBadge(appointment.payment_status).class}>
                      {getPaymentStatusBadge(appointment.payment_status).label}
                    </span>
                  </p>
                </div>

                {appointment.appointment_fee && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.appointmentFee')}</label>
                    <p className="text-gray-900 font-semibold">Rs. {appointment.appointment_fee}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.reason')}</label>
                  <p className="text-gray-900">{appointment.reason}</p>
                </div>

                {appointment.vet_notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('vet.detailsModal.vetNotes')}</label>
                    <p className="text-gray-900">{appointment.vet_notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex justify-center">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    {t('vet.detailsModal.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VetAppointmentCard;
