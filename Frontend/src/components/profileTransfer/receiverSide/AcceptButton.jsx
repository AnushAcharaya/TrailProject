// components/profile-transfer/farmer-side/send-transfer/components/AcceptButton.jsx
import { useTranslation } from 'react-i18next';

export default function AcceptButton({ onClick, loading }) {
  const { t } = useTranslation('profileTransfer');

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>{t('common.loading')}</span>
        </>
      ) : (
        <>
          <span>✓</span>
          <span>{t('requestCard.accept')}</span>
        </>
      )}
    </button>
  );
}
