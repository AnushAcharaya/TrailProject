// components/profile-transfer/farmer-side/send-transfer/components/TransferItem.jsx
import { useTranslation } from 'react-i18next';
import { FaEye } from 'react-icons/fa';
import AvatarImage from './AvatarImage';
import StatusBadge from './StatusBadge';

export default function TransferItem({ transfer, onClick }) {
  const { t } = useTranslation('profileTransfer');
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <AvatarImage src={transfer.avatar} name={transfer.farmer} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {transfer.farmer} <span className="text-gray-500 font-normal text-sm">({transfer.tag})</span>
            </h3>
            <p className="text-sm text-gray-600">{t('transferItem.to')}: {transfer.recipient}</p>
            <p className="text-xs text-gray-500 mt-1">{transfer.time}</p>
          </div>
          <StatusBadge status={transfer.status} />
          <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaEye className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{t('transferItem.viewDetails')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
