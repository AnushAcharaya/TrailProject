import VetInsuranceNav from '../../../components/insurance/vetsideInsurance/VetInsuranceNav';
import ReviewDashboard from '../../../components/insurance/vetsideInsurance/reviewDashboard/ReviewDashboard';

const ReviewDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <VetInsuranceNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claim Review Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and verify farmer insurance claims</p>
        </div>
        <ReviewDashboard />
      </div>
    </div>
  );
};

export default ReviewDashboardPage;
