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
import "../../styles/medicalHistory.css";

const ViewTreatmentHistory = () => {
  const [treatments, setTreatments] = useState([]);
  const [activeTab, setActiveTab] = useState("past");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [treatmentToView, setTreatmentToView] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if user is a farmer or vet based on the referrer or user role
  const isFarmer = location.state?.from === 'farmer' || 
                   localStorage.getItem('userRole') === 'farmer' ||
                   document.referrer.includes('/farmerpage');

  const loadTreatments = () => {
    const saved = localStorage.getItem("treatments");
    if (saved) {
      setTreatments(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  const pastTreatments = treatments.filter(t => t.status === "Completed");
  const upcomingTreatments = treatments.filter(t => t.status === "In Progress");
  
  // Get active treatments (ongoing) for medicine tracking
  const activeTreatments = treatments.filter(t => {
    if (!t.treatmentDate || !t.medicines || t.medicines.length === 0) return false;
    const startDate = new Date(t.treatmentDate);
    const endDate = new Date(startDate);
    const duration = t.medicines[0]?.duration || 0;
    endDate.setDate(startDate.getDate() + duration);
    const today = new Date();
    return today >= startDate && today <= endDate && t.status === "In Progress";
  });

  const handleEdit = (treatment) => {
    // Save treatment ID to edit in localStorage
    localStorage.setItem("editTreatmentId", treatment.id);
    navigate("/medical/edit");
  };

  const handleDelete = (treatment) => {
    setTreatmentToDelete(treatment);
    setShowDeleteModal(true);
  };

  const handleView = (treatment) => {
    setTreatmentToView(treatment);
    setShowViewModal(true);
  };

  const confirmDelete = () => {
    if (treatmentToDelete) {
      const updated = treatments.filter(t => t.id !== treatmentToDelete.id);
      localStorage.setItem("treatments", JSON.stringify(updated));
      setTreatments(updated);
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
            className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800"
          >
            + Add Treatment
          </Link>
        </div>

        <div className="mb-4">
          <select className="border border-light rounded p-2">
            <option>All Livestock</option>
          </select>
        </div>

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