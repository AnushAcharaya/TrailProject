import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import PlanCard from '../../../components/insurance/farmerSideInsurance/insurancePlan/PlanCard';
import '../../../styles/farmerSideInsurance/insurancePlan.css';

const InsurancePlans = () => {
  const plans = [
    {
      id: 1,
      name: 'Basic Coverage',
      price: '500',
      months: '12 months',
      coverages: [
        { icon: 'accident', text: 'Accident Coverage' },
        { icon: 'theft', text: 'Theft Protection' }
      ]
    },
    {
      id: 2,
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
      id: 3,
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
      id: 4,
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
    <FarmerLayout pageTitle="Insurance Plans">
      <div className="plans-page">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-20">
            <h1 className="page-title">Insurance Plans</h1>
            <p className="page-subtitle">Choose the right coverage for your livestock</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                price={plan.price}
                months={plan.months}
                coverages={plan.coverages}
              />
            ))}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default InsurancePlans;
