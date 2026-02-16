// src/pages/AddLivestockPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LivestockForm from "../../components/livestockCrud/LivestockForm";
import { createLivestock } from "../../services/livestockCrudApi";

const AddLivestockPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (formData) => {
    setSubmitting(true);
    const result = await createLivestock(formData);
    
    if (result.success) {
      navigate("/livestock");
    } else {
      alert(result.error?.message || "Failed to add livestock. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="max-w-4xl mx-auto p-6">
        {submitting && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            Saving livestock...
          </div>
        )}
        <LivestockForm onSubmit={handleAdd} isEditing={false} />
      </div>
    </div>
  );
};

export default AddLivestockPage;