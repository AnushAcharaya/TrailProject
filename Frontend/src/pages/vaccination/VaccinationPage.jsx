// src/pages/vaccination/VaccinationPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSyringe, FaCalendar, FaClock, FaCheck, FaChevronRight } from "react-icons/fa";
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import VaccinationTabs from "../../components/vaccination/VaccinationTabs";
import VaccinationCard from "../../components/vaccination/VaccinationCard";
import "./../../styles/vaccination.css";

const VaccinationPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [vaccinations, setVaccinations] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if user is a farmer or vet based on the referrer or user role
  const isFarmer = location.state?.from === 'farmer' || 
                   localStorage.getItem('userRole') === 'farmer' ||
                   document.referrer.includes('/farmerpage');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vaccinations");
    if (saved) {
      setVaccinations(JSON.parse(saved));
    }
  }, []);

  const filteredVaccinations = vaccinations.filter((v) => {
    const today = new Date();
    const dueDate = new Date(v.nextDueDate);
    const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

    if (activeTab === "upcoming") return daysDiff >= 0;
    if (activeTab === "completed") return false; // Placeholder
    if (activeTab === "overdue") return daysDiff < 0;
    return true;
  });

  const counts = {
    upcoming: vaccinations.filter(v => new Date(v.nextDueDate) >= new Date()).length,
    completed: 2,
    overdue: vaccinations.filter(v => new Date(v.nextDueDate) < new Date()).length,
  };

  // Choose the appropriate layout
  const Layout = isFarmer ? FarmerLayout : VetLayout;
  
  // Breadcrumbs based on user type
  const breadcrumbs = isFarmer ? (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button 
        onClick={() => navigate('/farmerpage')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        Dashboard
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">Vaccinations</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button 
        onClick={() => navigate('/vet/farmer-profiles')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        Farmer Profiles
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <button 
        onClick={() => navigate('/vet/farmer-details')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        Animals
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">Vaccinations</span>
    </div>
  );

  return (
    <Layout pageTitle="Vaccinations">
      <div className="vaccination-page">
        {/* Breadcrumbs */}
        {breadcrumbs}

        <div className="page-header">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded">
              <FaSyringe className="text-green-700" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-body">Vaccination Schedule</h1>
              <p className="text-sm text-muted">Manage and track livestock vaccinations</p>
            </div>
          </div>
          <Link to="/vaccination/add" className="add-btn">
            <FaSyringe className="mr-1" size={18} />
            Add Vaccination
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="summary-card upcoming">
            <div className="icon">
              <FaCalendar className="text-white" size={24} />
            </div>
            <div className="count">{counts.upcoming}</div>
            <div className="label">Upcoming</div>
          </div>

          <div className="summary-card completed">
            <div className="icon">
              <FaCheck className="text-white" size={24} />
            </div>
            <div className="count">{counts.completed}</div>
            <div className="label">Completed</div>
          </div>

          <div className="summary-card overdue">
            <div className="icon">
              <FaClock className="text-white" size={24} />
            </div>
            <div className="count">{counts.overdue}</div>
            <div className="label">Overdue</div>
          </div>
        </div>

        {/* Tabs */}
        <VaccinationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVaccinations.length > 0 ? (
            filteredVaccinations.map((v, i) => (
              <VaccinationCard key={i} vaccination={v} />
            ))
          ) : (
            <div className="col-span-full empty-state">  
              <FaClock className="text-gray-400 mx-auto" size={40} />
              <p>No {activeTab} vaccinations found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VaccinationPage;