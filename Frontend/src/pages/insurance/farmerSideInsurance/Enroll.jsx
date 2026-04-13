import { useTranslation } from 'react-i18next';
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import Enroll from '../../../components/insurance/farmerSideInsurance/enroll/Enroll';
import '../../../styles/farmerSideInsurance/enroll.css';

const EnrollPage = () => {
  const { t } = useTranslation('insurance');

  return (
    <FarmerLayout pageTitle={t('nav.enroll')}>
      <div className="enroll-page">
        <Enroll />
      </div>
    </FarmerLayout>
  );
};

export default EnrollPage;
