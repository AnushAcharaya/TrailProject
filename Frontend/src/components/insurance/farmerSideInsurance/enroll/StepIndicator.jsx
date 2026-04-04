import { FaCheck } from 'react-icons/fa';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Select Livestock' },
    { number: 2, label: 'Select Plan & Pay' },
    { number: 3, label: 'Upload Proof' },
    { number: 4, label: 'Review & Submit' }
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
