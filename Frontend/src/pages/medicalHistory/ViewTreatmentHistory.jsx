// src/pages/medicalHistory/ViewTreatmentHistory.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaChevronRight, FaSearch, FaTimes, FaCalendar, FaCheck, FaClock } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import TreatmentCard from "../../components/medicalHistory/TreatmentCard";
import MedicineTrackingCard from "../../components/medicalHistory/MedicalTrackingCard";
import ConfirmDeleteModal from "../../components/medicalHistory/ConfirmDeleteModal";
import ViewTreatmentModal from "../../components/medicalHistory/ViewTreatmentModal";
import { getAllTreatments, deleteTreatment } from "../../services/medicalApi";
import "../../styles/medicalHistory.css";
import { useLocalizedNumber } from "../../utils/formatNumber";

const ViewTreatmentHistory = () => {
  const { t } = useTranslation('medical');
  const fmt = useLocalizedNumber();
  const [treatments, setTreatments] = useState([]);
  const [activeTab, setActiveTab] = useState("past");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [treatmentToView, setTreatmentToView] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if user is a farmer or vet based on the referrer or user role
  const isFarmer = location.state?.from === 'farmer' || 
                   localStorage.getItem('userRole') === 'farmer' ||
                   document.referrer.includes('/farmerpage');

  const loadTreatments = async () => {
    setIsLoading(true);
    const result = await getAllTreatments();
    setIsLoading(false);
    
    if (result.success) {
      // Handle paginated response - extract results array
      const treatmentsData = result.data.results || result.data;
      const treatmentsArray = Array.isArray(treatmentsData) ? treatmentsData : [];
      setTreatments(treatmentsArray);
    } else {
      console.error("Failed to load treatments:", result.error);
      setTreatments([]);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  const pastTreatments = treatments.filter(t => t.status === "Completed");
  const upcomingTreatments = treatments.filter(t => t.status === "In Progress");
  
  // Filter treatments based on search term
  const filterTreatments = (treatmentList) => {
    if (!searchTerm) return treatmentList;
    
    const search = searchTerm.toLowerCase();
    return treatmentList.filter((treatment) => {
      const treatmentName = treatment.treatment_name?.toLowerCase() || "";
      const diagnosis = treatment.diagnosis?.toLowerCase() || "";
      const tagId = treatment.livestock?.tag_id?.toLowerCase() || "";
      const speciesName = treatment.livestock?.species_name?.toLowerCase() || "";
      const vetName = treatment.vet_name?.toLowerCase() || "";
      
      return (
        treatmentName.includes(search) ||
        diagnosis.includes(search) ||
        tagId.includes(search) ||
        speciesName.includes(search) ||
        vetName.includes(search)
      );
    });
  };

  const filteredPastTreatments = filterTreatments(pastTreatments);
  const filteredUpcomingTreatments = filterTreatments(upcomingTreatments);
  
  // Get active treatments (ongoing) for medicine tracking
  const activeTreatments = filterTreatments(
    treatments.filter(t => t.status === "In Progress" && t.medicines && t.medicines.length > 0)
  );

  const handleEdit = (treatment) => {
    // Save treatment ID to edit in localStorage
    localStorage.setItem("editTreatmentId", treatment.id);
    // Pass user context to maintain correct layout
    navigate("/medical/edit", { state: { from: isFarmer ? 'farmer' : 'vet' } });
  };

  const handleDelete = (treatment) => {
    setTreatmentToDelete(treatment);
    setShowDeleteModal(true);
  };

  const handleView = (treatment) => {
    setTreatmentToView(treatment);
    setShowViewModal(true);
  };

  const confirmDelete = async () => {
    if (treatmentToDelete) {
      const result = await deleteTreatment(treatmentToDelete.id);
      if (result.success) {
        setTreatments(treatments.filter(t => t.id !== treatmentToDelete.id));
      } else {
        alert("Failed to delete treatment: " + (result.error?.detail || result.error));
      }
    }
    setShowDeleteModal(false);
    setTreatmentToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTreatmentToDelete(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setTreatmentToView(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
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
        {t('breadcrumbs.dashboard')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">{t('breadcrumbs.medicalHistory')}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button 
        onClick={() => navigate('/vet/farmer-profiles')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.farmerProfiles')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <button 
        onClick={() => navigate('/vet/farmer-details')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        {t('breadcrumbs.animals')}
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">{t('breadcrumbs.medicalHistory')}</span>
    </div>
  );

  return (
    <Layout pageTitle="Medical History">
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Breadcrumbs */}
        {breadcrumbs}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('search.placeholder') || "Search by treatment name, diagnosis, tag ID, species, or vet name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div></div>
          <Link
            to="/medical/add"
            state={{ from: isFarmer ? 'farmer' : 'vet' }}
            className="btn-primary"
          >
            {t('buttons.addTreatment')}
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div
            className={`summary-card tracking cursor-pointer transition-transform hover:-translate-y-1 ${activeTab === "tracking" ? "ring-2 ring-blue-400" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            <div className="icon">
              <FaCalendar className="text-white" size={24} />
            </div>
            <div className="count">{fmt(activeTreatments.length)}</div>
            <div className="label">{t('tabs.tracking') || 'Medicine Tracking'}</div>
          </div>

          <div
            className={`summary-card completed cursor-pointer transition-transform hover:-translate-y-1 ${activeTab === "past" ? "ring-2 ring-green-400" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            <div className="icon">
              <FaCheck className="text-white" size={24} />
            </div>
            <div className="count">{fmt(filteredPastTreatments.length)}</div>
            <div className="label">{t('tabs.past') || 'Past Treatments'}</div>
          </div>

          <div
            className={`summary-card in-progress cursor-pointer transition-transform hover:-translate-y-1 ${activeTab === "upcoming" ? "ring-2 ring-orange-400" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            <div className="icon">
              <FaClock className="text-white" size={24} />
            </div>
            <div className="count">{fmt(filteredUpcomingTreatments.length)}</div>
            <div className="label">{t('tabs.inProgress') || 'In Progress'}</div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-gray-600">
            {t('page.loading')}
          </div>
        )}

        {!isLoading && (
          <>
            <div className="flex border-b border-light mb-4">
              <button
                className={`pb-2 px-4 font-medium ${activeTab === "tracking" ? "text-primary border-b-2 border-primary" : "text-muted"}`}
                onClick={() => setActiveTab("tracking")}
              >
                {t('tabs.tracking')} ({fmt(activeTreatments.length)})
              </button>
              <button
                className={`pb-2 px-4 font-medium ${activeTab === "past" ? "text-primary border-b-2 border-primary" : "text-muted"}`}
                onClick={() => setActiveTab("past")}
              >
                {t('tabs.past')} ({fmt(filteredPastTreatments.length)})
              </button>
              <button
                className={`pb-2 px-4 font-medium ${activeTab === "upcoming" ? "text-primary border-b-2 border-primary" : "text-muted"}`}
                onClick={() => setActiveTab("upcoming")}
              >
                {t('tabs.inProgress')} ({fmt(filteredUpcomingTreatments.length)})
              </button>
            </div>

            {activeTab === "tracking" && activeTreatments.length > 0 ? (
          <div>
            {activeTreatments.map((t, i) => (
              <div key={i} className="mb-6">
                <TreatmentCard treatment={t} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
                <MedicineTrackingCard treatment={t} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        ) : activeTab === "tracking" ? (
          <div className="empty-state">
            <div>{t('empty.tracking.icon')}</div>
            <p>{searchTerm ? t('empty.noResults') || `No results found for "${searchTerm}"` : t('empty.tracking.message')}</p>
          </div>
        ) : activeTab === "past" && filteredPastTreatments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPastTreatments.map((t, i) => (
              <TreatmentCard key={i} treatment={t} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
            ))}
          </div>
        ) : activeTab === "upcoming" && filteredUpcomingTreatments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUpcomingTreatments.map((t, i) => (
              <TreatmentCard key={i} treatment={t} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div>{t('empty.noRecords.icon')}</div>
            <p>{searchTerm ? t('empty.noResults') || `No results found for "${searchTerm}"` : t('empty.noRecords.message')}</p>
          </div>
        )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && treatmentToDelete && (
          <ConfirmDeleteModal
            treatment={treatmentToDelete}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}

        {/* View Treatment Modal */}
        {showViewModal && treatmentToView && (
          <ViewTreatmentModal
            treatment={treatmentToView}
            onClose={closeViewModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default ViewTreatmentHistory;