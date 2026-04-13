// components/profileTransfer/farmerSide/animalList/AnimalList.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilter, FaChevronDown } from 'react-icons/fa';
import AnimalCard from './AnimalCard';
import TransferModal from './TransferModal';
import SearchBar from './SearchBar';
import { getAllLivestock, getAllSpecies } from '../../../../services/livestockCrudApi';

export default function AnimalList() {
  const { t } = useTranslation('profileTransfer');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All Species');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speciesList, setSpeciesList] = useState([]);

  // Fetch livestock data on component mount
  useEffect(() => {
    fetchLivestock();
    fetchSpecies();
  }, []);

  const fetchLivestock = async () => {
    try {
      setLoading(true);
      const result = await getAllLivestock();
      
      if (result.success) {
        // Handle paginated response
        const livestockData = result.data.results || result.data;
        
        // Transform API data to match component format
        const transformedAnimals = livestockData.map(animal => ({
          id: animal.id,
          name: animal.species_name, // Using species name as animal name
          tag: animal.tag_id,
          breed: `${animal.species_name} - ${animal.breed_name}`,
          age: animal.age ? `${animal.age} ${animal.age === 1 ? 'year' : 'years'}` : 'Unknown',
          owner: animal.user_name,
          image: animal.image_preview || '/api/placeholder/400/300',
          type: animal.species_name.toLowerCase(),
          status: animal.health_status,
          // Keep original data for transfer
          originalData: animal
        }));
        
        setAnimals(transformedAnimals);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to fetch livestock');
      }
    } catch (err) {
      console.error('Error fetching livestock:', err);
      setError('Failed to fetch livestock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecies = async () => {
    try {
      const result = await getAllSpecies();
      if (result.success) {
        setSpeciesList(result.data);
      }
    } catch (err) {
      console.error('Error fetching species:', err);
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === 'All Species' || 
                          animal.type.toLowerCase() === selectedSpecies.toLowerCase();
    return matchesSearch && matchesSpecies;
  });

  const handleTransferClick = (animal) => {
    setSelectedAnimal(animal);
    setIsTransferOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('animalList.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchLivestock}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            {t('animalList.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Header - Smaller height */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('animalList.title')}</h1>
          <p className="text-sm text-gray-600">{t('animalList.subtitle')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
            <div className="relative">
              <button 
                onClick={() => setSelectedSpecies(selectedSpecies === 'All Species' ? 'Cow' : 'All Species')}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all"
              >
                <FaFilter className="text-emerald-600" />
                <span className="text-gray-700 font-medium">{selectedSpecies}</span>
                <FaChevronDown className="text-gray-500 text-sm ml-1" />
              </button>
            </div>
          </div>
          
          {/* Animal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map(animal => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                onTransferClick={handleTransferClick} 
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAnimals.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {animals.length === 0 
                  ? t('animalList.noAnimals')
                  : t('animalList.noResults')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {isTransferOpen && selectedAnimal && (
        <TransferModal 
          animal={selectedAnimal}
          onClose={() => setIsTransferOpen(false)}
          onTransferSuccess={fetchLivestock}
        />
      )}
    </div>
  );
}
