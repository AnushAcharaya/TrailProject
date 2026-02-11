import VetInsuranceNav from '../../../components/insurance/vetsideInsurance/VetInsuranceNav';
import VerifyClaim from '../../../components/insurance/vetsideInsurance/verifyClaim/VerifyClaim';
import '../../../styles/vetSideInsurance/verifyClaim.css';

const VerifyClaimPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50">
      <VetInsuranceNav />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-8 bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent">
          Verify Claim
        </h1>
        <VerifyClaim />
      </div>
    </div>
  );
};

export default VerifyClaimPage;
