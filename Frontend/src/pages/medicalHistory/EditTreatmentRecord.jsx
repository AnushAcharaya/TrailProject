// src/pages/medicalHistory/EditTreatmentRecord.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import PageHeader from "../../components/medicalHistory/PageHeader";
import TreatmentForm from "../../components/medicalHistory/TreatmentForm";
import { getTreatmentById, updateTreatment } from "../../services/medicalApi";
import "../../styles/medicalHistory.css";

const EditTreatmentRecord = () => {
  const { t } = useTranslation('medical');
  const navigate = useNavigate();
  const location = useLocation();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if user is a farmer or vet
  const isFarmer = location.state?.from === 'farmer' || 
                   localStorage.getItem('userRole') === 'farmer' ||
                   document.referrer.includes('/farmerpage');

  useEffect(() => {
    const loadTreatment = async () => {
      const id = localStorage.getItem("editTreatmentId");
      if (!id) {
        navigate("/medical/history");
        return;
      }

      console.log('[EditTreatmentRecord] Loading treatment ID:', id);
      const result = await getTreatmentById(id);
      if (result.success) {
        const treatment = result.data;
        console.log('[EditTreatmentRecord] Full treatment data:', treatment);
        console.log('[EditTreatmentRecord] treatment.medicines:', treatment.medicines);
        console.log('[EditTreatmentRecord] medicines is array?', Array.isArray(treatment.medicines));
        console.log('[EditTreatmentRecord] medicines length:', treatment.medicines?.length);
        
        // Convert backend snake_case to frontend camelCase for form
        const medicines = treatment.medicines && treatment.medicines.length > 0
          ? treatment.medicines.map(med => {
              console.log('[EditTreatmentRecord] Converting medicine:', med);
              // Convert start_time from "HH:MM:SS" to "HH:MM" for HTML time input
              const startTime = med.start_time ? med.start_time.substring(0, 5) : "08:00";
              return {
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                scheduleType: med.schedule_type,
                startTime: startTime,
                intervalHours: med.interval_hours,
                exactTimes: med.exact_times || []
              };
            })
          : [
              // Default medicine object if none exist
              {
                name: "",
                dosage: "",
                frequency: 1,
                duration: 3,
                scheduleType: "interval",
                startTime: "08:00",
                intervalHours: 5,
                exactTimes: ["08:00", "13:00", "18:00"],
              }
            ];

        console.log('[EditTreatmentRecord] Converted medicines for form:', medicines);

        setInitialData({
          livestockTag: treatment.livestock?.tag_id || "",
          treatmentName: treatment.treatment_name || "",
          diagnosis: treatment.diagnosis || "",
          vetName: treatment.vet_name || "",
          treatmentDate: treatment.treatment_date || "",
          nextTreatmentDate: treatment.next_treatment_date || "",
          status: treatment.status || "In Progress",
          medicines: medicines
        });
      } else {
        console.error("Failed to load treatment:", result.error);
        alert("Failed to load treatment data");
        navigate("/medical/history");
      }
      setIsLoading(false);
    };

    loadTreatment();
  }, [navigate]);

  const handleUpdate = async (formData) => {
    const id = localStorage.getItem("editTreatmentId");
    if (!id) {
      alert("Treatment ID not found");
      return;
    }

    const result = await updateTreatment(id, formData);
    
    if (result.success) {
      localStorage.removeItem("editTreatmentId");
      navigate("/medical/history", { state: { from: isFarmer ? 'farmer' : 'vet' } });
    } else {
      console.error("Failed to update treatment:", result.error);
      alert("Failed to update treatment: " + (result.error?.detail || JSON.stringify(result.error)));
    }
  };

  // Choose the appropriate layout
  const Layout = isFarmer ? FarmerLayout : VetLayout;

  // Breadcrumbs based on user type
  const breadcrumbs = isFarmer ? (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button 
        onClick={() => navigate('/farmerpage')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.dashboard')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <button 
        onClick={() => navigate('/medical/history', { state: { from: 'farmer' } })}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.medicalHistory')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">{t('breadcrumbs.editTreatment')}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button 
        onClick={() => navigate('/vet/farmer-profiles')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.farmerProfiles')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <button 
        onClick={() => navigate('/vet/farmer-details')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.animals')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <button 
        onClick={() => navigate('/medical/history', { state: { from: 'vet' } })}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.medicalHistory')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">{t('breadcrumbs.editTreatment')}</span>
    </div>
  );

  if (isLoading) {
    return (
      <Layout pageTitle="Edit Treatment">
        <div className="bg-gray-50 min-h-screen p-6">
          <div className="text-center py-8 text-gray-600">
            {t('page.loadingData')}
          </div>
        </div>
      </Layout>
    );
  }

  if (!initialData) {
    return (
      <Layout pageTitle="Edit Treatment">
        <div className="bg-gray-50 min-h-screen p-6">
          <div className="text-center py-8 text-red-600">
            {t('page.notFound')}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Treatment">
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Breadcrumbs */}
        {breadcrumbs}

        <div className="max-w-3xl mx-auto">
          <PageHeader
            title={t('page.editTitle')}
            subtitle={t('page.editSubtitle')}
          />

          <TreatmentForm initialData={initialData} onSubmit={handleUpdate} isEdit={true} />
        </div>
      </div>
    </Layout>
  );
};

export default EditTreatmentRecord;
