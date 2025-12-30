
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<AccountCreate />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/landingpage" element={<Page />} />
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

      </Routes>
    </Router>
  )
}

export default App;