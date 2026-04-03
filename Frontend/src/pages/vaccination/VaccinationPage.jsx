// src/pages/vaccination/VaccinationPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSyringe, FaCalendar, FaClock, FaCheck, FaChevronRight } from "react-icons/fa";
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import VaccinationTabs from "../../components/vaccination/VaccinationTabs";
import VaccinationCard from "../../components/vaccination/VaccinationCard";
import VaccinationSearchBar from "../../components/vaccination/VaccinationSearchBar";
import { getAllVaccinations, getVaccinationCounts, getUpcomingVaccinations, getOverdueVaccinations, getCompletedVaccinations } from "../../services/vaccinationApi";
import "./../../styles/vaccination.css";

const VaccinationPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ upcoming: 0, completed: 0, overdue: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if user is a farmer or vet based on location state or user role
  const getUserRole = () => {
    // First check if we came from vet dashboard
    if (location.state?.from === 'vet') {
      return 'vet';
    }
    if (location.state?.from === 'farmer') {
      return 'farmer';
    }
    
    // Otherwise check localStorage
    try {
      const profile = JSON.parse(localStorage.getItem('profile') || '{}');
      return profile.role || localStorage.getItem('userRole') || 'farmer';
    } catch {
      return localStorage.getItem('userRole') || 'farmer';
    }
  };
  
  const isFarmer = getUserRole() === 'farmer';

  // Load vaccinations from API
  useEffect(() => {
    fetchVaccinations();
    fetchCounts();
  }, [activeTab]);

  const fetchVaccinations = async () => {
    setLoading(true);
    let result;
    
    if (activeTab === "upcoming") {
      result = await getUpcomingVaccinations();
    } else if (activeTab === "overdue") {
      result = await getOverdueVaccinations();
    } else if (activeTab === "completed") {
      result = await getCompletedVaccinations();
    } else {
      result = await getAllVaccinations();
    }
    
    if (result.success) {
      setVaccinations(result.data);
    } else {
      console.error('Failed to fetch vaccinations:', result.error);
    }
    setLoading(false);
  };

  const fetchCounts = async () => {
    const result = await getVaccinationCounts();
    if (result.success) {
      setCounts({
        upcoming: result.data.upcoming || 0,
        completed: result.data.completed || 0,
        overdue: result.data.overdue || 0,
      });
    }
  };

  // Filter vaccinations based on search term
  const filteredVaccinations = vaccinations.filter((vaccination) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const vaccineName = vaccination.vaccine_name?.toLowerCase() || "";
    const vaccineType = vaccination.vaccine_type?.toLowerCase() || "";
    const tagId = vaccination.livestock?.tag_id?.toLowerCase() || "";
    const speciesName = vaccination.livestock?.species_name?.toLowerCase() || "";
    const status = vaccination.status?.toLowerCase() || "";
    
    return (
      vaccineName.includes(search) ||
      vaccineType.includes(search) ||
      tagId.includes(search) ||
      speciesName.includes(search) ||
      status.includes(search)
    );
  });

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

        {/* Search Bar */}
        <VaccinationSearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          allVaccinations={vaccinations}
        />

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
          <Link to="/vaccination/add" state={{ from: isFarmer ? 'farmer' : 'vet' }} className="add-btn">
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
        <VaccinationTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-600">Loading vaccinations...</p>
            </div>
          ) : filteredVaccinations.length > 0 ? (
            filteredVaccinations.map((v) => (
              <VaccinationCard key={v.id} vaccination={v} onRefresh={fetchVaccinations} />
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