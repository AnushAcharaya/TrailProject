import { useTranslation } from 'react-i18next';
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import SubmitClaim from '../../../components/insurance/farmerSideInsurance/submitClaim/SubmitClaim';
import '../../../styles/farmerSideInsurance/submitClaim.css';

const SubmitClaimPage = () => {
  const { t } = useTranslation('insurance');

  return (
    <FarmerLayout pageTitle={t('submitClaim.title')}>
      <div className="submit-claim-page">
        <div className="page-header">
          <h1 className="page-title">{t('submitClaim.title')}</h1>
          <p className="page-subtitle">{t('submitClaim.subtitle')}</p>
        </div>
        <SubmitClaim />
      </div>
    </FarmerLayout>
  );
};

export default SubmitClaimPage;
