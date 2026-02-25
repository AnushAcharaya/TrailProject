import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import VetLayout from '../../../components/vetDashboard/VetLayout';
import VerifyClaim from '../../../components/insurance/vetsideInsurance/verifyClaim/VerifyClaim';
import '../../../styles/vetSideInsurance/verifyClaim.css';

const VerifyClaimPage = () => {
  const navigate = useNavigate();

  return (
    <VetLayout pageTitle="Verify Claim">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button 
            onClick={() => navigate('/vetinsurancereviewdashboard')}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Insurance Dashboard
          </button>
          <FaChevronRight className="text-gray-400 text-xs" />
          <span className="text-gray-600">Verify Claim</span>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-8 bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 bg-clip-text text-transparent">
          Verify Claim
        </h1>
        <VerifyClaim />
      </div>
    </VetLayout>
  );
};

export default VerifyClaimPage;
