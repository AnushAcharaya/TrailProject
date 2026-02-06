import React from "react";
import "../../styles/appointments.css";

const FarmerAppointmentTable = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="app-table">
        <thead>
          <tr>
            <th>Veterinarian</th>
            <th>Animal</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t">
            <td>Dr. Sarah Miller</td>
            <td>Cattle</td>
            <td>2024-06-15 · 09:00 AM</td>
            <td>
              <span className="badge badge-green">Approved</span>
            </td>
            <td className="text-right text-green-600 cursor-pointer">
              Details
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FarmerAppointmentTable;
