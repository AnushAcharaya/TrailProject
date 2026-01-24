// src/pages/vaccination/AddVaccinationPage.jsx
import { useNavigate } from "react-router-dom";
import AddVaccinationForm from "../../components/vaccination/AddVaccinationForm";
import "../../styles/vaccination.css";

const AddVaccinationPage = () => {
  const navigate = useNavigate();

  const handleSave = (data) => {
    const existing = JSON.parse(localStorage.getItem("vaccinations")) || [];
    const newVaccination = {
      ...data,
      id: Date.now().toString()
    };
    localStorage.setItem("vaccinations", JSON.stringify([...existing, newVaccination]));
    navigate("/vaccination");
  };

  return (
    <div className="vaccination-bg min-h-screen px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Add Vaccination Record
        </h1>
        <p className="text-sm text-gray-500">
          Record vaccination details for your livestock
        </p>
      </div>

      <AddVaccinationForm onSubmit={handleSave} />
    </div>
  );
};

export default AddVaccinationPage;
