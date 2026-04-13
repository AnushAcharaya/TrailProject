import { FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const LivestockDetails = ({ livestock }) => {
  const { t } = useTranslation('insurance');
  
  return (
    <div className="details-box">
      <div className="details-title">
        <FaShieldAlt className="w-5 h-5 text-emerald-600" />
        {t('enroll.livestockDetails.title')}
      </div>

      <div className="details-row">
        <span className="details-label">{t('enroll.livestockDetails.name')}:</span>
        <span className="details-value">{livestock.name}</span>
      </div>

      <div className="details-row">
        <span className="details-label">{t('enroll.livestockDetails.type')}:</span>
        <span className="details-value">{livestock.type}</span>
      </div>

      <div className="details-row">
        <span className="details-label">{t('enroll.livestockDetails.breed')}:</span>
        <span className="details-value">{livestock.breed}</span>
      </div>

      <div className="details-row">
        <span className="details-label">{t('enroll.livestockDetails.tag')}:</span>
        <span className="details-value">{livestock.tag}</span>
      </div>

      <div className="details-row">
        <span className="details-label">{t('enroll.livestockDetails.age')}:</span>
        <span className="details-value">{livestock.age}</span>
      </div>

      <div className="details-row">
        <span className="details-label">{t('enroll.livestockDetails.healthStatus')}:</span>
        <span className="health-badge">{livestock.healthStatus}</span>
      </div>
    </div>
  );
};

export default LivestockDetails;
