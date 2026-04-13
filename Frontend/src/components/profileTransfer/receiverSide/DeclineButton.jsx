// components/profile-transfer/receiver-side/received-requests/components/DeclineButton.jsx
import { useTranslation } from 'react-i18next';

export default function DeclineButton({ onClick, loading }) {
  const { t } = useTranslation('profileTransfer');

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>{t('common.loading')}</span>
        </>
      ) : (
        <>
          <span>✕</span>
          <span>{t('requestCard.decline')}</span>
        </>
      )}
    </button>
  );
}
