// src/pages/medicalHistory/AddTreatmentRecord.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import PageHeader from "../../components/medicalHistory/PageHeader";
import TreatmentForm from "../../components/medicalHistory/TreatmentForm";
import { createTreatment } from "../../services/medicalApi";
import "../../styles/medicalHistory.css";

const AddTreatmentRecord = () => {
  const { t } = useTranslation('medical');
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if user is a farmer or vet
  const isFarmer = location.state?.from === 'farmer' || 
                   localStorage.getItem('userRole') === 'farmer' ||
                   document.referrer.includes('/farmerpage');

  const handleSave = async (data) => {
    setIsSubmitting(true);
    const result = await createTreatment(data);
    setIsSubmitting(false);
    
    if (result.success) {
      // Check if coming from vet dashboard
      const isFromVet = location.state?.from === 'vet';
      if (isFromVet) {
        // Navigate back to vet's farmer details page (animals page)
        navigate("/vet/farmer-details");
      } else {
        // Navigate back to farmer's medical history page
        navigate("/medical/history", { state: { from: 'farmer' } });
      }
    } else {
      alert("Failed to save treatment: " + (result.error?.detail || JSON.stringify(result.error)));
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
      <span className="text-gray-600">{t('breadcrumbs.addTreatment')}</span>
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
      <span className="text-gray-600">{t('breadcrumbs.addTreatment')}</span>
    </div>
  );

  return (
    <Layout pageTitle="Add Treatment">
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Breadcrumbs */}
        {breadcrumbs}

        <div className="max-w-3xl mx-auto">
          <PageHeader
            title={t('page.addTitle')}
            subtitle={t('page.addSubtitle')}
          />

          {isSubmitting && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
              {t('page.savingTreatment')}
            </div>
          )}

          <TreatmentForm onSubmit={handleSave} />
        </div>
      </div>
    </Layout>
  );
};

export default AddTreatmentRecord;
