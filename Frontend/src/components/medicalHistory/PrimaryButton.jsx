// src/components/medicalHistory/PrimaryButton.jsx
import "./../../styles/medicalHistory.css";

const PrimaryButton = ({ children, onClick, type = "button" }) => {
  return (
    <button
      type={type}
      className="btn-primary"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;