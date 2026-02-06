import React from "react";
import SearchBar from "../../components/appointments/SearchBar";
import VetAppointmentCard from "../../components/appointments/VetAppointmentCard";
import "../../styles/appointments.css";

const VetAppointments = () => {
  return (
    <div className="app-page">
      <SearchBar placeholder="Search patients or animals..." />

      <h1 className="app-title mb-6">
        Appointment Management
      </h1>

      <VetAppointmentCard status="Approved" />
      <VetAppointmentCard status="Pending" />
      <VetAppointmentCard status="Completed" />
    </div>
  );
};

export default VetAppointments;
