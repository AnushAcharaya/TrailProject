import AdminInsuranceDashboard from '../../../components/insurance/adminSideInsurance/AdminInsuranceDashboard';
import AdminTopNav from '../../../components/AdminTopNav';
import AdminSideNav from '../../../components/AdminSideNav';
import { useState } from 'react';

const AdminInsurance = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopNav toggleSidebar={toggleSidebar} />
      <AdminSideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="md:ml-64 pt-16">
        <AdminInsuranceDashboard />
      </div>
    </div>
  );
};

export default AdminInsurance;
