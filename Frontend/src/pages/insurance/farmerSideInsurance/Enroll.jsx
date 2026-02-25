import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import Enroll from '../../../components/insurance/farmerSideInsurance/enroll/Enroll';
import '../../../styles/farmerSideInsurance/enroll.css';

const EnrollPage = () => {
  return (
    <FarmerLayout pageTitle="Enroll Livestock">
      <div className="enroll-page">
        <div className="page-header">
          <h1 className="page-title">Enroll Livestock</h1>
          <p className="page-subtitle">Follow the steps to insure your livestock.</p>
        </div>
        <Enroll />
      </div>
    </FarmerLayout>
  );
};

export default EnrollPage;
