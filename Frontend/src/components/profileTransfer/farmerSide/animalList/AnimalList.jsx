// components/profileTransfer/farmerSide/animalList/AnimalList.jsx
import { useState } from 'react';
import { FaFilter, FaChevronDown } from 'react-icons/fa';
import AnimalCard from './AnimalCard';
import TransferModal from './TransferModal';
import SearchBar from './SearchBar';

const animals = [
  { id: 1, name: 'Bella', tag: 'TG-001', breed: 'Cow - Holstein', age: '3 years', owner: 'John Maargi', image: '/api/placeholder/400/300', type: 'cow', status: 'Healthy' },
  { id: 2, name: 'Rocky', tag: 'TG-002', breed: 'Goat - Boer', age: '2 years', owner: 'John Maargi', image: '/api/placeholder/400/300', type: 'goat', status: 'Vaccinated' },
  { id: 3, name: 'Dolly', tag: 'TG-003', breed: 'Sheep - Merino', age: '1.5 years', owner: 'John Maargi', image: '/api/placeholder/400/300', type: 'sheep', status: 'Healthy' },
  { id: 4, name: 'Rose', tag: 'TG-004', breed: 'Cow - Jersey', age: '4 years', owner: 'John Maargi', image: '/api/placeholder/400/300', type: 'cow', status: 'Under Treatment' },
  { id: 5, name: 'Clucky', tag: 'TG-005', breed: 'Chicken - Rhode Island', age: '1 year', owner: 'John Maargi', image: '/api/placeholder/400/300', type: 'chicken', status: 'Healthy' },
  { id: 6, name: 'Babe', tag: 'TG-006', breed: 'Pig - Large White', age: '2 years', owner: 'John Maargi', image: '/api/placeholder/400/300', type: 'pig', status: 'Sick' }
];

export default function AnimalList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All Species');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Header - Smaller height */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Animals</h1>
          <p className="text-sm text-gray-600">Manage your livestock and initiate ownership transfers</p>
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
          {filteredAnimals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No animals found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {isTransferOpen && selectedAnimal && (
        <TransferModal 
          animal={selectedAnimal}
          onClose={() => setIsTransferOpen(false)}
        />
      )}
    </div>
  );
}
