import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getClaims, updateClaimStatus } from '../../../services/insuranceApi';
import { FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ClaimInsurances = () => {
  const { t } = useTranslation('insurance');
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
    return <div className="text-center py-8">{t('admin.claims.loading')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('admin.claims.title')}</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">{t('admin.claims.filters.all')}</option>
          <option value="Submitted">{t('admin.claims.filters.submitted')}</option>
          <option value="Under Review">{t('admin.claims.filters.underReview')}</option>
          <option value="Approved">{t('admin.claims.filters.approved')}</option>
          <option value="Rejected">{t('admin.claims.filters.rejected')}</option>
          <option value="Paid">{t('admin.claims.filters.paid')}</option>
        </select>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('admin.claims.noClaims')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.claimId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.farmer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.claims.table.actions')}
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
                      <FaEye /> {t('admin.claims.table.view')}
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
                <h3 className="text-2xl font-bold text-gray-800">{t('admin.claims.modal.title')}</h3>
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
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.claimId')}</label>
                    <p className="text-gray-900">#{selectedClaim.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.status')}</label>
                    <p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClaim.status)}`}>
                        {selectedClaim.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.farmer')}</label>
                    <p className="text-gray-900">{selectedClaim.farmer_details?.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.claimType')}</label>
                    <p className="text-gray-900">{selectedClaim.claim_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.claimAmount')}</label>
                    <p className="text-gray-900">NPR {selectedClaim.claim_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.incidentDate')}</label>
                    <p className="text-gray-900">{new Date(selectedClaim.incident_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.incidentLocation')}</label>
                  <p className="text-gray-900">{selectedClaim.incident_location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.description')}</label>
                  <p className="text-gray-900">{selectedClaim.description}</p>
                </div>

                {selectedClaim.incident_image && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">{t('admin.claims.modal.incidentImage')}</label>
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
                        {t('admin.claims.modal.viewDownloadImage')}
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
                    <label className="text-sm font-medium text-gray-500 block mb-2">{t('admin.claims.modal.vaccinationHistory')}</label>
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
                        {t('admin.claims.modal.viewDownloadVaccination')}
                      </a>
                    </div>
                  </div>
                )}

                {selectedClaim.medical_history && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-2">{t('admin.claims.modal.medicalHistory')}</label>
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
                        {t('admin.claims.modal.viewDownloadMedical')}
                      </a>
                    </div>
                  </div>
                )}

                {selectedClaim.admin_notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">{t('admin.claims.modal.adminNotes')}</label>
                    <p className="text-gray-900">{selectedClaim.admin_notes}</p>
                  </div>
                )}

                {/* Admin Actions - Can approve/reject at any status except already approved/rejected/paid */}
                {!['Approved', 'Rejected', 'Paid'].includes(selectedClaim.status) && (
                  <div className="border-t pt-4 mt-6">
                    <label className="text-sm font-medium text-gray-500 block mb-2">{t('admin.claims.modal.adminActions')}</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Approved')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> {t('admin.claims.modal.approveClaim')}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Rejected')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FaTimesCircle /> {t('admin.claims.modal.rejectClaim')}
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
