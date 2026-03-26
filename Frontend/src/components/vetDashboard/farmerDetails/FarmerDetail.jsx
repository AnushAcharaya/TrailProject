import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetLayout from '../VetLayout';
import ProfileHeader from './ProfileHeader';
import AnimalSection from './AnimalSection';
import { getFarmerProfile } from '../../../services/profileApi';
import { getLivestockByFarmer } from '../../../services/livestockCrudApi';

function FarmerDetail() {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    const farmerUsername = localStorage.getItem('selectedFarmerUsername');
    
    if (!farmerUsername) {
      alert('No farmer selected');
      navigate('/vet/farmer-profiles');
      return;
    }

    setIsLoading(true);

    // Fetch farmer profile
    const profileResult = await getFarmerProfile(farmerUsername);
    if (profileResult.success) {
      setFarmer(profileResult.data);
    } else {
      console.error('Failed to load farmer profile:', profileResult.error);
    }

    // Fetch farmer's animals
    const animalsResult = await getLivestockByFarmer(farmerUsername);
    if (animalsResult.success) {
      setAnimals(animalsResult.data.results || animalsResult.data);
    } else {
      console.error('Failed to load animals:', animalsResult.error);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <VetLayout pageTitle="Animals">
        <div className="p-8 text-center text-gray-600">
          Loading farmer details...
        </div>
      </VetLayout>
    );
  }

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
          <ProfileHeader farmer={farmer} />
          <AnimalSection animals={animals} />
        </div>
      </div>
    </VetLayout>
  );
}

export default FarmerDetail;
