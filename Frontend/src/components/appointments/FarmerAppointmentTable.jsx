import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAppointments, cancelAppointment, formatAppointmentDate, formatAppointmentTime } from "../../services/appointmentApi";
import "../../styles/appointments.css";

const FarmerAppointmentTable = () => {
  const { t } = useTranslation('appointments');
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAppointments({ ordering: '-preferred_date' });
      setAppointments(data.results || data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm(t('actions.cancel') + "?")) {
      return;
    }

    try {
      setCancellingId(id);
      await cancelAppointment(id);
      // Reload appointments
      await loadAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert(t('form.messages.error'));
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'Pending': 'badge badge-yellow',
      'Approved': 'badge badge-green',
      'Completed': 'badge badge-blue',
      'Cancelled': 'badge badge-red',
      'Declined': 'badge badge-red',
    };
    return classes[status] || 'badge badge-gray';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'Pending': t('status.pending'),
      'Approved': t('status.confirmed'),
      'Completed': t('status.completed'),
      'Cancelled': t('status.cancelled'),
      'Declined': t('status.rejected'),
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusMap = {
      'paid': { label: '✓ ' + t('payment.methods.esewa'), class: 'badge badge-green' },
      'pending': { label: '⏳ ' + t('status.pending'), class: 'badge badge-yellow' },
      'failed': { label: '✗ ' + t('payment.messages.paymentFailed'), class: 'badge badge-red' },
      'not_required': { label: t('common.noData'), class: 'badge badge-gray' },
    };
    return statusMap[paymentStatus] || { label: t('common.noData'), class: 'badge badge-gray' };
  };

  const getPaymentMethodLabel = (appointment) => {
    // If paid, check if there's a payment record
    if (appointment.payment_status === 'paid' && appointment.payment) {
      return 'eSewa';
    }
    // If pending and has fee, assume cash or esewa pending
    if (appointment.payment_status === 'pending') {
      return 'Cash';
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadAppointments}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {t('common.next')}
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">{t('farmer.appointments.noAppointments')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <table className="app-table">
          <thead>
            <tr>
              <th>{t('card.vet')}</th>
              <th>{t('card.animal')}</th>
              <th>{t('card.date')} / {t('card.time')}</th>
              <th>{t('card.status')}</th>
              <th>{t('payment.title')}</th>
              <th>{t('payment.title')} {t('card.status')}</th>
              <th className="text-right">{t('card.actions')}</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t">
                <td>
                  <div>
                    <div className="font-medium text-gray-900">
                      {appointment.veterinarian_details?.full_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.veterinarian_details?.email}
                    </div>
                  </div>
                </td>
                <td className="capitalize">{appointment.animal_type}</td>
                <td>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatAppointmentDate(appointment.preferred_date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatAppointmentTime(appointment.preferred_time)}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </td>
                <td>
                  <span className="text-gray-700 font-medium">
                    {getPaymentMethodLabel(appointment)}
                  </span>
                </td>
                <td>
                  <span className={getPaymentStatusBadge(appointment.payment_status).class}>
                    {getPaymentStatusBadge(appointment.payment_status).label}
                  </span>
                </td>
                <td className="text-right">
                  <div className="action-buttons-grid">
                    <button
                      onClick={() => handleViewDetails(appointment)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {t('actions.viewDetails')}
                    </button>
                    <div className="action-button-slot">
                      {(appointment.status === 'Pending' || appointment.status === 'Approved') && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={cancellingId === appointment.id}
                          className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {cancellingId === appointment.id ? t('common.loading') : t('actions.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="mobile-appointment-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="mobile-appointment-card">
              <div className="mobile-card-header">
                <div className="mobile-card-vet">
                  <div className="mobile-card-vet-name">
                    {appointment.veterinarian_details?.full_name || 'N/A'}
                  </div>
                  <div className="mobile-card-vet-email">
                    {appointment.veterinarian_details?.email}
                  </div>
                </div>
                <span className={getStatusBadgeClass(appointment.status)}>
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">{t('card.animal')}</span>
                  <span className="mobile-card-value capitalize">{appointment.animal_type}</span>
                </div>

                <div className="mobile-card-row">
                  <span className="mobile-card-label">{t('card.date')}</span>
                  <span className="mobile-card-value">
                    {formatAppointmentDate(appointment.preferred_date)}
                  </span>
                </div>

                <div className="mobile-card-row">
                  <span className="mobile-card-label">{t('card.time')}</span>
                  <span className="mobile-card-value">
                    {formatAppointmentTime(appointment.preferred_time)}
                  </span>
                </div>

                <div className="mobile-card-row">
                  <span className="mobile-card-label">{t('payment.title')}</span>
                  <span className="mobile-card-value">
                    {getPaymentMethodLabel(appointment)}
                  </span>
                </div>

                <div className="mobile-card-row">
                  <span className="mobile-card-label">{t('payment.title')} {t('card.status')}</span>
                  <span className={getPaymentStatusBadge(appointment.payment_status).class}>
                    {getPaymentStatusBadge(appointment.payment_status).label}
                  </span>
                </div>
              </div>

              <div className="mobile-card-actions">
                <button
                  onClick={() => handleViewDetails(appointment)}
                  className="mobile-btn-view"
                >
                  {t('actions.viewDetails')}
                </button>
                {(appointment.status === 'Pending' || appointment.status === 'Approved') && (
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    disabled={cancellingId === appointment.id}
                    className="mobile-btn-cancel"
                  >
                    {cancellingId === appointment.id ? t('common.loading') : t('actions.cancel')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
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
                <h2 className="text-2xl font-bold text-gray-800">{t('actions.viewDetails')}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('card.vet')}</label>
                  <p className="text-gray-900">{selectedAppointment.veterinarian_details?.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedAppointment.veterinarian_details?.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('form.animalType')}</label>
                  <p className="text-gray-900 capitalize">{selectedAppointment.animal_type}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('card.date')} & {t('card.time')}</label>
                  <p className="text-gray-900">
                    {formatAppointmentDate(selectedAppointment.preferred_date)} at {formatAppointmentTime(selectedAppointment.preferred_time)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('card.status')}</label>
                  <p>
                    <span className={getStatusBadgeClass(selectedAppointment.status)}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('payment.title')}</label>
                  <p className="text-gray-900 font-medium">
                    {getPaymentMethodLabel(selectedAppointment)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('payment.title')} {t('card.status')}</label>
                  <p>
                    <span className={getPaymentStatusBadge(selectedAppointment.payment_status).class}>
                      {getPaymentStatusBadge(selectedAppointment.payment_status).label}
                    </span>
                  </p>
                </div>

                {selectedAppointment.appointment_fee && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('payment.fee')}</label>
                    <p className="text-gray-900 font-semibold">Rs. {selectedAppointment.appointment_fee}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('form.reason')}</label>
                  <p className="text-gray-900">{selectedAppointment.reason}</p>
                </div>

                {selectedAppointment.vet_notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('card.vet')} Notes</label>
                    <p className="text-gray-900">{selectedAppointment.vet_notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex justify-center">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    {t('common.close')}
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

export default FarmerAppointmentTable;
