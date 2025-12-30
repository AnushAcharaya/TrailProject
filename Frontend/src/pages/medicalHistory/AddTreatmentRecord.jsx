// src/pages/medicalHistory/AddTreatmentRecord.jsx
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/medicalHistory/PageHeader";
import TreatmentForm from "../../components/medicalHistory/TreatmentForm";
import "../../styles/medicalHistory.css";

const AddTreatmentRecord = () => {
  const navigate = useNavigate();

  const handleSave = (data) => {
    const existing = JSON.parse(localStorage.getItem("treatments")) || [];
    // Add unique ID to new treatment
    const newTreatment = {
      ...data,
      id: Date.now().toString() // Unique ID based on timestamp
    };
    localStorage.setItem("treatments", JSON.stringify([...existing, newTreatment]));
    navigate("/medical/history");
  };

  return (
    <div className="bg-app-bg min-h-screen p-6">
      <PageHeader
        title="Add Treatment Record"
        subtitle="Record medical treatments for your livestock"
      />

      <TreatmentForm onSubmit={handleSave} />
    </div>
  );
};

export default AddTreatmentRecord;