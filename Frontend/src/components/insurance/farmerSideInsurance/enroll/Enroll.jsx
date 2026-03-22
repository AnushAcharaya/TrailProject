import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import SelectLivestockStep from './SelectLivestockStep';
import SelectPlanStep from './SelectPlanStep';
import ReviewSubmitStep from './ReviewSubmitStep';
import Toast from '../../../common/Toast';
import { createEnrollment } from '../../../../services/insuranceApi';

const Enroll = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLivestock, setSelectedLivestock] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if a plan was pre-selected from the plan cards page
  useEffect(() => {
    if (location.state?.preSelectedPlan) {
      setSelectedPlan(location.state.preSelectedPlan);
    }
  }, [location.state]);

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

  const handleSubmit = async () => {
    if (!selectedLivestock || !selectedPlan) {
      setToast({
        message: 'Please select both livestock and plan',
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate dates (start today, end in 12 months)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Prepare enrollment data
      const enrollmentData = {
        livestock: selectedLivestock.id,
        plan: selectedPlan.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        premium_paid: selectedPlan.premium_amount || selectedPlan.price,
        payment_date: startDate.toISOString().split('T')[0],
        notes: `Enrolled ${selectedLivestock.tag || selectedLivestock.tag_number || selectedLivestock.id} in ${selectedPlan.name}`
      };

      console.log('Submitting enrollment:', enrollmentData);

      // Create enrollment via API
      await createEnrollment(enrollmentData);

      // Show success toast
      setToast({
        message: 'Enrollment submitted successfully!',
        type: 'success'
      });

      // Navigate to insurance dashboard after a short delay
      setTimeout(() => {
        navigate('/farmerinsurancedashboard');
      }, 1500);

    } catch (error) {
      console.error('Error submitting enrollment:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract error message from various possible locations
      let errorMessage = 'Failed to submit enrollment. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (data.non_field_errors && data.non_field_errors[0]) {
          errorMessage = data.non_field_errors[0];
        } else if (data.farmer && data.farmer[0]) {
          errorMessage = data.farmer[0];
        } else if (data.plan && data.plan[0]) {
          errorMessage = data.plan[0];
        } else if (data.livestock && data.livestock[0]) {
          errorMessage = data.livestock[0];
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }
      
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
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
            preSelected={!!location.state?.preSelectedPlan}
          />
        )}

        {currentStep === 3 && (
          <ReviewSubmitStep
            livestock={selectedLivestock}
            plan={selectedPlan}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
};

export default Enroll;
