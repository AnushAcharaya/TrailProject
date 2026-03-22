import { useState, useEffect } from 'react';
import { getClaims, updateClaimStatus } from '../../../services/insuranceApi';
import { FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ClaimInsurances = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      console.log('Fetching claims...');
      const data = await getClaims();
      console.log('Claims fetched:', data);
      
      // Handle paginated response - data.results contains the array
      const claimsArray = data.results || data;
      console.log('Claims array:', claimsArray);
      
      setClaims(Array.isArray(claimsArray) ? claimsArray : []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setClaims([]);
    }
    setLoading(false);
  };

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      await updateClaimStatus(claimId, { status: newStatus });
      fetchClaims();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Paid': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredClaims = filter === 'all' 
    ? claims 
    : claims.filter(c => c.status === filter);

  if (loading) {
    return <div className="text-center py-8">Loading claims...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Claim Insurances</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No claims found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{claim.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {claim.farmer_details?.full_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {claim.farmer_details?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.claim_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NPR {claim.claim_amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(claim.incident_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewClaim(claim)}
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

      {/* Claim Details Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Claim Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Claim ID</label>
                    <p className="text-gray-900">#{selectedClaim.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClaim.status)}`}>
                        {selectedClaim.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Farmer</label>
                    <p className="text-gray-900">{selectedClaim.farmer_details?.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Claim Type</label>
                    <p className="text-gray-900">{selectedClaim.claim_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Claim Amount</label>
                    <p className="text-gray-900">NPR {selectedClaim.claim_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Incident Date</label>
                    <p className="text-gray-900">{new Date(selectedClaim.incident_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Incident Location</label>
                  <p className="text-gray-900">{selectedClaim.incident_location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{selectedClaim.description}</p>
                </div>

                {selectedClaim.incident_image && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Incident Image</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <a
                        href={selectedClaim.incident_image.startsWith('http') ? selectedClaim.incident_image : `http://localhost:8000${selectedClaim.incident_image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                        </svg>
                        View/Download Incident Image
                      </a>
                      {selectedClaim.incident_image.match(/\.(jpg|jpeg|png|gif)$/i) && (
                        <div className="mt-3">
                          <img
                            src={selectedClaim.incident_image.startsWith('http') ? selectedClaim.incident_image : `http://localhost:8000${selectedClaim.incident_image}`}
                            alt="Incident image"
                            className="max-w-full h-auto rounded-lg border border-gray-200"
                            style={{ maxHeight: '400px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedClaim.vaccination_history && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Vaccination History</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <a
                        href={selectedClaim.vaccination_history.startsWith('http') ? selectedClaim.vaccination_history : `http://localhost:8000${selectedClaim.vaccination_history}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View/Download Vaccination History
                      </a>
                    </div>
                  </div>
                )}

                {selectedClaim.medical_history && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Medical History</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <a
                        href={selectedClaim.medical_history.startsWith('http') ? selectedClaim.medical_history : `http://localhost:8000${selectedClaim.medical_history}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View/Download Medical History
                      </a>
                    </div>
                  </div>
                )}

                {selectedClaim.admin_notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                    <p className="text-gray-900">{selectedClaim.admin_notes}</p>
                  </div>
                )}

                {/* Admin Actions - Can approve/reject at any status except already approved/rejected/paid */}
                {!['Approved', 'Rejected', 'Paid'].includes(selectedClaim.status) && (
                  <div className="border-t pt-4 mt-6">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Admin Actions</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Approved')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> Approve Claim
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Rejected')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle /> Reject Claim
                      </button>
                    </div>
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

export default ClaimInsurances;
