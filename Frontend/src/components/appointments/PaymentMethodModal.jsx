import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiDollarSign } from 'react-icons/fi';

const PaymentMethodModal = ({ isOpen, onClose, appointmentData, onPaymentMethodSelect }) => {
  const { t } = useTranslation('payment');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleProceed = async () => {
    if (!selectedMethod) {
      alert(t('paymentMethod.validation.selectMethod'));
      return;
    }

    setIsProcessing(true);
    try {
      await onPaymentMethodSelect(selectedMethod);
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsProcessing(false);
    }
  };

  const appointmentFee = appointmentData?.appointment_fee || 500;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('paymentMethod.title')}</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Appointment Fee Display */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">{t('paymentMethod.appointmentFee')}:</span>
              <span className="text-2xl font-bold text-green-600">Rs. {appointmentFee}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            {/* eSewa Option */}
            <button
              type="button"
              onClick={() => handleMethodSelect('esewa')}
              disabled={isProcessing}
              className={`w-full p-4 border-2 rounded-xl transition flex items-center gap-4 ${
                selectedMethod === 'esewa'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedMethod === 'esewa' ? 'bg-green-600' : 'bg-green-100'
              }`}>
                <span className={`text-lg font-bold ${selectedMethod === 'esewa' ? 'text-white' : 'text-green-600'}`}>
                  {t('paymentMethod.methods.esewa.name')}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">{t('paymentMethod.methods.esewa.name')}</div>
                <div className="text-sm text-gray-600">{t('paymentMethod.methods.esewa.description')}</div>
              </div>
              {selectedMethod === 'esewa' && (
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* Cash Option */}
            <button
              type="button"
              onClick={() => handleMethodSelect('cash')}
              disabled={isProcessing}
              className={`w-full p-4 border-2 rounded-xl transition flex items-center gap-4 ${
                selectedMethod === 'cash'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedMethod === 'cash' ? 'bg-green-600' : 'bg-gray-100'
              }`}>
                <FiDollarSign className={selectedMethod === 'cash' ? 'text-white' : 'text-gray-600'} size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">{t('paymentMethod.methods.cash.name')}</div>
                <div className="text-sm text-gray-600">{t('paymentMethod.methods.cash.description')}</div>
              </div>
              {selectedMethod === 'cash' && (
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Info Message */}
          {selectedMethod === 'cash' && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('paymentMethod.methods.cash.note', { amount: appointmentFee })}</strong>
              </p>
            </div>
          )}

          {selectedMethod === 'esewa' && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('paymentMethod.methods.esewa.note')}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('paymentMethod.buttons.cancel')}
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={!selectedMethod || isProcessing}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? t('paymentMethod.buttons.processing') : t('paymentMethod.buttons.proceed')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
