import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import AccountCreate from "./pages/CreateAccount";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Page from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./components/profile/ProfilePage";
import LivestockPage from "./pages/livestockCrud/LivestockPage";
import AddLivestockPage from "./pages/livestockCrud/AddLivestockPage";
import EditLivestockPage from "./pages/livestockCrud/EditLivestockPage";
import AddTreatmentRecord from "./pages/medicalHistory/AddTreatmentRecord";
import EditTreatmentRecord from "./pages/medicalHistory/EditTreatmentRecord";
import ViewTreatmentHistory from "./pages/medicalHistory/ViewTreatmentHistory";
import MonitorDeadlines from "./pages/medicalHistory/MonitorDeadlines";
import AlertsNotifications from "./pages/medicalHistory/AlertNotifications";
import VaccinationPage from "./pages/vaccination/VaccinationPage";
import AddVaccinationPage from "./pages/vaccination/AddVaccinationPage";
import EditVaccinationPage from "./pages/vaccination/EditVaccinationPage";
import FarmerDashboardPage from "./pages/FarmerDashboard/FarmerDashboardPage";
import FarmerAppointments from "./pages/appointments/FarmerAppointments";
import VetAppointments from "./pages/appointments/VetAppointments";
import RequestAppointmentPage from "./pages/appointments/RequestAppointmentPage";
import FriendRequestsPage from "./pages/friends/FriendRequests";
import FriendsListPage from "./pages/friends/FriendsList";
import VetFriendRequestsPage from "./pages/friends/VetFriendRequests";
import VetFriendsListPage from "./pages/friends/VetFriendsList";
import Dashboard from "./pages/insurance/farmerSideInsurance/Dashboard";
import InsurancePlans from "./pages/insurance/farmerSideInsurance/InsurancePlan";
import EnrollPage from "./pages/insurance/farmerSideInsurance/Enroll";
import SubmitClaimPage from "./pages/insurance/farmerSideInsurance/SubmitClaim";
import TrackClaimPage from "./pages/insurance/farmerSideInsurance/TrackClaim";
import AdminInsurancePage from "./pages/insurance/adminSideInsurance/AdminInsurance";
import AnimalListPage from "./pages/profileTransfer/farmerSide/AnimalList";
import SendTransfersPage from "./pages/profileTransfer/farmerSide/SendTransfer";
import ReceivedRequestsPage from "./pages/profileTransfer/receiverSide/ReceivedRequest";
import AdminDashboardPage from "./pages/profileTransfer/adminSide/AdminDashboard";
import ReviewTransferPage from "./pages/profileTransfer/adminSide/ReviewTransfer";
import MainDashboardPage from "./pages/vetDashboard/MainDashboard";
import FarmerProfilesPage from "./pages/vetDashboard/FarmerProfile";
import FarmerDetailPage from "./pages/vetDashboard/FarmerDetail";
import ReportsPage from "./pages/reports/ReportsPage";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/register" element={<AccountCreate />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<Page />} />
        <Route path="/adminpage" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/livestock" element={<LivestockPage />} />
        <Route path="/livestock/add" element={<AddLivestockPage />} />
        <Route path="/livestock/edit/:id" element={<EditLivestockPage />} />
        <Route path="/medical/add" element={<AddTreatmentRecord />} />
        <Route path="/medical/edit" element={<EditTreatmentRecord />} />
        <Route path="/medical/history" element={<ViewTreatmentHistory />} />
        <Route path="/medical/deadlines" element={<MonitorDeadlines />} />
        <Route path="/medical/alerts" element={<AlertsNotifications />} />
        <Route path="/vaccination" element={<VaccinationPage />} />
        <Route path="/vaccination/add" element={<AddVaccinationPage />} />
        <Route path="/vaccination/edit/:id" element={<EditVaccinationPage />} />
        <Route path="/farmerpage" element={<FarmerDashboardPage />} />
        <Route path="/farmerappointment" element={<FarmerAppointments />} />
        <Route path="/vetappointment" element={<VetAppointments />} />
        <Route path="/appointments/request" element={<RequestAppointmentPage />} />
        <Route path="/farmer/friends/requests" element={<FriendRequestsPage />} />
        <Route path="/farmer/friends/list" element={<FriendsListPage />} />
        <Route path="/vet/friends/requests" element={<VetFriendRequestsPage />} />
        <Route path="/vet/friends/list" element={<VetFriendsListPage />} />
        <Route path="/farmerinsurancedashboard" element={<Dashboard />} />
        <Route path="/farmerinsuranceplan" element={<InsurancePlans />} />
        <Route path="/farmerinsuranceenroll" element={<EnrollPage />} />
        <Route path="/farmerinsurancesubmitclaim" element={<SubmitClaimPage />} />
        <Route path="/farmerinsurancetrackclaim" element={<TrackClaimPage />} />
        <Route path="/farmerinsurancetrackclaim/:claimId" element={<TrackClaimPage />} />
        <Route path="/admin/insurance" element={<AdminInsurancePage />} />
        <Route path="/profile-transfer/farmer/animals" element={<AnimalListPage />} />
        <Route path="/profile-transfer/farmer/sent" element={<SendTransfersPage />} />
        <Route path="/profile-transfer/receiver/requests" element={<ReceivedRequestsPage />} />
        <Route path="/profile-transfer/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/profile-transfer/admin/review/:transferId" element={<ReviewTransferPage />} />
        <Route path="/vet/dashboard" element={<MainDashboardPage />} />
        <Route path="/vet/farmer-profiles" element={<FarmerProfilesPage />} />
        <Route path="/vet/farmer-details" element={<FarmerDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />

      </Routes>
    </Router>
  )
}

export default App;