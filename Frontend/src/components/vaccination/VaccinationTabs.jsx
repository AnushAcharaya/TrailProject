// src/components/vaccination/VaccinationTabs.jsx
import { useTranslation } from "react-i18next";
import "./../../styles/vaccination.css";

const VaccinationTabs = ({ activeTab, onTabChange, counts }) => {
  const { t } = useTranslation('vaccination');
  
  return (
    <div className="tabs">
      <button
        className={`tab upcoming ${activeTab === "upcoming" ? "active" : ""}`}
        onClick={() => onTabChange("upcoming")}
      >
        {t('tabs.upcoming')} <span className="ml-1">{counts.upcoming}</span>
      </button>
      <button
        className={`tab completed ${activeTab === "completed" ? "active" : ""}`}
        onClick={() => onTabChange("completed")}
      >
        {t('tabs.completed')} <span className="ml-1">{counts.completed}</span>
      </button>
      <button
        className={`tab overdue ${activeTab === "overdue" ? "active" : ""}`}
        onClick={() => onTabChange("overdue")}
      >
        {t('tabs.overdue')} <span className="ml-1">{counts.overdue}</span>
      </button>
    </div>
  );
};

export default VaccinationTabs;