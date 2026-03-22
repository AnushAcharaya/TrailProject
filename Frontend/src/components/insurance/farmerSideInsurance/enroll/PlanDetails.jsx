import { FaShieldAlt } from 'react-icons/fa';

const PlanDetails = ({ plan }) => {
  // Handle both string arrays and object arrays for coverages
  const getCoverageText = (coverage) => {
    return typeof coverage === 'string' ? coverage : coverage.text;
  };

  return (
    <div className="plan-card-mini">
      <div className="details-title">
        <FaShieldAlt className="w-5 h-5 text-emerald-600" />
        {plan.name}
      </div>

      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

      <div className="flex flex-wrap gap-2">
        {plan.coverages.map((coverage, idx) => (
          <span
            key={idx}
            className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full"
          >
            {getCoverageText(coverage)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PlanDetails;
