import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import LivestockDetails from './LivestockDetails';
import { getAllLivestock } from '../../../../services/livestockCrudApi';

const SelectLivestockStep = ({ livestock, onLivestockSelect, onNext, onBack }) => {
  const [livestockOptions, setLivestockOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLivestock();
  }, []);

  const fetchLivestock = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllLivestock();
      
      if (result.success) {
        // Handle paginated response
        const livestockData = result.data.results || result.data;
        
        console.log('Livestock data from backend:', livestockData);
        
        // Transform backend data to match component format
        const transformedData = livestockData.map(animal => {
          console.log('Processing animal:', animal);
          return {
            id: animal.id,
            name: animal.species_name || 'Unknown',
            type: animal.species_name || 'Unknown',
            breed: animal.breed_name || 'Unknown',
            tag: animal.tag_id,
            age: calculateAge(animal.date_of_birth),
            healthStatus: animal.health_status || 'unknown',
            // Keep original data for details
            originalData: animal
          };
        });
        
        console.log('Transformed data:', transformedData);
        setLivestockOptions(transformedData);
      } else {
        setError(result.error?.message || 'Failed to fetch livestock');
      }
    } catch (err) {
      console.error('Error fetching livestock:', err);
      setError('Failed to load livestock data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                        (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Select Livestock</h2>
      <p className="form-subtitle">Choose the livestock you want to insure from your registered animals.</p>

      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading livestock...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchLivestock}
            className="mt-2 text-emerald-600 hover:text-emerald-700"
          >
            Try Again
          </button>
        </div>
      ) : livestockOptions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No livestock found. Please add livestock first.</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <select
              className="dropdown-select"
              value={livestock?.id || ''}
              onChange={(e) => {
                const selected = livestockOptions.find(
                  (l) => l.id === parseInt(e.target.value)
                );
                onLivestockSelect(selected);
              }}
            >
              <option value="">Select livestock...</option>
              {livestockOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.breed}) - {item.tag}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
          </div>

          {livestock && <LivestockDetails livestock={livestock} />}
        </>
      )}

      <div className="btn-container">
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!livestock || loading}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default SelectLivestockStep;
