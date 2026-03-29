import React, { useState, useEffect } from 'react';
import FarmerLayout from '../../components/farmerDashboard/FarmerLayout';
import AnimalReportCard from '../../components/reports/AnimalReportCard';
import ViewRecordsModal from '../../components/reports/ViewRecordsModal';
import { getAllLivestock } from '../../services/livestockCrudApi';
import '../../styles/reports.css';

const ReportsPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [modalType, setModalType] = useState(null); // 'treatment' or 'vaccination'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await getAllLivestock();
      setAnimals(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTreatment = (animal) => {
    setSelectedAnimal(animal);
    setModalType('treatment');
  };

  const handleViewVaccination = (animal) => {
    setSelectedAnimal(animal);
    setModalType('vaccination');
  };

  const handleCloseModal = () => {
    setSelectedAnimal(null);
    setModalType(null);
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tag_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.species_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = filterSpecies === 'all' || animal.species_name === filterSpecies;
    return matchesSearch && matchesSpecies;
  });

  const uniqueSpecies = [...new Set(animals.map(a => a.species_name))].filter(Boolean);

  return (
    <FarmerLayout pageTitle="Reports">
      <div className="reports-page-content">
        <div className="p-8">
          <div className="reports-header mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Animal Health Reports</h1>
            <p className="text-gray-600">View treatment and vaccination records for all animals</p>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Animals
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by tag or breed..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Species Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Species
                </label>
                <select
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Species</option>
                  {uniqueSpecies.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredAnimals.length} of {animals.length} animals
            </div>
          </div>

          {loading && (
            <div className="reports-loading text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading animals...</p>
            </div>
          )}

          {error && (
            <div className="reports-error bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 mb-4">{error}</p>
              <button 
                onClick={fetchAnimals}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredAnimals.length === 0 && (
            <div className="reports-empty bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No animals found</p>
            </div>
          )}

          {!loading && !error && filteredAnimals.length > 0 && (
            <div className="animal-cards-grid">
              {filteredAnimals.map((animal) => (
                <AnimalReportCard
                  key={animal.id}
                  animal={animal}
                  onViewTreatment={handleViewTreatment}
                  onViewVaccination={handleViewVaccination}
                />
              ))}
            </div>
          )}
        </div>

        {selectedAnimal && modalType && (
          <ViewRecordsModal
            animal={selectedAnimal}
            type={modalType}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </FarmerLayout>
  );
};

export default ReportsPage;
