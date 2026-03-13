// src/pages/medicalHistory/ViewTreatmentHistory.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import PageHeader from "../../components/medicalHistory/PageHeader";
import TreatmentCard from "../../components/medicalHistory/TreatmentCard";
import MedicineTrackingCard from "../../components/medicalHistory/MedicalTrackingCard";
import ConfirmDeleteModal from "../../components/medicalHistory/ConfirmDeleteModal";
import ViewTreatmentModal from "../../components/medicalHistory/ViewTreatmentModal";
import { getAllTreatments, deleteTreatment } from "../../services/medicalApi";
import "../../styles/medicalHistory.css";

const ViewTreatmentHistory = () => {
  const [treatments, setTreatments] = useState([]);
  const [activeTab, setActiveTab] = useState("past");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [treatmentToView, setTreatmentToView] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
  
  // Get active treatments (ongoing) for medicine tracking
  const activeTreatments = treatments.filter(t => {
    console.log('[ViewTreatmentHistory] Checking treatment:', t.treatment_name);
    console.log('[ViewTreatmentHistory]   - treatment_date:', t.treatment_date);
    console.log('[ViewTreatmentHistory]   - medicines:', t.medicines);
    console.log('[ViewTreatmentHistory]   - medicines length:', t.medicines?.length);
    console.log('[ViewTreatmentHistory]   - status:', t.status);
    
    if (!t.treatment_date) {
      console.log('[ViewTreatmentHistory]   ❌ No treatment_date');
      return false;
    }
    if (!t.medicines) {
      console.log('[ViewTreatmentHistory]   ❌ No medicines field');
      return false;
    }
    if (t.medicines.length === 0) {
      console.log('[ViewTreatmentHistory]   ❌ Medicines array is empty');
      return false;
    }
    
    const startDate = new Date(t.treatment_date);
    const endDate = new Date(startDate);
    const duration = t.medicines[0]?.duration || 0;
    endDate.setDate(startDate.getDate() + duration);
    const today = new Date();
    
    console.log('[ViewTreatmentHistory]   - startDate:', startDate.toISOString().split('T')[0]);
    console.log('[ViewTreatmentHistory]   - endDate:', endDate.toISOString().split('T')[0]);
    console.log('[ViewTreatmentHistory]   - today:', today.toISOString().split('T')[0]);
    console.log('[ViewTreatmentHistory]   - today >= startDate:', today >= startDate);
    console.log('[ViewTreatmentHistory]   - today <= endDate:', today <= endDate);
    console.log('[ViewTreatmentHistory]   - status === "In Progress":', t.status === "In Progress");
    
    const passes = today >= startDate && today <= endDate && t.status === "In Progress";
    console.log('[ViewTreatmentHistory]   - PASSES FILTER:', passes);
    
    return passes;
  });

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
      <span className="text-gray-600">Medical History</span>
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
      <span className="text-gray-600">Medical History</span>
    </div>
  );

  return (
    <Layout pageTitle="Medical History">
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Breadcrumbs */}
        {breadcrumbs}

        <div className="flex justify-between items-start">
          <div>
            <PageHeader
              title="Treatment History"
              subtitle="View and manage livestock medical records"
            />
          </div>
          <Link
            to="/medical/add"
            state={{ from: isFarmer ? 'farmer' : 'vet' }}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800"
          >
            + Add Treatment
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-gray-600">
            Loading treatments...
          </div>
        )}

        <div className="mb-4">
          <select className="border border-light rounded p-2">
            <option>All Livestock</option>
          </select>
        </div>

        {!isLoading && (
          <>
            <div className="flex border-b border-light mb-4">
              <button
                className={`pb-2 px-4 font-medium ${activeTab === "tracking" ? "text-primary border-b-2 border-primary" : "text-muted"}`}
                onClick={() => setActiveTab("tracking")}
              >
                Medicine Tracking ({activeTreatments.length})
              </button>
              <button
                className={`pb-2 px-4 font-medium ${activeTab === "past" ? "text-primary border-b-2 border-primary" : "text-muted"}`}
                onClick={() => setActiveTab("past")}
              >
                Past Treatments ({pastTreatments.length})
              </button>
              <button
                className={`pb-2 px-4 font-medium ${activeTab === "upcoming" ? "text-primary border-b-2 border-primary" : "text-muted"}`}
                onClick={() => setActiveTab("upcoming")}
              >
                In Progress ({upcomingTreatments.length})
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
            <div>💊</div>
            <p>No active treatments with medicine schedules.</p>
          </div>
        ) : activeTab === "past" && pastTreatments.length > 0 ? (
          pastTreatments.map((t, i) => (
            <TreatmentCard key={i} treatment={t} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
          ))
        ) : activeTab === "upcoming" && upcomingTreatments.length > 0 ? (
          upcomingTreatments.map((t, i) => (
            <TreatmentCard key={i} treatment={t} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
          ))
        ) : (
          <div className="empty-state">
            <div>📋</div>
            <p>No treatment records found.</p>
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