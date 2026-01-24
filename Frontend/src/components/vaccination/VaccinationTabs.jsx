// src/components/vaccination/VaccinationTabs.jsx
import "./../../styles/vaccination.css";

const VaccinationTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      <button
        className={`tab upcoming ${activeTab === "upcoming" ? "active" : ""}`}
        onClick={() => onTabChange("upcoming")}
      >
        Upcoming <span className="ml-1">2</span>
      </button>
      <button
        className={`tab completed ${activeTab === "completed" ? "active" : ""}`}
        onClick={() => onTabChange("completed")}
      >
        Completed <span className="ml-1">2</span>
      </button>
      <button
        className={`tab overdue ${activeTab === "overdue" ? "active" : ""}`}
        onClick={() => onTabChange("overdue")}
      >
        Overdue <span className="ml-1">2</span>
      </button>
    </div>
  );
};

export default VaccinationTabs;