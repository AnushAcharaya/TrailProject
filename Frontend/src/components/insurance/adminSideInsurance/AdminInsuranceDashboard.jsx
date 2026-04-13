import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnrollmentInsurances from './EnrollmentInsurances';
import ClaimInsurances from './ClaimInsurances';

const AdminInsuranceDashboard = () => {
  const { t } = useTranslation('insurance');
  const [activeTab, setActiveTab] = useState('enrollments');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('admin.dashboard.title')}</h1>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'enrollments'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t('admin.dashboard.tabs.enrollments')}
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'claims'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t('admin.dashboard.tabs.claims')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'enrollments' ? <EnrollmentInsurances /> : <ClaimInsurances />}
        </div>
      </div>
    </div>
  );
};

export default AdminInsuranceDashboard;
