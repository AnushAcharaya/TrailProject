// components/profileTransfer/farmerSide/animalList/TransferModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import AnimalPreview from './AnimalPreview';
import FarmSearch from './FarmSearch';
import ReasonTextArea from './ReasonTextArea';
import { createTransfer } from '../../../../services/profileTransferApi';

export default function TransferModal({ animal, onClose, onTransferSuccess }) {
  const { t } = useTranslation('profileTransfer');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedFarmer) {
      setError(t('transferModal.errors.selectFarmer'));
      return;
    }

    if (!reason || reason.trim().length < 10) {
      setError(t('transferModal.errors.reasonLength'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create transfer request
      await createTransfer({
        livestock: animal.originalData?.id || animal.id,
        receiver: selectedFarmer.id,
        reason: reason.trim()
      });

      // Success - close modal and refresh
      if (onTransferSuccess) {
        onTransferSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error creating transfer:', err);
      setError(err.response?.data?.message || t('transferModal.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-emerald-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('transferModal.title')}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <AnimalPreview animal={animal} />
          
          <div>
            <FarmSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm}
              onFarmerSelect={handleFarmerSelect}
            />
            {selectedFarmer && (
              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-700">
                  {t('transferModal.selected')}: <span className="font-semibold">{selectedFarmer.full_name || selectedFarmer.email}</span>
                </p>
              </div>
            )}
          </div>
          
          <ReasonTextArea reason={reason} onReasonChange={setReason} />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-emerald-100 bg-emerald-50/50 rounded-b-3xl">
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3.5 px-6 bg-white/80 backdrop-blur-sm hover:bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('transferModal.cancel')}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('transferModal.processing')}</span>
                </>
              ) : (
                t('transferModal.continue')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
