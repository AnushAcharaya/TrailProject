import React from 'react';

const AnimalReportCard = ({ animal, onViewTreatment, onViewVaccination }) => {
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                        (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
  };

  return (
    <div className="animal-report-card">
      <div className="card-header">
        <div className="animal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="animal-info">
          <h3 className="animal-name">{animal.breed_name || 'Unknown Breed'}</h3>
          <span className="animal-tag">Tag: {animal.tag_id}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">Species:</span>
          <span className="info-value">{animal.species_name || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Age:</span>
          <span className="info-value">{calculateAge(animal.date_of_birth)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Gender:</span>
          <span className="info-value">{animal.gender || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Weight:</span>
          <span className="info-value">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="action-btn treatment-btn"
          onClick={() => onViewTreatment(animal)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Treatment
        </button>
        <button 
          className="action-btn vaccination-btn"
          onClick={() => onViewVaccination(animal)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Vaccination
        </button>
      </div>
    </div>
  );
};

export default AnimalReportCard;
