import { FaChevronDown } from 'react-icons/fa';
import PlanDetails from './PlanDetails';

const SelectPlanStep = ({ plan, onPlanSelect, onNext, onBack, preSelected }) => {
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
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!plan}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default SelectPlanStep;
