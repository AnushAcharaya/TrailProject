import { useState, useEffect } from 'react';
import { FaBell, FaUsers } from 'react-icons/fa';
import VetLayout from '../VetLayout';
import ProfileCard from './ProfileCard';
import SearchBar from './SearchBar';
import { getAllFarmers } from '../../../services/profileApi';

export default function FarmerProfiles() {
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFarmers();
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [searchQuery, farmers]);

  const loadFarmers = async () => {
    setIsLoading(true);
    const result = await getAllFarmers();
    
    if (result.success) {
      setFarmers(result.data);
      setFilteredFarmers(result.data);
    } else {
      console.error('Failed to load farmers:', result.error);
    }
    
    setIsLoading(false);
  };

  const filterFarmers = () => {
    if (!searchQuery.trim()) {
      setFilteredFarmers(farmers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = farmers.filter(farmer => {
      return (
        farmer.full_name?.toLowerCase().includes(query) ||
        farmer.username?.toLowerCase().includes(query) ||
        farmer.phone?.toLowerCase().includes(query) ||
        farmer.farm_name?.toLowerCase().includes(query) ||
        farmer.address?.toLowerCase().includes(query)
      );
    });
    
    setFilteredFarmers(filtered);
  };

  return (
    <VetLayout pageTitle="Farmer Profiles">
      {/* Main Content */}
      <div className="p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header with title and count */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Farmer Profiles</h2>
            <p className="text-gray-600">{filteredFarmers.length} Registered farmers</p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-600">
              Loading farmer profiles...
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              {searchQuery ? `No farmers found matching "${searchQuery}"` : 'No registered farmers found'}
            </div>
          ) : (
            /* Farmer Profiles Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarmers.map(farmer => (
                <ProfileCard key={farmer.username} farmer={farmer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </VetLayout>
  );
}
