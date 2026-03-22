import React, { useState, useEffect } from 'react';
import ReportsSidebar from '../../components/reports/ReportsSidebar';
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
    <div className="reports-page">
      <ReportsSidebar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterSpecies={filterSpecies}
        setFilterSpecies={setFilterSpecies}
        uniqueSpecies={uniqueSpecies}
        totalAnimals={animals.length}
        filteredCount={filteredAnimals.length}
      />
      
      <div className="reports-content">
        <div className="reports-header">
          <h1>Animal Health Reports</h1>
          <p>View treatment and vaccination records for all animals</p>
        </div>

        {loading && (
          <div className="reports-loading">
            <div className="spinner"></div>
            <p>Loading animals...</p>
          </div>
        )}

        {error && (
          <div className="reports-error">
            <p>{error}</p>
            <button onClick={fetchAnimals}>Retry</button>
          </div>
        )}

        {!loading && !error && filteredAnimals.length === 0 && (
          <div className="reports-empty">
            <p>No animals found</p>
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
  );
};

export default ReportsPage;
