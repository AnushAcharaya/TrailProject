import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/appointments/SearchBar";
import StatCards from "../../components/appointments/StatCards";
import FarmerAppointmentTable from "../../components/appointments/FarmerAppointmentTable";
import "../../styles/appointments.css";

const FarmerAppointments = () => {
  const navigate = useNavigate();

  return (
    <div className="app-page">
      <SearchBar placeholder="Search appointments..." />

      <div className="flex justify-between items-center mb-6">
        <h1 className="app-title">Welcome back, John!</h1>
        <button 
          className="btn-primary"
          onClick={() => navigate('/appointments/request')}
        >
          + Request Appointment
        </button>
      </div>

      <StatCards />
      <FarmerAppointmentTable />
    </div>
  );
};

export default FarmerAppointments;
