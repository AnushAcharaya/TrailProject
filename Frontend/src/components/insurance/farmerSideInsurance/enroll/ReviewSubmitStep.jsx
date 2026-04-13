import { FaCheck, FaImage } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ReviewSubmitStep = ({ livestock, plan, paymentProof, onSubmit, onBack, isSubmitting }) => {
  const { t } = useTranslation('insurance');
  
  return (
    <div className="form-card">
      <h2 className="form-title">{t('enroll.review.title')}</h2>
      <p className="form-subtitle">{t('enroll.review.subtitle')}</p>

      <div className="review-section">
        <div className="review-section-title">{t('enroll.review.selectedLivestock')}</div>
        <div className="review-row">
          <span className="review-label">{t('enroll.review.name')}:</span>
          <span className="review-value">{livestock?.name || 'N/A'}</span>
        </div>
        <div className="review-row">
          <span className="review-label">{t('enroll.review.type')}:</span>
          <span className="review-value">{livestock?.type || 'N/A'}</span>
        </div>
        <div className="review-row">
          <span className="review-label">{t('enroll.review.tag')}:</span>
          <span className="review-value">{livestock?.tag || 'N/A'}</span>
        </div>
        <div className="review-row">
          <span className="review-label">{t('enroll.review.breed')}:</span>
          <span className="review-value">{livestock?.breed || 'N/A'}</span>
        </div>
      </div>

      <div className="review-section">
        <div className="review-section-title">{t('enroll.review.selectedPlan')}</div>
        <div className="review-row">
          <span className="review-label">{plan?.name || 'N/A'}</span>
          <span className="review-value text-emerald-600">NPR {plan?.premium_amount || plan?.price || 0}</span>
        </div>
        <div className="review-row">
          <span className="review-label">{plan?.description || ''}</span>
        </div>
      </div>

      <div className="review-section">
        <div className="review-section-title">{t('enroll.review.paymentProof')}</div>
        {paymentProof?.preview ? (
          <div className="payment-proof-preview">
            <FaImage className="text-emerald-600 mb-2" />
            <img
              src={paymentProof.preview}
              alt={t('enroll.review.paymentProofAlt')}
              className="payment-proof-image"
            />
            <p className="text-sm text-gray-600 mt-2">{t('enroll.review.screenshotUploaded')}</p>
          </div>
        ) : (
          <p className="text-gray-500">{t('enroll.review.noPaymentProof')}</p>
        )}
      </div>

      <div className="premium-box">
        <div className="premium-title">{t('enroll.review.totalPremium')}</div>
        <div className="premium-amount">NPR {plan?.premium_amount || plan?.price || 0}</div>
        <div className="coverage-period">{t('enroll.review.coveragePeriod')}</div>
      </div>

      <div className="btn-container">
        <button className="btn-back" onClick={onBack} disabled={isSubmitting}>
          {t('enroll.review.back')}
        </button>
        <button className="btn-submit" onClick={onSubmit} disabled={isSubmitting}>
          <FaCheck className="w-4 h-4" />
          {isSubmitting ? t('enroll.review.submitting') : t('enroll.review.submitEnrollment')}
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
