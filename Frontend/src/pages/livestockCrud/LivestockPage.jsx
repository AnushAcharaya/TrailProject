// src/pages/LivestockPage.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LivestockList from "../../components/livestockCrud/LivestockList";
import "../../styles/livestock.css";

const LivestockPage = () => {
  const [livestockData, setLivestockData] = useState([]);
  const location = useLocation();

  // Load from localStorage on mount and when location changes
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem("livestockData");
      if (saved) {
        setLivestockData(JSON.parse(saved));
      } else {
        setLivestockData([]);
      }
    };
    loadData();
  }, [location]); // Reload when navigating back to this page

  // Delete handler
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this livestock?")) {
      const updated = livestockData.filter((_, i) => i !== index);
      localStorage.setItem("livestockData", JSON.stringify(updated));
      setLivestockData(updated);
    }
  };

  return (
    <div className="livestock-container">
      {/* Header with title and button */}
      <div className="livestock-header">
        <h1 className="page-title">My Livestock</h1>
        <Link to="/livestock/add" className="add-button">
          + Add New Livestock
        </Link>
      </div>

      {/* Show list or empty message */}
      {livestockData.length > 0 ? (
        <LivestockList livestockData={livestockData} onDelete={handleDelete} />
      ) : (
        <p className="empty-message">No livestock records yet.</p>
      )}
    </div>
  );
};

export default LivestockPage;