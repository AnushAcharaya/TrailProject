import { FaShieldAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getActiveEnrollments } from '../../../../services/insuranceApi';

const ClaimDetailsForm = ({
  claimType,
  incidentDate,
  incidentLocation,
  claimAmount,
  description,
  enrollment,
  onChange
}) => {
  const { t } = useTranslation('insurance');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getActiveEnrollments();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setEnrollments([]);
    }
    setLoading(false);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <FaShieldAlt className="w-6 h-6 text-emerald-600" />
        {t('submitClaim.form.claimDetails')}
      </h3>
      
      {/* Insurance Enrollment Selection */}
      <div className="form-group">
        <label className="form-label">{t('submitClaim.form.insuranceEnrollment')} *</label>
        {loading ? (
          <p className="text-sm text-gray-500">{t('submitClaim.form.loadingEnrollments')}</p>
        ) : (
          <select
            className="form-select"
            value={enrollment || ''}
            onChange={(e) => onChange('enrollment', e.target.value)}
            required
          >
            <option value="">{t('submitClaim.form.selectEnrollment')}</option>
            {enrollments.map((enroll) => (
              <option key={enroll.id} value={enroll.id}>
                {enroll.livestock_details?.tag_id} - {enroll.plan_details?.name} 
                ({t('submitClaim.form.coverage')}: NPR {enroll.plan_details?.coverage_amount})
              </option>
            ))}
          </select>
        )}
        {!loading && enrollments.length === 0 && (
          <p className="text-sm text-red-500 mt-1">
            {t('submitClaim.form.noEnrollments')}
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">{t('submitClaim.form.claimType')} *</label>
        <select
          className="form-select"
          value={claimType}
          onChange={(e) => onChange('claimType', e.target.value)}
          required
        >
          <option value="">{t('submitClaim.form.selectType')}</option>
          <option value="Death">{t('submitClaim.claimTypes.death')}</option>
          <option value="Theft">{t('submitClaim.claimTypes.theft')}</option>
          <option value="Disease">{t('submitClaim.claimTypes.disease')}</option>
          <option value="Accident">{t('submitClaim.claimTypes.accident')}</option>
          <option value="Natural Disaster">{t('submitClaim.claimTypes.naturalDisaster')}</option>
          <option value="Other">{t('submitClaim.claimTypes.other')}</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t('submitClaim.form.amount')} *</label>
        <input
          type="number"
          className="form-input"
          value={claimAmount || ''}
          onChange={(e) => onChange('claimAmount', e.target.value)}
          placeholder={t('submitClaim.form.amountPlaceholder')}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('submitClaim.form.incidentDate')} *</label>
        <input
          type="date"
          className="form-input"
          value={incidentDate}
          onChange={(e) => onChange('incidentDate', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('submitClaim.form.location')} *</label>
        <input
          type="text"
          className="form-input"
          value={incidentLocation || ''}
          onChange={(e) => onChange('incidentLocation', e.target.value)}
          placeholder={t('submitClaim.form.locationPlaceholder')}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t('submitClaim.form.description')} *</label>
        <textarea
          className="form-input"
          placeholder={t('submitClaim.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          rows="4"
          required
        />
      </div>
    </div>
  );
};

export default ClaimDetailsForm;
