// src/pages/EditLivestockPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LivestockForm from "../../components/livestockCrud/LivestockForm";
import { getLivestockById, updateLivestock } from "../../services/livestockCrudApi";

const EditLivestockPage = () => {
  const { t } = useTranslation('livestock');
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
      setError(result.error?.message || t('form.notifications.loadError'));
    }
    setLoading(false);
  };

  const handleUpdate = async (updatedData) => {
    setSubmitting(true);
    const result = await updateLivestock(id, updatedData);
    
    if (result.success) {
      navigate("/livestock");
    } else {
      alert(result.error?.message || t('form.notifications.updateError'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container text-center py-10">
        <p className="text-gray-600">{t('form.messages.loadingData')}</p>
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
            {t('form.messages.backToList')}
          </button>
        </div>
      </div>
    );
  }

  if (!livestockData) {
    return (
      <div className="form-page-container text-center py-10">
        <p className="text-gray-600">{t('form.messages.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="max-w-4xl mx-auto p-6">
        {submitting && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            {t('form.messages.updating')}
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