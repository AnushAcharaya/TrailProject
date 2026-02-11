import FarmerInsuranceNav from '../../../components/insurance/farmerSideInsurance/FarmerInsuranceNav';
import SubmitClaim from '../../../components/insurance/farmerSideInsurance/submitClaim/SubmitClaim';
import '../../../styles/farmerSideInsurance/submitClaim.css';

const SubmitClaimPage = () => {
  return (
    <div className="submit-claim-page">
      <FarmerInsuranceNav />
      <div className="page-header">
        <h1 className="page-title">Submit Claim</h1>
        <p className="page-subtitle">Complete the form to submit your insurance claim</p>
      </div>
      <SubmitClaim />
    </div>
  );
};

export default SubmitClaimPage;
