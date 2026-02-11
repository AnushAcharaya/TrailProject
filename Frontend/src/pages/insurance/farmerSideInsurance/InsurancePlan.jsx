import FarmerInsuranceNav from '../../../components/insurance/farmerSideInsurance/FarmerInsuranceNav';
import PlanCard from '../../../components/insurance/farmerSideInsurance/insurancePlan/PlanCard';
import '../../../styles/farmerSideInsurance/insurancePlan.css';

const InsurancePlans = () => {
  const plans = [
    {
      name: 'Basic Coverage',
      price: '500',
      months: '12 months',
      coverages: [
        { icon: 'accident', text: 'Accident Coverage' },
        { icon: 'theft', text: 'Theft Protection' }
      ]
    },
    {
      name: 'Comp Care',
      price: '1200',
      months: '12 months',
      coverages: [
        { icon: 'accident', text: 'Accident Coverage' },
        { icon: 'theft', text: 'Theft Protection' },
        { icon: 'disease', text: 'Disease Coverage' }
      ]
    },
    {
      name: 'Disease Shield',
      price: '1300',
      months: '6 months',
      coverages: [
        { icon: 'accident', text: 'Accident Coverage' },
        { icon: 'theft', text: 'Theft Protection' },
        { icon: 'disease', text: 'Disease Coverage' },
        { icon: 'disease', text: 'Vaccination' }
      ]
    },
    {
      name: 'Premium Protection',
      price: '2000',
      months: '24 months',
      coverages: [
        { icon: 'accident', text: 'Accident Coverage' },
        { icon: 'theft', text: 'Theft Protection' },
        { icon: 'disease', text: 'Disease Coverage' },
        { icon: 'premium', text: 'Premium Services' },
        { icon: 'premium', text: '24/7 Support' }
      ]
    }
  ];

  return (
    <div className="plans-page">
      <FarmerInsuranceNav />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-20">
          <h1 className="page-title">Insurance Plans</h1>
          <p className="page-subtitle">Choose the right coverage for your livestock</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {plans.map((plan, index) => (
            <PlanCard
              key={index}
              name={plan.name}
              price={plan.price}
              months={plan.months}
              coverages={plan.coverages}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsurancePlans;
