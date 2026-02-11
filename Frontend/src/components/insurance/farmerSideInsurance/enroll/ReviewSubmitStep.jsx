import { FaCheck } from 'react-icons/fa';

const ReviewSubmitStep = ({ livestock, plan, onSubmit, onBack }) => {
  return (
    <div className="form-card">
      <h2 className="form-title">Review & Submit</h2>
      <p className="form-subtitle">Review your enrollment details before submitting.</p>

      <div className="review-section">
        <div className="review-section-title">Selected Livestock</div>
        <div className="review-row">
          <span className="review-label">Name:</span>
          <span className="review-value">{livestock.name}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Type:</span>
          <span className="review-value">{livestock.type}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Tag:</span>
          <span className="review-value">{livestock.tag}</span>
        </div>
        <div className="review-row">
          <span className="review-label">Breed:</span>
          <span className="review-value">{livestock.breed}</span>
        </div>
      </div>

      <div className="review-section">
        <div className="review-section-title">Selected Plan</div>
        <div className="review-row">
          <span className="review-label">{plan.name}</span>
          <span className="review-value text-emerald-600">${plan.price}</span>
        </div>
        <div className="review-row">
          <span className="review-label">{plan.description}</span>
        </div>
      </div>

      <div className="premium-box">
        <div className="premium-title">Total Premium</div>
        <div className="premium-amount">${plan.price}</div>
        <div className="coverage-period">Coverage period: 12 months</div>
      </div>

      <div className="btn-container">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-submit" onClick={onSubmit}>
          <FaCheck className="w-4 h-4" />
          Submit Enrollment
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
