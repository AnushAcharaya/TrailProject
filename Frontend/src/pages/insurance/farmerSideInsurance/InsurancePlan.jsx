import { useTranslation } from 'react-i18next';
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import PlanCard from '../../../components/insurance/farmerSideInsurance/insurancePlan/PlanCard';
import '../../../styles/farmerSideInsurance/insurancePlan.css';

const InsurancePlans = () => {
  const { t } = useTranslation('insurance');

  const plans = [
    {
      id: 1,
      name: 'Basic Coverage',
      price: '500',
      months: 12,
      coverages: [
        { icon: 'accident', text: 'coverage.accident' },
        { icon: 'theft', text: 'coverage.theft' }
      ]
    },
    {
      id: 2,
      name: 'Comp Care',
      price: '1200',
      months: 12,
      coverages: [
        { icon: 'accident', text: 'coverage.accident' },
        { icon: 'theft', text: 'coverage.theft' },
        { icon: 'disease', text: 'coverage.disease' }
      ]
    },
    {
      id: 3,
      name: 'Disease Shield',
      price: '1300',
      months: 6,
      coverages: [
        { icon: 'accident', text: 'coverage.accident' },
        { icon: 'theft', text: 'coverage.theft' },
        { icon: 'disease', text: 'coverage.disease' },
        { icon: 'disease', text: 'coverage.vaccination' }
      ]
    },
    {
      id: 4,
      name: 'Premium Protection',
      price: '2000',
      months: 24,
      coverages: [
        { icon: 'accident', text: 'coverage.accident' },
        { icon: 'theft', text: 'coverage.theft' },
        { icon: 'disease', text: 'coverage.disease' },
        { icon: 'premium', text: 'coverage.premium' },
        { icon: 'premium', text: 'coverage.support' }
      ]
    }
  ];

  return (
    <FarmerLayout pageTitle={t('plans.title')}>
      <div className="plans-page">
        <div className="max-w-7xl mx-auto px-6 py-12">
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
