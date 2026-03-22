import React, { useState, useEffect } from 'react';
import { getTreatmentsByLivestock } from '../../services/medicalApi';
import { getVaccinationsByLivestock } from '../../services/vaccinationApi';

const ViewRecordsModal = ({ animal, type, onClose }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [animal, type]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (type === 'treatment') {
        const response = await getTreatmentsByLivestock(animal.id);
        setRecords(response.data.results || response.data || []);
      } else if (type === 'vaccination') {
        const response = await getVaccinationsByLivestock(animal.id);
        setRecords(response.data.results || response.data || []);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const title = type === 'treatment' ? 'Treatment Records' : 'Vaccination Records';
    const filename = `${animal.tag_id}_${type}_records_${new Date().toISOString().split('T')[0]}.txt`;
    
    let content = `${title}\n`;
    content += `Animal Tag: ${animal.tag_id}\n`;
    content += `Breed: ${animal.breed_name}\n`;
    content += `Species: ${animal.species_name}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `\n${'='.repeat(60)}\n\n`;

    if (records.length === 0) {
      content += 'No records found.\n';
    } else {
      records.forEach((record, index) => {
        content += `Record ${index + 1}:\n`;
        content += `${'-'.repeat(40)}\n`;
        
        if (type === 'treatment') {
          content += `Date: ${new Date(record.treatment_date).toLocaleDateString()}\n`;
          content += `Diagnosis: ${record.diagnosis || 'N/A'}\n`;
          content += `Treatment: ${record.treatment_given || 'N/A'}\n`;
          content += `Veterinarian: ${record.veterinarian_name || 'N/A'}\n`;
          content += `Notes: ${record.notes || 'N/A'}\n`;
          content += `Status: ${record.status || 'N/A'}\n`;
        } else {
          content += `Date: ${new Date(record.vaccination_date).toLocaleDateString()}\n`;
          content += `Vaccine: ${record.vaccine_name || 'N/A'}\n`;
          content += `Batch Number: ${record.batch_number || 'N/A'}\n`;
          content += `Veterinarian: ${record.veterinarian_name || 'N/A'}\n`;
          content += `Next Due: ${record.next_due_date ? new Date(record.next_due_date).toLocaleDateString() : 'N/A'}\n`;
          content += `Notes: ${record.notes || 'N/A'}\n`;
        }
        content += `\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2>{type === 'treatment' ? 'Treatment Records' : 'Vaccination Records'}</h2>
            <p className="modal-subtitle">
              {animal.breed_name} - Tag: {animal.tag_id}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Loading records...</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <p>{error}</p>
              <button onClick={fetchRecords}>Retry</button>
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="modal-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No {type} records found for this animal</p>
            </div>
          )}

          {!loading && !error && records.length > 0 && (
            <div className="records-list">
              {records.map((record, index) => (
                <div key={record.id || index} className="record-item">
                  <div className="record-number">#{index + 1}</div>
                  <div className="record-content">
                    {type === 'treatment' ? (
                      <>
                        <div className="record-row">
                          <span className="record-label">Date:</span>
                          <span className="record-value">
                            {new Date(record.treatment_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Diagnosis:</span>
                          <span className="record-value">{record.diagnosis || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Treatment:</span>
                          <span className="record-value">{record.treatment_given || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Veterinarian:</span>
                          <span className="record-value">{record.veterinarian_name || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Status:</span>
                          <span className={`record-status status-${record.status?.toLowerCase()}`}>
                            {record.status || 'N/A'}
                          </span>
                        </div>
                        {record.notes && (
                          <div className="record-row full-width">
                            <span className="record-label">Notes:</span>
                            <span className="record-value">{record.notes}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="record-row">
                          <span className="record-label">Date:</span>
                          <span className="record-value">
                            {new Date(record.vaccination_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Vaccine:</span>
                          <span className="record-value">{record.vaccine_name || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Batch Number:</span>
                          <span className="record-value">{record.batch_number || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Veterinarian:</span>
                          <span className="record-value">{record.veterinarian_name || 'N/A'}</span>
                        </div>
                        {record.next_due_date && (
                          <div className="record-row">
                            <span className="record-label">Next Due:</span>
                            <span className="record-value">
                              {new Date(record.next_due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {record.notes && (
                          <div className="record-row full-width">
                            <span className="record-label">Notes:</span>
                            <span className="record-value">{record.notes}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn secondary-btn" onClick={onClose}>
            Close
          </button>
          <button 
            className="modal-btn primary-btn" 
            onClick={handleDownload}
            disabled={loading || records.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRecordsModal;
