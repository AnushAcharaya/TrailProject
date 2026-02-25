// src/pages/LivestockPage.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import LivestockList from "../../components/livestockCrud/LivestockList";
import { getAllLivestock, deleteLivestock } from "../../services/livestockCrudApi";
import "../../styles/livestock.css";

const LivestockPage = () => {
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <FarmerLayout pageTitle="My Livestock">
      <div className="livestock-container">
        {/* Header with title and button */}
        <div className="livestock-header">
          <h1 className="page-title">My Livestock</h1>
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
          livestockData.length > 0 ? (
            <LivestockList livestockData={livestockData} onDelete={handleDelete} />
          ) : (
            <p className="empty-message">No livestock records yet.</p>
          )
        )}
      </div>
    </FarmerLayout>
  );
};

export default LivestockPage;