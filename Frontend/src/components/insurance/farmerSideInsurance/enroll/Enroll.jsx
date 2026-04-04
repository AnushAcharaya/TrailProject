import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import SelectLivestockStep from './SelectLivestockStep';
import SelectPlanStep from './SelectPlanStep';
import UploadPaymentProofStep from './UploadPaymentProofStep';
import ReviewSubmitStep from './ReviewSubmitStep';
import Toast from '../../../common/Toast';
import { createEnrollment } from '../../../../services/insuranceApi';

const Enroll = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLivestock, setSelectedLivestock] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if returning from eSewa payment
  useEffect(() => {
    const pendingEnrollment = sessionStorage.getItem('pending_insurance_enrollment');
    if (pendingEnrollment) {
      const data = JSON.parse(pendingEnrollment);
      if (data.payment_initiated) {
        // User returned from eSewa, move to step 3 (upload proof)
        setCurrentStep(3);
        setToast({
          message: 'Payment completed! Please upload your payment screenshot.',
          type: 'success'
        });
      }
    }
  }, []);

  // Check if a plan was pre-selected from the plan cards page
  useEffect(() => {
    if (location.state?.preSelectedPlan) {
      setSelectedPlan(location.state.preSelectedPlan);
    }
  }, [location.state]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLivestock || !selectedPlan || !paymentProof) {
      setToast({
        message: 'Please complete all steps including payment proof upload',
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

      // Prepare form data with payment screenshot
      const formData = new FormData();
      formData.append('livestock', selectedLivestock.id);
      formData.append('plan', selectedPlan.id);
      formData.append('start_date', startDate.toISOString().split('T')[0]);
      formData.append('end_date', endDate.toISOString().split('T')[0]);
      formData.append('premium_paid', selectedPlan.premium_amount || selectedPlan.price);
      formData.append('payment_date', new Date().toISOString().split('T')[0]);
      formData.append('notes', `Enrolled ${selectedLivestock.tag || selectedLivestock.tag_number || selectedLivestock.id} in ${selectedPlan.name}`);
      
      // Add payment screenshot
      if (paymentProof.file) {
        formData.append('payment_screenshot', paymentProof.file);
      }

      console.log('Submitting enrollment with payment proof');

      // Create enrollment via API
      const enrollment = await createEnrollment(formData);
      console.log('Enrollment created:', enrollment);

      // Clear session storage
      sessionStorage.removeItem('pending_insurance_enrollment');

      setToast({
        message: 'Enrollment submitted successfully! Awaiting admin verification.',
        type: 'success'
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/farmer/insurance/dashboard');
      }, 2000);

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
            livestock={selectedLivestock}
            onPlanSelect={setSelectedPlan}
            onNext={handleNext}
            onBack={handleBack}
            preSelected={!!location.state?.preSelectedPlan}
          />
        )}

        {currentStep === 3 && (
          <UploadPaymentProofStep
            paymentProof={paymentProof}
            onProofUpload={setPaymentProof}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <ReviewSubmitStep
            livestock={selectedLivestock}
            plan={selectedPlan}
            paymentProof={paymentProof}
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
