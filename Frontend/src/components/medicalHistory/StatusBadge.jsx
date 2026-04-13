// src/components/medicalHistory/StatusBadge.jsx
import { useTranslation } from 'react-i18next';
import "./../../styles/medicalHistory.css";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation('medical');
  
  let className = "status-badge ";
  if (status.toLowerCase().includes("completed")) className += "completed";
  else if (status.toLowerCase().includes("ongoing")) className += "ongoing";
  else if (status.toLowerCase().includes("overdue")) className += "overdue";
  else className += "completed";

  // Translate status text
  let statusText = status;
  if (status.toLowerCase().includes("completed")) {
    statusText = t('card.status.completed');
  } else if (status.toLowerCase().includes("progress")) {
    statusText = t('card.status.inProgress');
  }

  return <span className={className}>{statusText}</span>;
};

export default StatusBadge;