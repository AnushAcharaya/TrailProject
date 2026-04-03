// src/pages/vaccination/AddVaccinationPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import VetLayout from "../../components/vetDashboard/VetLayout";
import FarmerLayout from "../../components/farmerDashboard/FarmerLayout";
import AddVaccinationForm from "../../components/vaccination/AddVaccinationForm";
import "../../styles/vaccination.css";

const AddVaccinationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if user is a farmer or vet
  const isFarmer = location.state?.from === 'farmer' || 
                   localStorage.getItem('userRole') === 'farmer';

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
      <button 
        onClick={() => navigate('/vaccination')}
        className="text-emerald-600 hover:text-emerald-700"
      >
        Vaccinations
      </button>
      <FaChevronRight className="text-gray-400 text-xs" />
      <span className="text-gray-600">Add Vaccination</span>
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
      <span className="text-gray-600">Add Vaccination</span>
    </div>
  );

  return (
    <Layout pageTitle="Add Vaccination">
      <div className="vaccination-bg min-h-screen px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs}

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Add Vaccination Record
          </h1>
          <p className="text-sm text-gray-500">
            Record vaccination details for livestock
          </p>
        </div>

        <AddVaccinationForm />
      </div>
    </Layout>
  );
};

export default AddVaccinationPage;
