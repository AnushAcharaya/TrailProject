import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import StatusBadge from '../../../components/insurance/farmerSideInsurance/dashboard/StatusBadge';
import ClaimCard from '../../../components/insurance/farmerSideInsurance/dashboard/ClaimCard';
import { FaChartBar } from 'react-icons/fa';
import '../../../styles/farmerSideInsurance/dashboard.css';

const Dashboard = () => {
  const recentClaims = [
    {
      id: '001',
      status: 'approved',
      date: 'Jul 15, 2025',
      title: 'Crop Damage Claim',
      description: 'Lightning strike damaged corn crops across 2 acres during monsoon season.'
    },
    {
      id: '002',
      status: 'pending',
      date: 'Jul 12, 2025',
      title: 'Livestock Accident Claim',
      description: 'Cow slipped and broke leg during transport to market. Vet treatment required.'
    },
    {
      id: '003',
      status: 'completed',
      date: 'Jul 10, 2025',
      title: 'Flood Damage Claim',
      description: 'River overflow destroyed rice paddy field. Immediate replanting needed.'
    },
    {
      id: '004',
      status: 'pending',
      date: 'Jul 08, 2025',
      title: 'Pest Infestation Claim',
      description: 'Locust swarm destroyed vegetable crops. Pesticide treatment applied.'
    }
  ];

  return (
    <FarmerLayout pageTitle="Insurance Dashboard">
      <div className="dashboard-container">
        <main className="px-6 py-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <section className="section-card mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="welcome-title">Welcome back, Farmer!</h1>
                <p className="text-gray-600 text-lg">Manage your insurance claims and coverage</p>
              </div>
              <StatusBadge status="approved" size="large" />
            </div>
          </section>

          {/* Status Indicators */}
          <section className="grid grid-cols-4 gap-6 mb-8">
            {[
              { icon: FaChartBar, label: 'Claims', value: 3, status: 'completed', color: 'emerald' },
              { icon: FaChartBar, label: 'Pending', value: 3, status: 'pending', color: 'yellow' },
              { icon: FaChartBar, label: 'Approved', value: 2, status: 'approved', color: 'emerald' },
              { icon: FaChartBar, label: 'Total', value: 1, status: 'pending', color: 'gray' }
            ].map((item, idx) => (
              <div key={idx} className="section-card p-6 text-center">
                <div className="flex justify-center mb-4">
                  <StatusBadge status={item.status} size="large" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">{item.label}</div>
              </div>
            ))}
          </section>

          {/* Recent Insurance Activities */}
          <section className="section-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Recent Insurance Activities
              </h2>
              <button className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-2">
                See All <span>→</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claimNumber={claim.id}
                  status={claim.status}
                  date={claim.date}
                  title={claim.title}
                  description={claim.description}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </FarmerLayout>
  );
};

export default Dashboard;
