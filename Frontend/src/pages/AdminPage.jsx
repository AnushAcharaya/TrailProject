import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DashboardCards from "../components/AdminCards";
import StatsSection from "../components/AdminStats";
import FilterBar from "../components/AdminSearch";
import AccountCard from "../components/AdminVerify";
import { fetchAllUsers, approveUser, declineUser } from "../services/api";

const AdminPage = () => {
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

  // Filter users based on status
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status.toLowerCase() === filter;
  });

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
      <FilterBar onFilterChange={setFilter} currentFilter={filter} />
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No users found.</p>
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