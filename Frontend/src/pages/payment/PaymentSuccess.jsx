import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { verifyPayment } from '../../services/paymentApi';
import { createAppointment } from '../../services/appointmentApi';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import { tStatus } from '../../utils/translateEnum';
import { useLocalizedNumber } from '../../utils/formatNumber';

const PaymentSuccess = () => {
  const { t } = useTranslation('payment');
  const { t: tCommon } = useTranslation('common');
  const fmt = useLocalizedNumber();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isInsurancePayment, setIsInsurancePayment] = useState(false);
  const [isAppointmentPayment, setIsAppointmentPayment] = useState(false);

  useEffect(() => {
    const verifyPaymentCallback = async () => {
      try {
        // eSewa v2 returns ALL fields in a single base64-encoded `data` query
        // parameter. The decoded JSON looks like:
        //   {
        //     "transaction_code": "000AWEO",
        //     "status": "COMPLETE",
        //     "total_amount": "100.0",
        //     "transaction_uuid": "ab14a8f2",
        //     "product_code": "EPAYTEST",
        //     "signed_field_names": "...",
        //     "signature": "..."
        //   }
        const dataParam = searchParams.get('data');

        // Backwards-compat: in case anything still passes the old v1 query shape
        const legacyRefId = searchParams.get('refId');
        const legacyTxnUuid = searchParams.get('oid');

        let transactionUuid = null;
        let refId = null;

        if (dataParam) {
          try {
            const decoded = JSON.parse(atob(dataParam));
            transactionUuid = decoded.transaction_uuid;
            refId = decoded.transaction_code;

            // If eSewa explicitly says it failed, surface the message immediately.
            if (decoded.status && decoded.status !== 'COMPLETE') {
              setError(`Payment status from eSewa: ${decoded.status}`);
              setVerifying(false);
              return;
            }
          } catch (decodeErr) {
            console.error('Failed to decode eSewa data param:', decodeErr);
            setError(t('verification.invalidParameters'));
            setVerifying(false);
            return;
          }
        } else if (legacyRefId && legacyTxnUuid) {
          transactionUuid = legacyTxnUuid;
          refId = legacyRefId;
        }

        if (!transactionUuid) {
          setError(t('verification.invalidParameters'));
          setVerifying(false);
          return;
        }

        // Verify payment with backend (backend will hit eSewa v2 status API
        // and fetch the authoritative ref_id from there)
        const result = await verifyPayment({
          transaction_uuid: transactionUuid,
          ref_id: refId || '',
        });

        if (result.success) {
          setVerificationResult(result);

          const pendingEnrollment = sessionStorage.getItem('pending_insurance_enrollment');
          const legacyEnrollment = sessionStorage.getItem('pending_enrollment_id');
          const pendingAppointment = sessionStorage.getItem('pending_appointment_data');

          if (pendingEnrollment || legacyEnrollment) {
            setIsInsurancePayment(true);
            if (legacyEnrollment) {
              sessionStorage.removeItem('pending_enrollment_id');
              sessionStorage.removeItem('enrollment_payment_amount');
            }
          } else if (pendingAppointment) {
            // eSewa payment succeeded — now create the appointment
            try {
              const appointmentData = JSON.parse(pendingAppointment);
              await createAppointment(appointmentData);
            } catch (apptErr) {
              console.error('Failed to create appointment after payment:', apptErr);
            } finally {
              sessionStorage.removeItem('pending_appointment_data');
            }
            setIsAppointmentPayment(true);
          } else {
            setIsInsurancePayment(false);
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
                <span className="font-medium text-gray-900">{fmt(verificationResult.payment_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('success.details.status')}:</span>
                <span className="font-medium text-green-600">{tStatus(tCommon, verificationResult.status)}</span>
              </div>
              {verificationResult.esewa_ref_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('success.details.referenceId')}:</span>
                  <span className="font-medium text-gray-900">{fmt(verificationResult.esewa_ref_id)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next-step hint — different text for insurance vs appointment */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          {isInsurancePayment ? (
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">Next step:</span> upload a screenshot
              of your eSewa receipt so we can finalise your enrollment.
            </p>
          ) : (
            <div className="text-sm text-amber-800 leading-relaxed space-y-2">
              <p>
                <span className="font-semibold">What happens next:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Your appointment has been booked successfully.</li>
                <li>Your veterinarian will <span className="font-semibold">review and confirm</span> the date and time shortly.</li>
                <li>You'll receive a notification when they accept or suggest a different time.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Primary action — view the booking */}
        <button
          onClick={() =>
            navigate(
              isInsurancePayment ? '/farmerinsuranceenroll' : '/farmerappointment',
              {
                state: {
                  paymentSuccess: true,
                  appointmentCreated: isAppointmentPayment,
                  refreshKey: Date.now(),
                },
              }
            )
          }
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center justify-center gap-2 mb-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {isInsurancePayment
            ? 'Back to Upload Payment Screenshot'
            : 'View My Appointments'}
        </button>

        {/* Secondary — different by flow */}
        {isInsurancePayment ? (
          <button
            onClick={() => navigate('/farmerinsurancedashboard')}
            className="w-full px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            Go to Insurance Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate('/appointments/request')}
            className="w-full px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            Book Another Appointment
          </button>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;
