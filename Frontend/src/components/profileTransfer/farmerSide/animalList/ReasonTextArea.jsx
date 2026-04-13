// components/profile-transfer/farmer-side/animal-list/components/ReasonTextarea.jsx
import { useTranslation } from 'react-i18next';

export default function ReasonTextarea({ reason, onReasonChange }) {
  const { t } = useTranslation('profileTransfer');
  
  return (
    <div className="relative">
      <textarea
        placeholder={t('transferModal.reasonPlaceholder')}
        rows={3}
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="w-full p-4 bg-white/80 backdrop-blur-md border-2 border-emerald-200 rounded-2xl text-lg placeholder-emerald-400 resize-none focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200 shadow-sm hover:shadow-md"
      />
    </div>
  );
}
