// src/components/vaccination/VaccinationCard.jsx
import { FaSyringe, FaCalendar, FaClock, FaExclamationTriangle } from "react-icons/fa";
import "./../../styles/vaccination.css";

const VaccinationCard = ({ vaccination }) => {
  const today = new Date();
  const dueDate = new Date(vaccination.nextDueDate);
  const givenDate = new Date(vaccination.dateGiven);

  let status = "upcoming";
  let alertMessage = "";
  let daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    status = "overdue";
    alertMessage = `Overdue by ${Math.abs(daysDiff)} days - Immediate attention required`;
  } else if (daysDiff === 0) {
    alertMessage = "Due today - Schedule appointment";
  } else {
    alertMessage = `Due in ${daysDiff} days - Schedule vaccination appointment`;
  }

  return (
    <div className={`vaccination-card ${status}`}>
      <div className="header">
        <div>
          <div className="name">{vaccination.vaccineName}</div>
          <div className="type">{vaccination.vaccineType}</div>
        </div>
        <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
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

      {status !== "completed" && (
        <div className={`alert ${status === "upcoming" ? "upcoming" : ""}`}>
          <FaClock className="text-muted mr-1" size={16} />
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default VaccinationCard;