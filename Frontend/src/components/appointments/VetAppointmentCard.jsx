import React from "react";
import { FiUser, FiCalendar, FiFileText } from "react-icons/fi";
import { MdPets } from "react-icons/md";
import "../../styles/appointments.css";

const VetAppointmentCard = ({ status }) => {
  return (
    <div className="app-card">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">John Doe</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MdPets size={16} />
              <span>Cattle</span>
              <span>·</span>
              <FiCalendar size={14} />
              <span>Requested 6/1/2024</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 app-note">
          <FiFileText className="text-gray-500 mt-0.5" size={16} />
          <p className="text-sm text-gray-700">
            Routine checkup and vaccination for herd.
          </p>
        </div>
      </div>

      <div className="text-right">
        <span
          className={`badge ${
            status === "Approved"
              ? "badge-green"
              : status === "Pending"
              ? "badge-yellow"
              : "badge-blue"
          }`}
        >
          {status}
        </span>

        <div className="mt-4 flex flex-col gap-2">
          {status === "Pending" && (
            <>
              <button className="btn-primary">Approve</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">
                Decline
              </button>
            </>
          )}

          {status === "Approved" && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
              Complete Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VetAppointmentCard;
