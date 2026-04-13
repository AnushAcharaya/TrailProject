// components/profile-transfer/admin-side/dashboard/components/TransferTable.jsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import StatusTag from './StatusTag';

export default function TransferTable({ data, onUpdate }) {
  const { t } = useTranslation('profileTransfer');
  const navigate = useNavigate();

  const handleReview = (transfer) => {
    // Navigate to review page with transfer ID
    navigate(`/profile-transfer/admin/review/${transfer.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{t('adminDashboard.title')}</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('transferTable.headers.animalTag')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('transferTable.headers.from')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('transferTable.headers.to')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('transferTable.headers.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('transferTable.headers.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('transferTable.headers.action')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.animalTag}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row.from}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row.to}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusTag status={row.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {row.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleReview(row)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                  >
                    {t('transferTable.review')} →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
