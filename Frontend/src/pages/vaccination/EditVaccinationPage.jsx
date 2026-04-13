// src/pages/vaccination/EditVaccinationPage.jsx
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditVaccinationForm from "../../components/vaccination/EditVaccinationForm";
import "../../styles/vaccination.css";

const EditVaccinationPage = () => {
  const { t } = useTranslation('vaccination');
  const { id } = useParams();

  return (
    <div className="vaccination-bg min-h-screen px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t('addForm.updateTitle')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('addForm.updateSubtitle')}
        </p>
      </div>

      <EditVaccinationForm vaccinationId={id} />
    </div>
  );
};

export default EditVaccinationPage;
