import LivestockProfile from './LivestockProfile';
import VaccinationHistory from './VaccinationHistory';
import MedicalHistory from './MedicalHistory';
import ClaimDetails from './ClaimDetails';
import VerificationDecision from './VerificationDecision';

const VerifyClaim = () => {
  return (
    <div className="space-y-6">
      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LivestockProfile />
        <VaccinationHistory />
        <MedicalHistory />
      </div>
      
      {/* Bottom Row - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClaimDetails />
        <VerificationDecision />
      </div>
    </div>
  );
};

export default VerifyClaim;
