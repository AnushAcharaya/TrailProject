import React from 'react';
import { useLocalizedNumber } from '../../utils/formatNumber';

const ReportsSidebar = ({
  searchTerm,
  setSearchTerm,
  filterSpecies,
  setFilterSpecies,
  uniqueSpecies,
  totalAnimals,
  filteredCount
}) => {
  const fmt = useLocalizedNumber();
  return (
    <div className="reports-sidebar">
      <div className="sidebar-header">
        <h2>Filters</h2>
      </div>

      <div className="sidebar-section">
        <label>Search Animals</label>
        <input
          type="text"
          placeholder="Search by tag or breed..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sidebar-search"
        />
      </div>

      <div className="sidebar-section">
        <label>Filter by Species</label>
        <select
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          className="sidebar-select"
        >
          <option value="all">All Species</option>
          {uniqueSpecies.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-label">Total Animals</span>
            <span className="stat-value">{fmt(totalAnimals)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Filtered Results</span>
            <span className="stat-value">{fmt(filteredCount)}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <button 
          onClick={() => {
            setSearchTerm('');
            setFilterSpecies('all');
          }}
          className="sidebar-reset-btn"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ReportsSidebar;
