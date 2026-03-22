import { useState, useEffect } from 'react';
import { getEnrollments, updateEnrollment } from '../../../services/insuranceApi';
import { FaCheckCircle, FaClock, FaTimesCircle, FaHourglassHalf, FaEye } from 'react-icons/fa';

const EnrollmentInsurances = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      console.log('Fetching enrollments for admin...');
      const data = await getEnrollments();
      console.log('Enrollments API response:', data);
      
      // Handle paginated response - data.results contains the array
      const enrollmentsArray = data.results || data;
      console.log('Enrollments array:', enrollmentsArray);
      console.log('Count:', enrollmentsArray.length);
      
      setEnrollments(Array.isArray(enrollmentsArray) ? enrollmentsArray : []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.error('AUTHENTICATION ERROR: Token is invalid or expired. Please logout and login again.');
        alert('Your session has expired. Please logout and login again.');
      }
      
      setEnrollments([]);
    }
    setLoading(false);
  };

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    setUpdating(true);
    try {
      await updateEnrollment(enrollmentId, { status: newStatus });
      await fetchEnrollments();
      setShowModal(false);
      setSelectedEnrollment(null);
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      alert('Failed to update enrollment status');
    }
    setUpdating(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <FaCheckCircle className="text-green-500" />;
      case 'Pending':
        return <FaHourglassHalf className="text-yellow-500" />;
      case 'Expired':
        return <FaClock className="text-gray-500" />;
      case 'Cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = filter === 'all' 
    ? enrollments 
    : enrollments.filter(e => e.status === filter);

  if (loading) {
    return <div className="text-center py-8">Loading enrollments...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Enrollment Insurances</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No enrollments found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livestock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.farmer_details?.full_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.farmer_details?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {enrollment.livestock_details?.tag_id || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {enrollment.livestock_details?.species_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.plan_details?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NPR {enrollment.plan_details?.coverage_amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.start_date).toLocaleDateString()} - {new Date(enrollment.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                      {getStatusIcon(enrollment.status)}
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewEnrollment(enrollment)}
                      className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enrollment Details Modal */}
      {showModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Enrollment Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Enrollment ID</label>
                    <p className="text-gray-900">#{selectedEnrollment.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEnrollment.status)}`}>
                        {getStatusIcon(selectedEnrollment.status)}
                        {selectedEnrollment.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Farmer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedEnrollment.farmer_details?.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedEnrollment.farmer_details?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedEnrollment.farmer_details?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Livestock Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tag ID</label>
                      <p className="text-gray-900">{selectedEnrollment.livestock_details?.tag_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Species</label>
                      <p className="text-gray-900">{selectedEnrollment.livestock_details?.species_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Breed</label>
                      <p className="text-gray-900">{selectedEnrollment.livestock_details?.breed_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Age</label>
                      <p className="text-gray-900">{selectedEnrollment.livestock_details?.age || 'N/A'} years</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Insurance Plan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plan Name</label>
                      <p className="text-gray-900">{selectedEnrollment.plan_details?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plan Type</label>
                      <p className="text-gray-900 capitalize">{selectedEnrollment.plan_details?.plan_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Coverage Amount</label>
                      <p className="text-gray-900">NPR {selectedEnrollment.plan_details?.coverage_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Premium Paid</label>
                      <p className="text-gray-900">NPR {selectedEnrollment.premium_paid?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Coverage Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-gray-900">{new Date(selectedEnrollment.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <p className="text-gray-900">{new Date(selectedEnrollment.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                      <p className="text-gray-900">{new Date(selectedEnrollment.enrollment_date).toLocaleDateString()}</p>
                    </div>
                    {selectedEnrollment.payment_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Payment Date</label>
                        <p className="text-gray-900">{new Date(selectedEnrollment.payment_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEnrollment.notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-gray-900">{selectedEnrollment.notes}</p>
                  </div>
                )}

                {selectedEnrollment.status === 'Pending' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleUpdateStatus(selectedEnrollment.id, 'Active')}
                      disabled={updating}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle /> {updating ? 'Approving...' : 'Approve Enrollment'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedEnrollment.id, 'Cancelled')}
                      disabled={updating}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle /> {updating ? 'Rejecting...' : 'Reject Enrollment'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentInsurances;
