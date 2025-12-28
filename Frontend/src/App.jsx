
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

      </Routes>
    </Router>
  )
}

export default App;