import FarmerInsuranceNav from '../../../components/insurance/farmerSideInsurance/FarmerInsuranceNav';
import TrackClaim from '../../../components/insurance/farmerSideInsurance/trackClaim/TrackClaim';
import '../../../styles/farmerSideInsurance/trackClaim.css';

const TrackClaimPage = () => {
  return (
    <div className="track-claim-page">
      <FarmerInsuranceNav />
      <div className="page-header">
        <h1 className="page-title">Track Claims</h1>
      </div>
      <TrackClaim />
    </div>
  );
};

export default TrackClaimPage;
