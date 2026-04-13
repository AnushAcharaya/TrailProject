import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import DashboardCards from "../components/AdminCards";
import StatsSection from "../components/AdminStats";
import FilterBar from "../components/AdminSearch";
import AccountCard from "../components/AdminVerify";
import { fetchAllUsers, approveUser, declineUser } from "../services/api";

const AdminPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, declined

  // Add gray background to body when component mounts
  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

  // Fetch users from backend
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const response = await fetchAllUsers();
    if (response.success) {
      setUsers(response.data.users || []);
    } else {
      console.error('Failed to fetch users:', response.error);
      alert('Failed to load users. Please try again.');
    }
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    const response = await approveUser(userId);
    if (response.success) {
      // Reload users to get updated status
      await loadUsers();
      return true;
    } else {
      alert('Failed to approve user: ' + (response.error.error || response.error.message));
      return false;
    }
  };

  const handleDecline = async (userId) => {
    const response = await declineUser(userId);
    if (response.success) {
      // Reload users to get updated status
      await loadUsers();
      return true;
    } else {
      alert('Failed to decline user: ' + (response.error.error || response.error.message));
      return false;
    }
  };

  // Filter users based on status and show only recent 5 registrations
  const filteredUsers = users
    .filter(user => {
      if (filter === 'all') return true;
      return user.status.toLowerCase() === filter;
    })
    .slice(0, 5); // Show only the first 5 users

  // Transform backend data to match component format
  const transformUserData = (user) => ({
    id: user.id,
    name: user.name,
    role: user.role.charAt(0).toUpperCase() + user.role.slice(1), // Capitalize
    status: user.status.charAt(0).toUpperCase() + user.status.slice(1), // Capitalize
    phone: user.phone,
    email: user.email,
    address: user.address,
    farmName: user.farmName || 'N/A',
    specialization: user.specialization || 'N/A',
    submittedDate: user.submittedDate,
    documents: [
      ...(user.nid_photo_url ? [{
        name: "National ID Card",
        type: "Image",
        size: "N/A",
        url: user.nid_photo_url
      }] : []),
      ...(user.certificate_photo_url ? [{
        name: "Certificate",
        type: "Image",
        size: "N/A",
        url: user.certificate_photo_url
      }] : [])
    ]
  });

  return (
    <Layout>
      <DashboardCards />
      <StatsSection />
      
      {/* Recent Registrations Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('dashboard.recentRegistrations.title')}</h2>
            <p className="text-gray-600 text-sm mt-1">{t('dashboard.recentRegistrations.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/admin/account-verifications')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            {t('dashboard.recentRegistrations.viewAll')}
          </button>
        </div>
      </div>

      <FilterBar onFilterChange={setFilter} currentFilter={filter} />
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">{t('dashboard.recentRegistrations.loading')}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">{t('dashboard.recentRegistrations.noRegistrations')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <AccountCard 
              key={user.id}
              data={transformUserData(user)}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default AdminPage;