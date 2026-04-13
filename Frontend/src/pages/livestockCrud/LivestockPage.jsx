// src/pages/LivestockPage.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import LivestockList from "../../components/livestockCrud/LivestockList";
import { getAllLivestock, deleteLivestock } from "../../services/livestockCrudApi";
import "../../styles/livestock.css";

const LivestockPage = () => {
  const { t } = useTranslation('livestock');
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // Fetch livestock data from API
  useEffect(() => {
    fetchLivestock();
  }, [location]);

  const fetchLivestock = async () => {
    console.log('[LivestockPage] Fetching livestock...');
    setLoading(true);
    setError(null);
    const result = await getAllLivestock();
    
    console.log('[LivestockPage] API result:', result);
    console.log('[LivestockPage] Result success:', result.success);
    console.log('[LivestockPage] Result data:', result.data);
    
    if (result.success) {
      // Handle paginated response
      const data = result.data.results || result.data;
      console.log('[LivestockPage] Extracted data:', data);
      console.log('[LivestockPage] Is array:', Array.isArray(data));
      console.log('[LivestockPage] Data length:', data.length);
      setLivestockData(Array.isArray(data) ? data : []);
    } else {
      console.error('[LivestockPage] Error:', result.error);
      setError(result.error?.message || 'Failed to load livestock');
      setLivestockData([]);
    }
    setLoading(false);
  };

  // Delete handler
  const handleDelete = async (id) => {
    const result = await deleteLivestock(id);
    
    if (result.success) {
      // Remove from local state
      setLivestockData(livestockData.filter(item => item.id !== id));
    } else {
      alert(result.error?.message || 'Failed to delete livestock');
    }
  };

  // Filter livestock based on search term
  const filteredLivestock = livestockData.filter((livestock) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const tagId = livestock.tag_id?.toLowerCase() || "";
    const speciesName = livestock.species_name?.toLowerCase() || "";
    const breedName = livestock.breed_name?.toLowerCase() || "";
    const gender = livestock.gender?.toLowerCase() || "";
    const healthStatus = livestock.health_status?.toLowerCase() || "";
    
    return (
      tagId.includes(search) ||
      speciesName.includes(search) ||
      breedName.includes(search) ||
      gender.includes(search) ||
      healthStatus.includes(search)
    );
  });

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <FarmerLayout pageTitle={t('pageTitle')}>
      <div className="livestock-container">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by tag ID, species, breed, gender, or health status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Header with button */}
        <div className="livestock-header">
          <Link to="/livestock/add" className="add-button">
            + Add New Livestock
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading livestock...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Show list or empty message */}
        {!loading && !error && (
          filteredLivestock.length > 0 ? (
            <LivestockList livestockData={filteredLivestock} onDelete={handleDelete} />
          ) : searchTerm ? (
            <p className="empty-message">No livestock found matching "{searchTerm}".</p>
          ) : (
            <p className="empty-message">No livestock records yet.</p>
          )
        )}
      </div>
    </FarmerLayout>
  );
};

export default LivestockPage;