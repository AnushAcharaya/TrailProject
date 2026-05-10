import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StepIndicator from './StepIndicator';
import SelectLivestockStep from './SelectLivestockStep';
import SelectPlanStep from './SelectPlanStep';
import UploadPaymentProofStep from './UploadPaymentProofStep';
import ReviewSubmitStep from './ReviewSubmitStep';
import Toast from '../../../common/Toast';
import { createEnrollment, getInsurancePlans } from '../../../../services/insuranceApi';
import { getLivestockById } from '../../../../services/livestockCrudApi';

const Enroll = () => {
  const { t } = useTranslation('insurance');
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLivestock, setSelectedLivestock] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-hydrate state when the user returns from eSewa.
  // Enroll.jsx is freshly mounted at /farmerinsuranceenroll so React state is
  // empty. New flow saves the full livestock + plan objects to sessionStorage;
  // legacy entries from before that fix only have IDs — for those we re-fetch
  // from the API so the Review step still shows real data.
  useEffect(() => {
    const restorePending = async () => {
      const pendingEnrollment = sessionStorage.getItem('pending_insurance_enrollment');
      if (!pendingEnrollment) return;

      let data;
      try {
        data = JSON.parse(pendingEnrollment);
      } catch (err) {
        console.error('[Enroll] sessionStorage entry is corrupt — clearing it:', err);
        sessionStorage.removeItem('pending_insurance_enrollment');
        return;
      }

      // 1) Direct rehydration (new format)
      if (data.livestock) {
        setSelectedLivestock(data.livestock);
      } else if (data.livestock_id) {
        // 2) Fallback for legacy entries — fetch by id
        try {
          const result = await getLivestockById(data.livestock_id);
          const animal = result?.data || result;
          if (animal && animal.id) {
            const transformed = {
              id: animal.id,
              name: animal.species_name || 'Unknown',
              type: animal.species_name || 'Unknown',
              breed: animal.breed_name || 'Unknown',
              tag: animal.tag_id,
              originalData: animal,
            };
            setSelectedLivestock(transformed);
            // Upgrade the saved entry so subsequent reloads don't re-fetch.
            data.livestock = transformed;
            sessionStorage.setItem('pending_insurance_enrollment', JSON.stringify(data));
          }
        } catch (err) {
          console.error('[Enroll] Failed to refetch livestock:', err);
        }
      }

      if (data.plan) {
        setSelectedPlan(data.plan);
      } else if (data.plan_id) {
        try {
          const plansResp = await getInsurancePlans();
          const list = plansResp?.results || plansResp?.data || plansResp || [];
          const plan = Array.isArray(list)
            ? list.find((p) => p.id === data.plan_id)
            : null;
          if (plan) {
            setSelectedPlan(plan);
            data.plan = plan;
            sessionStorage.setItem('pending_insurance_enrollment', JSON.stringify(data));
          }
        } catch (err) {
          console.error('[Enroll] Failed to refetch plan:', err);
        }
      }

      if (data.payment_initiated) {
        setCurrentStep(3);
        setToast({
          message: t('enroll.messages.paymentCompleted'),
          type: 'success',
        });
      }
    };

    restorePending();
  }, [t]);

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
        message: t('enroll.messages.completeAllSteps'),
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
        message: t('enroll.messages.enrollmentSuccess'),
        type: 'success'
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/farmerinsurancedashboard');
      }, 2000);

    } catch (error) {
      console.error('Error submitting enrollment:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract error message from various possible locations
      let errorMessage = t('enroll.messages.enrollmentFailed');
      
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
