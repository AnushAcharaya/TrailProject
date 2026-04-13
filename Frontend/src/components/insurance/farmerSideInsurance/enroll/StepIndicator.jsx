import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const StepIndicator = ({ currentStep }) => {
  const { t } = useTranslation('insurance');
  
  const steps = [
    { number: 1, label: t('enroll.steps.selectLivestock') },
    { number: 2, label: t('enroll.steps.selectPlan') },
    { number: 3, label: t('enroll.steps.uploadProof') },
    { number: 4, label: t('enroll.steps.reviewSubmit') }
  ];

  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="step-indicator-container">
      <div className="step-progress-bar">
        <div className="step-progress-fill" style={{ width: `${progressWidth}%` }} />
      </div>

      {steps.map((step) => (
        <div key={step.number} className="step-item">
          <div
            className={`step-badge ${
              currentStep > step.number
                ? 'completed'
                : currentStep === step.number
                ? 'active'
                : 'inactive'
            }`}
          >
            {currentStep > step.number ? (
              <FaCheck className="w-5 h-5" />
            ) : (
              step.number
            )}
          </div>
          <span
            className={`step-label ${currentStep === step.number ? 'active' : ''}`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
