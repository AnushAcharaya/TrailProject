import { useTranslation } from 'react-i18next';
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import TrackClaim from '../../../components/insurance/farmerSideInsurance/trackClaim/TrackClaim';
import '../../../styles/farmerSideInsurance/trackClaim.css';

const TrackClaimPage = () => {
  const { t } = useTranslation('insurance');
  
  return (
    <FarmerLayout pageTitle={t('trackClaim.title')}>
      <div className="track-claim-page">
        <div className="page-header">
          <h1 className="page-title">{t('trackClaim.title')}</h1>
        </div>
        <TrackClaim />
      </div>
    </FarmerLayout>
  );
};

export default TrackClaimPage;
