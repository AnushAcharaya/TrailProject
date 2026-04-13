import { useTranslation } from 'react-i18next';
import CoverageList from './CoverageList';
import { FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PlanCard = ({ name, price, months, coverages, id }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('insurance');

  const handleEnroll = () => {
    // Extract coverage text from objects and translate them
    const coverageTexts = coverages.map(c => t(`plans.${c.text}`));
    
    // Pass the selected plan data to the enrollment page
    navigate('/farmerinsuranceenroll', {
      state: {
        preSelectedPlan: {
          id,
          name,
          price,
          description: coverageTexts.join(', '),
          coverages: coverageTexts,
          fullDescription: `${name} - ${coverageTexts.join(', ')}`
        }
      }
    });
  };

  return (
    <div className="plan-card">
      <div className="card-header">
        <div className="shield-icon">
          <FaShieldAlt />
        </div>
        <span className="months-badge">{t('plans.duration', { count: months })}</span>
      </div>
      
      <h3 className="plan-name">{name}</h3>
      
      <div className="price-section">
        <span className="plan-price">{t('plans.price', { amount: price })}</span>
        <div className="coverage-text">Coverage</div>
      </div>
      
      <CoverageList coverages={coverages} />
      
      <div className="button-group">
        <button className="btn-view-details">
          {t('plans.buttons.viewDetails')}
        </button>
        <button 
          className="btn-enroll"
          onClick={handleEnroll}
        >
          {t('plans.buttons.enrollNow')}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
