// src/components/vaccination/VaccinationTabs.jsx
import "./../../styles/vaccination.css";

const VaccinationTabs = ({ activeTab, onTabChange, counts }) => {
  return (
    <div className="tabs">
      <button
        className={`tab upcoming ${activeTab === "upcoming" ? "active" : ""}`}
        onClick={() => onTabChange("upcoming")}
      >
        Upcoming <span className="ml-1">{counts.upcoming}</span>
      </button>
      <button
        className={`tab completed ${activeTab === "completed" ? "active" : ""}`}
        onClick={() => onTabChange("completed")}
      >
        Completed <span className="ml-1">{counts.completed}</span>
      </button>
      <button
        className={`tab overdue ${activeTab === "overdue" ? "active" : ""}`}
        onClick={() => onTabChange("overdue")}
      >
        Overdue <span className="ml-1">{counts.overdue}</span>
      </button>
    </div>
  );
};

export default VaccinationTabs;