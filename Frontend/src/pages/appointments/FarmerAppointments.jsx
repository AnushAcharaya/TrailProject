import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import SearchBar from "../../components/appointments/SearchBar";
import StatCards from "../../components/appointments/StatCards";
import FarmerAppointmentTable from "../../components/appointments/FarmerAppointmentTable";
import VetProfileCard from "../../components/appointments/VetProfileCard";
import { getAllVets } from "../../services/profileApi";
import "../../styles/appointments.css";

const FarmerAppointments = () => {
  const { t } = useTranslation('appointments');
  const navigate = useNavigate();
  const [vets, setVets] = useState([]);
  const [isLoadingVets, setIsLoadingVets] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load all vets on component mount
  useEffect(() => {
    loadVets();
  }, []);

  // Check if we just created an appointment (from navigation state)
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.appointmentCreated) {
      // Trigger refresh of appointments table
      setRefreshKey(prev => prev + 1);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, []);

  const loadVets = async () => {
    setIsLoadingVets(true);
    const result = await getAllVets();
    
    if (result.success) {
      setVets(result.data);
    } else {
      console.error("Failed to load vets:", result.error);
    }
    
    setIsLoadingVets(false);
  };

  // Filter vets based on search query
  const filteredVets = vets.filter(vet => {
    const query = searchQuery.toLowerCase();
    return (
      vet.full_name?.toLowerCase().includes(query) ||
      vet.username?.toLowerCase().includes(query) ||
      vet.specialization?.toLowerCase().includes(query) ||
      vet.address?.toLowerCase().includes(query)
    );
  });

  const handleAppointVet = (vet) => {
    // Store selected vet info and navigate to appointment request form
    localStorage.setItem("selectedVetId", vet.username);
    localStorage.setItem("selectedVetName", vet.full_name || vet.username);
    navigate('/appointments/request');
  };

  return (
    <FarmerLayout pageTitle={t('farmer.pageTitle')}>
      <div className="app-page">
        <SearchBar 
          placeholder={t('farmer.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex justify-between items-center mb-6">
          <h1 className="app-title">{t('farmer.welcome', { name: 'John' })}</h1>
          <button 
            className="btn-primary"
            onClick={() => navigate('/appointments/request')}
          >
            + {t('farmer.requestAppointment')}
          </button>
        </div>

        <StatCards />

        {/* Vet Profiles Section */}
        <div className="mt-8">
          <h2 className="section-header">{t('farmer.vets.title')}</h2>
          <p className="section-subtitle">
            {t('farmer.vets.subtitle')}
          </p>

          {isLoadingVets ? (
            <div className="text-center py-8 text-gray-600">
              {t('farmer.vets.loading')}
            </div>
          ) : filteredVets.length > 0 ? (
            <div className="vet-profiles-grid">
              {filteredVets.map((vet) => (
                <VetProfileCard
                  key={vet.username}
                  vet={vet}
                  onAppointVet={handleAppointVet}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              {searchQuery ? t('farmer.vets.noResults', { query: searchQuery }) : t('farmer.vets.noVets')}
            </div>
          )}
        </div>

        {/* Appointments Table */}
        <div className="mt-8">
          <h2 className="section-header">{t('farmer.appointments.title')}</h2>
          <FarmerAppointmentTable key={refreshKey} />
        </div>
      </div>
    </FarmerLayout>
  );
};

export default FarmerAppointments;
