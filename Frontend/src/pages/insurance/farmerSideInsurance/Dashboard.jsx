import { useState, useEffect } from 'react';
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import StatusBadge from '../../../components/insurance/farmerSideInsurance/dashboard/StatusBadge';
import ClaimCard from '../../../components/insurance/farmerSideInsurance/dashboard/ClaimCard';
import EnrollmentDetailsModal from '../../../components/insurance/farmerSideInsurance/dashboard/EnrollmentDetailsModal';
import { getEnrollments, getMyClaims } from '../../../services/insuranceApi';
import '../../../styles/farmerSideInsurance/dashboard.css';

const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [stats, setStats] = useState({
    totalClaims: 0,
    pending: 0,
    approved: 0,
    totalEnrollments: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollments and claims
      const [enrollmentsResponse, claimsResponse] = await Promise.all([
        getEnrollments(),
        getMyClaims()
      ]);

      // Extract arrays from paginated responses
      const enrollments = enrollmentsResponse.results || enrollmentsResponse;
      const claims = claimsResponse.results || claimsResponse;

      // Transform enrollments into activity format
      const enrollmentActivities = enrollments.map(enrollment => ({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment',
        status: enrollment.status.toLowerCase(),
        date: new Date(enrollment.enrollment_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        title: `Insurance Enrollment - ${enrollment.plan_details?.name || 'Plan'}`,
        description: `Enrolled ${enrollment.livestock_details?.tag_id || enrollment.livestock_details?.id || 'livestock'} (${enrollment.livestock_details?.species_name || 'animal'}) in ${enrollment.plan_details?.name || 'plan'}`,
        timestamp: new Date(enrollment.enrollment_date).getTime()
      }));

      // Transform claims into activity format
      const claimActivities = claims.map(claim => ({
        id: `claim-${claim.id}`,
        type: 'claim',
        status: claim.status.toLowerCase().replace(' ', '-'),
        date: new Date(claim.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        title: `${claim.claim_type} Claim`,
        description: claim.description,
        timestamp: new Date(claim.created_at).getTime()
      }));

      // Combine and sort by timestamp (most recent first)
      const allActivities = [...enrollmentActivities, ...claimActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 4); // Show only 4 most recent

      setRecentActivities(allActivities);

      // Calculate stats
      const pendingClaims = claims.filter(c => 
        c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Pending Verification'
      ).length;
      const approvedClaims = claims.filter(c => 
        c.status === 'Approved' || c.status === 'Paid'
      ).length;

      setStats({
        totalClaims: claims.length,
        pending: pendingClaims,
        approved: approvedClaims,
        totalEnrollments: enrollments.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FarmerLayout pageTitle="Insurance Dashboard">
      {selectedEnrollmentId && (
        <EnrollmentDetailsModal
          enrollmentId={selectedEnrollmentId}
          onClose={() => setSelectedEnrollmentId(null)}
        />
      )}
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
              { label: 'Total Claims', value: stats.totalClaims, status: 'completed', color: 'emerald' },
              { label: 'Pending', value: stats.pending, status: 'pending', color: 'yellow' },
              { label: 'Approved', value: stats.approved, status: 'approved', color: 'emerald' },
              { label: 'Enrollments', value: stats.totalEnrollments, status: 'active', color: 'gray' }
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
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading activities...</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent activities</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentActivities.map((activity) => (
                  <ClaimCard
                    key={activity.id}
                    claimNumber={activity.id}
                    status={activity.status}
                    date={activity.date}
                    title={activity.title}
                    description={activity.description}
                    type={activity.type}
                    id={activity.id}
                    onViewDetails={(id, type) => {
                      if (type === 'enrollment') {
                        // Extract enrollment ID from "enrollment-3" format
                        const enrollmentId = id.split('-')[1];
                        setSelectedEnrollmentId(enrollmentId);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </FarmerLayout>
  );
};

export default Dashboard;
