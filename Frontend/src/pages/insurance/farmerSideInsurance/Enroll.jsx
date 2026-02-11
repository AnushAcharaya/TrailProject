import FarmerInsuranceNav from '../../../components/insurance/farmerSideInsurance/FarmerInsuranceNav';
import Enroll from '../../../components/insurance/farmerSideInsurance/enroll/Enroll';
import '../../../styles/farmerSideInsurance/enroll.css';

const EnrollPage = () => {
  return (
    <div className="enroll-page">
      <FarmerInsuranceNav />
      <div className="page-header">
        <h1 className="page-title">Enroll Livestock</h1>
        <p className="page-subtitle">Follow the steps to insure your livestock.</p>
      </div>
      <Enroll />
    </div>
  );
};

export default EnrollPage;
