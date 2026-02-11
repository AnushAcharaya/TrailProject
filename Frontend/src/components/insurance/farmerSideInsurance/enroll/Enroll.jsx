import { useState } from 'react';
import StepIndicator from './StepIndicator';
import SelectLivestockStep from './SelectLivestockStep';
import SelectPlanStep from './SelectPlanStep';
import ReviewSubmitStep from './ReviewSubmitStep';

const Enroll = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLivestock, setSelectedLivestock] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Enrollment submitted:', {
      livestock: selectedLivestock,
      plan: selectedPlan
    });
    alert('Enrollment submitted successfully!');
  };

  return (
    <div className="step-container">
      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <SelectLivestockStep
          livestock={selectedLivestock}
          onLivestockSelect={setSelectedLivestock}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 2 && (
        <SelectPlanStep
          plan={selectedPlan}
          onPlanSelect={setSelectedPlan}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <ReviewSubmitStep
          livestock={selectedLivestock}
          plan={selectedPlan}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default Enroll;
