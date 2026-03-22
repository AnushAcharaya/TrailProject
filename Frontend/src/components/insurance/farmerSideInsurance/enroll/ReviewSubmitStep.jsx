import { FaCheck } from 'react-icons/fa';

const ReviewSubmitStep = ({ livestock, plan, onSubmit, onBack, isSubmitting }) => {
  return (
    <div className="form-card">
      <h2 className="form-title">Review & Submit</h2>
      <p className="form-subtitle">Review your enrollment details before submitting.</p>

      <div className="review-section">
        <div className="review-section-title">Selected Livestock</div>
        <div className="review-row">
          <span className="review-label">Name:</span>
          <span className="review-value">{livestock?.name || 'N/A'}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Type:</span>
          <span className="review-value">{livestock?.type || 'N/A'}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Tag:</span>
          <span className="review-value">{livestock?.tag || 'N/A'}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Breed:</span>
          <span className="review-value">{livestock?.breed || 'N/A'}</span>
        </div>
      </div>

      <div className="review-section">
        <div className="review-section-title">Selected Plan</div>
        <div className="review-row">
          <span className="review-label">{plan?.name || 'N/A'}</span>
          <span className="review-value text-emerald-600">NPR {plan?.premium_amount || plan?.price || 0}</span>
        </div>
        <div className="review-row">
          <span className="review-label">{plan?.description || ''}</span>
        </div>
      </div>

      <div className="premium-box">
        <div className="premium-title">Total Premium</div>
        <div className="premium-amount">NPR {plan?.premium_amount || plan?.price || 0}</div>
        <div className="coverage-period">Coverage period: 12 months</div>
      </div>

      <div className="btn-container">
        <button className="btn-back" onClick={onBack} disabled={isSubmitting}>
          ← Back
        </button>
        <button className="btn-submit" onClick={onSubmit} disabled={isSubmitting}>
          <FaCheck className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
