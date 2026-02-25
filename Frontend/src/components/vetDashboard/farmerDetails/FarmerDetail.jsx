import { useNavigate } from 'react-router-dom';
import VetLayout from '../VetLayout';
import ProfileHeader from './ProfileHeader';
import AnimalSection from './AnimalSection';

function FarmerDetail() {
  const navigate = useNavigate();

  return (
    <VetLayout pageTitle="Animals">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button 
            onClick={() => navigate('/vet/farmer-profiles')}
            className="hover:text-emerald-600 transition-colors"
          >
            Farmer Profiles
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Animals</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <ProfileHeader />
          <AnimalSection />
        </div>
      </div>
    </VetLayout>
  );
}

export default FarmerDetail;
