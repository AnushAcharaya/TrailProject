// src/pages/vaccination/AddVaccinationPage.jsx
import AddVaccinationForm from "../../components/vaccination/AddVaccinationForm";
import "../../styles/vaccination.css";

const AddVaccinationPage = () => {
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

      <AddVaccinationForm />
    </div>
  );
};

export default AddVaccinationPage;
