import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import VetLayout from "../../components/vetDashboard/VetLayout";
import SearchBar from "../../components/appointments/SearchBar";
import VetAppointmentCard from "../../components/appointments/VetAppointmentCard";
import { getAppointments } from "../../services/appointmentApi";
import "../../styles/appointments.css";

const VetAppointments = () => {
  const { t } = useTranslation('appointments');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, appointments]);

  const loadAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAppointments({ ordering: '-preferred_date' });
      // Handle both paginated and non-paginated responses
      const appointmentsList = Array.isArray(data) ? data : (data.results || []);
      setAppointments(appointmentsList);
      setFilteredAppointments(appointmentsList);
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError(t('vet.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    // Ensure appointments is an array
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = appointments.filter(apt => {
      const farmerName = apt.farmer_details?.full_name?.toLowerCase() || '';
      const farmerUsername = apt.farmer_details?.username?.toLowerCase() || '';
      const animalType = apt.animal_type?.toLowerCase() || '';
      const reason = apt.reason?.toLowerCase() || '';
      
      return farmerName.includes(query) || 
             farmerUsername.includes(query) || 
             animalType.includes(query) || 
             reason.includes(query);
    });
    
    setFilteredAppointments(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAppointmentUpdate = () => {
    loadAppointments();
  };

  return (
    <VetLayout pageTitle={t('vet.title')}>
      <div className="app-page">
        <SearchBar 
          placeholder={t('vet.searchPlaceholder')}
          onSearch={handleSearch}
        />

        <h1 className="app-title mb-6">
          {t('vet.pageTitle')}
        </h1>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('vet.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!isLoading && !error && Array.isArray(filteredAppointments) && filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? t('vet.noResults') : t('vet.noAppointments')}
            </p>
          </div>
        )}

        {!isLoading && !error && Array.isArray(filteredAppointments) && filteredAppointments.map((appointment) => (
          <VetAppointmentCard 
            key={appointment.id}
            appointment={appointment}
            onUpdate={handleAppointmentUpdate}
          />
        ))}
      </div>
    </VetLayout>
  );
};

export default VetAppointments;
