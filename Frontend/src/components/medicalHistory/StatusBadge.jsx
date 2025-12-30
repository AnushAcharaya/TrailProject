// src/components/medicalHistory/StatusBadge.jsx
import "./../../styles/medicalHistory.css";

const StatusBadge = ({ status }) => {
  let className = "status-badge ";
  if (status.toLowerCase().includes("completed")) className += "completed";
  else if (status.toLowerCase().includes("ongoing")) className += "ongoing";
  else if (status.toLowerCase().includes("overdue")) className += "overdue";
  else className += "completed";

  return <span className={className}>{status}</span>;
};

export default StatusBadge;