// src/pages/EditLivestockPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LivestockForm from "../../components/livestockCrud/LivestockForm";
import { getLivestockById, updateLivestock } from "../../services/livestockCrudApi";

const EditLivestockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [livestockData, setLivestockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load data from API
  useEffect(() => {
    fetchLivestock();
  }, [id]);

  const fetchLivestock = async () => {
    setLoading(true);
    const result = await getLivestockById(id);
    
    if (result.success) {
      setLivestockData(result.data);
    } else {
      setError(result.error?.message || "Failed to load livestock");
    }
    setLoading(false);
  };

  const handleUpdate = async (updatedData) => {
    setSubmitting(true);
    const result = await updateLivestock(id, updatedData);
    
    if (result.success) {
      navigate("/livestock");
    } else {
      alert(result.error?.message || "Failed to update livestock. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container text-center py-10">
        <p className="text-gray-600">Loading livestock data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-page-container text-center py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded inline-block">
          {error}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate("/livestock")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!livestockData) {
    return (
      <div className="form-page-container text-center py-10">
        <p className="text-gray-600">Livestock not found</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="max-w-4xl mx-auto p-6">
        {submitting && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            Updating livestock...
          </div>
        )}
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