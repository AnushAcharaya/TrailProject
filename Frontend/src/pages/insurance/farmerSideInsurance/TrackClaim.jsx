import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import TrackClaim from '../../../components/insurance/farmerSideInsurance/trackClaim/TrackClaim';
import '../../../styles/farmerSideInsurance/trackClaim.css';

const TrackClaimPage = () => {
  return (
    <FarmerLayout pageTitle="Track Claims">
      <div className="track-claim-page">
        <div className="page-header">
          <h1 className="page-title">Track Claims</h1>
        </div>
        <TrackClaim />
      </div>
    </FarmerLayout>
  );
};

export default TrackClaimPage;
