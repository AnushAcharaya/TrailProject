// src/components/medicalHistory/PageHeader.jsx
import "./../../styles/medicalHistory.css";

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
    </div>
  );
};

export default PageHeader;