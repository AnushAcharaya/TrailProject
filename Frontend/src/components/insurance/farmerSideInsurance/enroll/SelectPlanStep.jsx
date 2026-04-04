import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import PlanDetails from './PlanDetails';
import { initiatePayment, redirectToEsewa } from '../../../../services/paymentApi';
import Toast from '../../../common/Toast';

const SelectPlanStep = ({ plan, onPlanSelect, onNext, onBack, preSelected, livestock }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const planOptions = [
    {
      id: 1,
      name: 'Basic Livestock Cover',
      price: 500,
      description: 'Death & Accident',
      coverages: ['Death', 'Accident'],
      fullDescription: 'Essential coverage for livestock death and accidents. Ideal for small farms.'
    },
    {
      id: 2,
      name: 'Comprehensive Care',
      price: 1200,
      description: 'Full Coverage',
      coverages: ['Death', 'Accident', 'Disease', 'Theft'],
      fullDescription: 'Complete protection including disease treatment and theft coverage.'
    },
    {
      id: 3,
      name: 'Disease Shield',
      price: 1300,
      description: 'Disease Only',
      coverages: ['Disease', 'Vaccination', 'Treatment'],
      fullDescription: 'Specialized coverage for disease-related losses and treatments.'
    },
    {
      id: 4,
      name: 'Premium Protection',
      price: 2000,
      description: 'All Risks',
      coverages: ['Death', 'Accident', 'Disease', 'Theft', 'Natural Disaster'],
      fullDescription: 'Maximum protection with extended coverage period and all risk types.'
    }
  ];

  const handleProceedToPayment = async () => {
    if (!plan) {
      setToast({
        message: 'Please select a plan first',
        type: 'error'
      });
      return;
    }

    if (!livestock) {
      setToast({
        message: 'Livestock information is missing',
        type: 'error'
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Initiate eSewa payment
      const premiumAmount = plan.premium_amount || plan.price;
      const paymentData = {
        amount: premiumAmount,
        product_code: 'INSURANCE_PREMIUM',
        product_description: `Insurance Premium - ${plan.name} for ${livestock.name || livestock.tag}`,
        tax_amount: 0
      };

      console.log('Initiating payment:', paymentData);
      const paymentResponse = await initiatePayment(paymentData);
      
      if (paymentResponse.success) {
        // Store enrollment data in sessionStorage for after payment
        sessionStorage.setItem('pending_insurance_enrollment', JSON.stringify({
          livestock_id: livestock.id,
          plan_id: plan.id,
          plan_name: plan.name,
          premium_amount: premiumAmount,
          payment_initiated: true
        }));
        
        // Redirect to eSewa
        redirectToEsewa(paymentResponse.payment_data, paymentResponse.esewa_url);
      } else {
        throw new Error('Failed to initiate payment');
      }

    } catch (error) {
      console.error('Error initiating payment:', error);
      setToast({
        message: 'Failed to initiate payment. Please try again.',
        type: 'error'
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Select Plan</h2>
      <p className="form-subtitle">
        {preSelected 
          ? 'Your selected plan is shown below. You can change it if needed.'
          : 'Choose an insurance plan that best fits your needs.'}
      </p>

      {preSelected && plan ? (
        <div className="pre-selected-plan">
          <div className="selected-badge">
            <span>✓ Selected from Plans</span>
          </div>
          <PlanDetails plan={plan} />
          <button 
            className="btn-change-plan"
            onClick={() => onPlanSelect(null)}
          >
            Change Plan
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <select
              className="dropdown-select"
              value={plan?.id || ''}
              onChange={(e) => {
                const selected = planOptions.find(
                  (p) => p.id === parseInt(e.target.value)
                );
                onPlanSelect(selected);
              }}
            >
              <option value="">Select plan...</option>
              {planOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - ${item.price}/12 months
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
          </div>

          {plan && <PlanDetails plan={plan} />}
        </>
      )}

      <div className="btn-container">
        <button className="btn-back" onClick={onBack} disabled={isProcessing}>
          ← Back
        </button>
        <button
          className="btn-next"
          onClick={handleProceedToPayment}
          disabled={!plan || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Proceed to Payment →'}
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SelectPlanStep;
