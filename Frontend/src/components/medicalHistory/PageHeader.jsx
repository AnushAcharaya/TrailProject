// src/components/medicalHistory/PageHeader.jsx
import "./../../styles/medicalHistory.css";

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="page-header text-center">
      <h1 className="text-center">{title}</h1>
    </div>
  );
};

export default PageHeader;