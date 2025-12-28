// src/pages/EditLivestockPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LivestockForm from "../../components/livestockCrud/LivestockForm";

const EditLivestockPage = () => {
  const { id } = useParams(); // id = array index as string
  const navigate = useNavigate();
  const index = parseInt(id, 10);

  const [livestockData, setLivestockData] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("livestockData")) || [];
    if (index >= 0 && index < data.length) {
      setLivestockData(data[index]);
    } else {
      navigate("/livestock"); // Invalid index
    }
  }, [id, navigate]);

  const handleUpdate = (updatedData) => {
    // Create a copy without the large image File object
    const dataToSave = {
      ...updatedData,
      image: updatedData.image ? updatedData.image.name : null,
    };

    try {
      const allData = JSON.parse(localStorage.getItem("livestockData")) || [];
      allData[index] = dataToSave;
      localStorage.setItem("livestockData", JSON.stringify(allData));
      navigate("/livestock"); // Go back to list
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Error saving data. localStorage might be full.");
    }
  };

  if (!livestockData) {
    return <div className="form-page-container text-center py-10">Loading...</div>;
  }

  return (
    <div className="form-page-container">
      <div className="max-w-4xl mx-auto p-6">
        <LivestockForm
          initialData={livestockData}
          onSubmit={handleUpdate}
          isEditing={true}
        />
      </div>
    </div>
  );
};

export default EditLivestockPage;