import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { verifyPayment } from '../../services/paymentApi';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

const PaymentSuccess = () => {
  const { t } = useTranslation('payment');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isInsurancePayment, setIsInsurancePayment] = useState(false);

  useEffect(() => {
    const verifyPaymentCallback = async () => {
      try {
        // Get parameters from eSewa callback
        const refId = searchParams.get('refId');
        const transactionUuid = searchParams.get('oid');

        if (!refId || !transactionUuid) {
          setError(t('verification.invalidParameters'));
          setVerifying(false);
          return;
        }

        // Verify payment with backend
        const result = await verifyPayment({
          transaction_uuid: transactionUuid,
          ref_id: refId
        });

        if (result.success) {
          setVerificationResult(result);
          
          // Check if this is an insurance enrollment payment (new flow)
          const pendingEnrollment = sessionStorage.getItem('pending_insurance_enrollment');
          
          if (pendingEnrollment) {
            setIsInsurancePayment(true);
            // Don't clear session storage yet - user needs to upload screenshot
            
            // Redirect back to enrollment page to continue with upload step
            setTimeout(() => {
              navigate('/farmer/insurance/enroll', { 
                state: { 
                  paymentSuccess: true,
                  message: 'Payment successful! Please upload your payment screenshot.'
                } 
              });
            }, 2000);
          } else {
            // Check for old insurance flow (backward compatibility)
            const pendingEnrollmentId = sessionStorage.getItem('pending_enrollment_id');
            
            if (pendingEnrollmentId) {
              setIsInsurancePayment(true);
              sessionStorage.removeItem('pending_enrollment_id');
              sessionStorage.removeItem('enrollment_payment_amount');
              
              setTimeout(() => {
                navigate('/farmerinsurancedashboard', { 
                  state: { 
                    paymentSuccess: true,
                    message: 'Payment successful! Your insurance enrollment is confirmed.'
                  } 
                });
              }, 3000);
            } else {
              setIsInsurancePayment(false);
              // Regular appointment payment
              setTimeout(() => {
                navigate('/appointments', { 
                  state: { 
                    paymentSuccess: true,
                    message: 'Payment successful! Your appointment is confirmed.'
                  } 
                });
              }, 3000);
            }
          }
        } else {
          setError(result.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.response?.data?.error || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPaymentCallback();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <FiLoader className="animate-spin text-green-600" size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success.verifying.title')}</h1>
          <p className="text-gray-600">{t('success.verifying.message')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verification.failed.title')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              const pendingEnrollmentId = sessionStorage.getItem('pending_enrollment_id');
              if (pendingEnrollmentId) {
                sessionStorage.removeItem('pending_enrollment_id');
                sessionStorage.removeItem('enrollment_payment_amount');
                navigate('/farmerinsurancedashboard');
              } else {
                navigate('/appointments');
              }
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            {t('verification.failed.button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <FiCheckCircle className="text-green-600" size={64} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success.title')}</h1>
        <p className="text-gray-600 mb-6">
          {isInsurancePayment 
            ? t('success.insuranceMessage')
            : t('success.appointmentMessage')}
        </p>
        
        {verificationResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('success.details.paymentId')}:</span>
                <span className="font-medium text-gray-900">{verificationResult.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('success.details.status')}:</span>
                <span className="font-medium text-green-600">{verificationResult.status}</span>
              </div>
              {verificationResult.esewa_ref_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('success.details.referenceId')}:</span>
                  <span className="font-medium text-gray-900">{verificationResult.esewa_ref_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          {isInsurancePayment 
            ? t('success.redirecting.insurance')
            : t('success.redirecting.appointment')}
        </p>

        <button
          onClick={() => navigate(isInsurancePayment ? '/farmer/insurance/enroll' : '/appointments')}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          {isInsurancePayment ? t('success.buttons.continueEnrollment') : t('success.buttons.goToAppointments')}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
