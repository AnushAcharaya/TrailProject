import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import SubmitClaim from '../../../components/insurance/farmerSideInsurance/submitClaim/SubmitClaim';
import '../../../styles/farmerSideInsurance/submitClaim.css';

const SubmitClaimPage = () => {
  return (
    <FarmerLayout pageTitle="Submit Claim">
      <div className="submit-claim-page">
        <div className="page-header">
          <h1 className="page-title">Submit Claim</h1>
          <p className="page-subtitle">Complete the form to submit your insurance claim</p>
        </div>
        <SubmitClaim />
      </div>
    </FarmerLayout>
  );
};

export default SubmitClaimPage;
