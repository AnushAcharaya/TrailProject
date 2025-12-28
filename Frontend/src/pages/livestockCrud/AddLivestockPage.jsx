// src/pages/AddLivestockPage.jsx
import { useNavigate } from "react-router-dom";
import LivestockForm from "../../components/livestockCrud/LivestockForm";

const AddLivestockPage = () => {
  const navigate = useNavigate();

  const handleAdd = (formData) => {
    // Create a copy without the large image File object
    const dataToSave = {
      ...formData,
      image: formData.image ? formData.image.name : null,
    };

    try {
      const existing = localStorage.getItem("livestockData");
      const livestockArray = existing ? JSON.parse(existing) : [];
      localStorage.setItem("livestockData", JSON.stringify([...livestockArray, dataToSave]));
      navigate("/livestock");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Error saving data. localStorage might be full. Try without uploading an image.");
    }
  };

  return (
    <div className="form-page-container">
      <div className="max-w-4xl mx-auto p-6">
        <LivestockForm onSubmit={handleAdd} isEditing={false} />
      </div>
    </div>
  );
};

export default AddLivestockPage;