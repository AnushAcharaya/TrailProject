// src/components/vaccination/VaccinationCard.jsx
import { useState } from "react";
import { FaCalendar, FaClock, FaEdit, FaPaw, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { updateVaccination } from "../../services/vaccinationApi";
import "./../../styles/vaccination.css";

const VaccinationCard = ({ vaccination, onRefresh }) => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dueDate = new Date(vaccination.next_due_date);
  const givenDate = new Date(vaccination.date_given);

  const status = vaccination.status || "upcoming";
  const statusDisplay = vaccination.status_display || "";
  const daysDiff = vaccination.days_until_due || 0;
  const isCompleted = status === "completed";

  let alertMessage = statusDisplay;
  if (!alertMessage) {
    if (daysDiff < 0) {
      alertMessage = `Overdue by ${Math.abs(daysDiff)} days - Immediate attention required`;
    } else if (daysDiff === 0) {
      alertMessage = "Due today - Schedule appointment";
    } else {
      alertMessage = `Due in ${daysDiff} days - Schedule vaccination appointment`;
    }
  }

  const handleEdit = () => {
    navigate(`/vaccination/edit/${vaccination.id}`);
  };

  const handleAddVaccine = () => {
    // Navigate to add vaccination page with the livestock pre-selected
    navigate('/vaccination/add', { 
      state: { preSelectedLivestock: vaccination.livestock?.tag_id } 
    });
  };

  const handleMarkCompleted = async () => {
    setIsCompleting(true);
    setShowConfirmModal(false);
    try {
      const formData = {
        livestock: vaccination.livestock?.tag_id,
        vaccineName: vaccination.vaccine_name,
        vaccineType: vaccination.vaccine_type,
        dateGiven: vaccination.date_given,
        nextDueDate: new Date().toISOString().split('T')[0], // Set to today to mark as completed
        notes: vaccination.notes || '',
      };
      
      const result = await updateVaccination(vaccination.id, formData);
      
      if (result.success && onRefresh) {
        onRefresh(); // Refresh the vaccination list
      }
    } catch (error) {
      console.error('Failed to mark vaccination as completed:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      <div className={`vaccination-card ${status}`}>
        <div className="header">
          <div>
            <div className="name">{vaccination.vaccine_name}</div>
            <div className="type">{vaccination.vaccine_type}</div>
            {vaccination.livestock && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <FaPaw size={14} className="text-gray-500" />
                <span>
                  {vaccination.livestock.tag_id} - {vaccination.livestock.species_name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
              title="Edit vaccination"
            >
              <FaEdit size={18} />
            </button>
            <span className={`badge badge-${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        <div className="details">
          <div className="date">
            <FaCalendar className="text-muted mr-1" size={16} />
            Given: {givenDate.toLocaleDateString()}
          </div>
          <div className="date">
            <FaClock className="text-muted mr-1" size={16} />
            Due: {dueDate.toLocaleDateString()}
          </div>
        </div>

        {vaccination.notes && (
          <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
            <strong>Notes:</strong> {vaccination.notes}
          </div>
        )}

        {status !== "completed" && (
          <div className={`alert ${status === "upcoming" ? "upcoming" : ""}`}>
            <FaClock className="text-muted mr-1" size={16} />
            {alertMessage}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {!isCompleted && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isCompleting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaCheck size={14} />
              {isCompleting ? 'Marking...' : 'Mark Completed'}
            </button>
          )}
          <button
            onClick={handleAddVaccine}
            disabled={isCompleted}
            className={`flex-1 px-4 py-2 rounded transition-colors ${
              isCompleted 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title={isCompleted ? 'Cannot add vaccine - vaccination is completed' : 'Add vaccine for this animal'}
          >
            Add Vaccine
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Mark as Completed
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark this vaccination as completed?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
              >
                No
              </button>
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VaccinationCard;