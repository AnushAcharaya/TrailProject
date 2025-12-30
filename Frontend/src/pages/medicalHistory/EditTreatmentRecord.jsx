// src/pages/medicalHistory/EditTreatmentRecord.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageHeader from "../../components/medicalHistory/PageHeader";
import TreatmentForm from "../../components/medicalHistory/TreatmentForm";
import "../../styles/medicalHistory.css";

const EditTreatmentRecord = () => {
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("editTreatmentId");
    if (id) {
      const treatments = JSON.parse(localStorage.getItem("treatments")) || [];
      const treatment = treatments.find(t => t.id === id);
      if (treatment) {
        setInitialData(treatment);
      } else {
        navigate("/medical/history");
      }
    } else {
      navigate("/medical/history");
    }
  }, [navigate]);

  const handleUpdate = (data) => {
    const id = localStorage.getItem("editTreatmentId");
    const treatments = JSON.parse(localStorage.getItem("treatments")) || [];
    const index = treatments.findIndex(t => t.id === id);
    
    if (index !== -1) {
      // Keep the same ID when updating
      treatments[index] = { ...data, id: id };
      localStorage.setItem("treatments", JSON.stringify(treatments));
    }
    
    localStorage.removeItem("editTreatmentId");
    navigate("/medical/history");
  };

  if (!initialData) {
    return <div className="bg-app-bg min-h-screen p-6">Loading...</div>;
  }

  return (
    <div className="bg-app-bg min-h-screen p-6">
      <PageHeader
        title="Edit Treatment Record"
        subtitle="Update medical treatment information"
      />

      <TreatmentForm initialData={initialData} onSubmit={handleUpdate} isEdit={true} />
    </div>
  );
};

export default EditTreatmentRecord;
