// components/profile-transfer/farmer-side/send-transfer/components/AnimalDetail.jsx
import { useTranslation } from 'react-i18next';

export default function AnimalDetail({ animal, recipient, reason }) {
  const { t } = useTranslation('profileTransfer');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200/50">
      <div className="space-y-3">
        <img 
          src={animal.image} 
          alt={animal.name}
          className="w-full max-w-sm mx-auto rounded-2xl shadow-lg object-cover"
        />
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">{animal.name}</h3>
          <p className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full inline-block mt-2">
            {animal.tag}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700 mb-2">{t('transferItem.to')}</p>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
            <h4 className="font-bold text-lg text-gray-900">{recipient || t('common.noData')}</h4>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-semibold text-emerald-700 mb-2">{t('transferItem.reason')}</p>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 min-h-[80px] flex items-center">
            <p className="text-gray-700 leading-relaxed">
              {reason || t('transferModal.reasonPlaceholder')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
