import React, { useState } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionType, setActionType] = useState(null); // 'decline' or 'complete'

  const handleApprove = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      await approveAppointment(appointment.id);
      onUpdate();
    } catch (err) {
      console.error("Error approving appointment:", err);
      setError("Failed to approve appointment. Please try again.");
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
      setError(`Failed to ${actionType} appointment. Please try again.`);
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

  const farmerName = appointment.farmer_details?.full_name || appointment.farmer_details?.username || "Unknown Farmer";
  const animalType = appointment.animal_type?.charAt(0).toUpperCase() + appointment.animal_type?.slice(1) || "Unknown";
  const createdDate = formatAppointmentDate(appointment.created_at);
  const preferredDate = formatAppointmentDate(appointment.preferred_date);
  const preferredTime = formatAppointmentTime(appointment.preferred_time);

  return (
    <>
      <div className="app-card">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{farmerName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MdPets size={16} />
                <span>{animalType}</span>
                <span>·</span>
                <FiCalendar size={14} />
                <span>Requested {createdDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 app-note mb-2">
            <FiFileText className="text-gray-500 mt-0.5" size={16} />
            <p className="text-sm text-gray-700">
              {appointment.reason}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiClock size={14} />
            <span>Preferred: {preferredDate} at {preferredTime}</span>
          </div>

          {appointment.vet_notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {appointment.vet_notes}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="text-right">
          <span
            className={`badge ${
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

          <div className="mt-4 flex flex-col gap-2">
            {appointment.status === "Pending" && (
              <>
                <button 
                  className="btn-primary"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Approve"}
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDecline}
                  disabled={isProcessing}
                >
                  Decline
                </button>
              </>
            )}

            {appointment.status === "Approved" && (
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleComplete}
                disabled={isProcessing}
              >
                Complete Appointment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {actionType === 'decline' ? 'Decline Appointment' : 'Complete Appointment'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'decline' 
                ? 'Please provide a reason for declining this appointment (optional):'
                : 'Add any notes about the completed appointment (optional):'}
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes here..."
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
                Cancel
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
                {isProcessing ? "Processing..." : actionType === 'decline' ? 'Decline' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VetAppointmentCard;
