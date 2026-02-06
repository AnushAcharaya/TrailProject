import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import AppointmentRequestForm from "../../components/appointments/AppointmentRequestForm";
import "../../styles/appointments.css";

const RequestAppointmentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-page">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <FiArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Request Veterinary Appointment
        </h1>
        <p className="text-gray-500">
          Fill in the details below to schedule a visit
        </p>
      </div>

      {/* Form */}
      <AppointmentRequestForm />
    </div>
  );
};

export default RequestAppointmentPage;
