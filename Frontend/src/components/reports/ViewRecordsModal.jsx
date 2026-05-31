import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTreatmentsByLivestock } from '../../services/medicalApi';
import { getVaccinationsByLivestock } from '../../services/vaccinationApi';
import { tAnimal, tStatus } from '../../utils/translateEnum';

const ViewRecordsModal = ({ animal, type, onClose }) => {
  const { t: tCommon } = useTranslation('common');
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
        const response = await getTreatmentsByLivestock(animal.tag_id);
        setRecords(response.data.results || response.data || []);
      } else if (type === 'vaccination') {
        const response = await getVaccinationsByLivestock(animal.tag_id);
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
    const isTreatment = type === 'treatment';
    const title = isTreatment ? 'Medical Treatment Report' : 'Vaccination Report';
    const filename = `${animal.tag_id}_${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(22, 163, 74); // green-600
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 17, { align: 'center' });

    // Animal info block
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const infoY = 38;
    doc.setFont('helvetica', 'bold');
    doc.text('Animal Tag:', 14, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(animal.tag_id || 'N/A', 42, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text('Species:', 14, infoY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(animal.species_name || 'N/A', 42, infoY + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Breed:', 14, infoY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(animal.breed_name || 'N/A', 42, infoY + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Generated:', pageWidth - 70, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString(), pageWidth - 70, infoY + 7);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, infoY + 20, pageWidth - 14, infoY + 20);

    // Table
    if (isTreatment) {
      autoTable(doc, {
        startY: infoY + 25,
        head: [['#', 'Start Date', 'Treatment', 'Diagnosis', 'Veterinarian', 'Follow-up', 'Status']],
        body: records.map((r, i) => [
          i + 1,
          r.treatment_date || 'N/A',
          r.treatment_name || 'N/A',
          r.diagnosis || 'N/A',
          r.vet_name || 'N/A',
          r.next_treatment_date || 'N/A',
          r.status || 'N/A',
        ]),
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: { 0: { cellWidth: 8 }, 3: { cellWidth: 35 } },
        margin: { left: 14, right: 14 },
      });
    } else {
      autoTable(doc, {
        startY: infoY + 25,
        head: [['#', 'Date Given', 'Vaccine', 'Type', 'Veterinarian', 'Next Due', 'Notes']],
        body: records.map((r, i) => [
          i + 1,
          r.date_given || 'N/A',
          r.vaccine_name || 'N/A',
          r.vaccine_type || 'N/A',
          r.vet_name || 'N/A',
          r.next_due_date || 'N/A',
          r.notes || 'N/A',
        ]),
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: { 0: { cellWidth: 8 }, 6: { cellWidth: 35 } },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages}  |  FYB Trail Project`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    doc.save(filename);
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
                          <span className="record-label">Start Date:</span>
                          <span className="record-value">{record.treatment_date || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Treatment:</span>
                          <span className="record-value">{record.treatment_name || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Diagnosis:</span>
                          <span className="record-value">{record.diagnosis || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Veterinarian:</span>
                          <span className="record-value">{record.vet_name || 'N/A'}</span>
                        </div>
                        {record.next_treatment_date && (
                          <div className="record-row">
                            <span className="record-label">Next Follow-up:</span>
                            <span className="record-value">{record.next_treatment_date}</span>
                          </div>
                        )}
                        <div className="record-row">
                          <span className="record-label">Status:</span>
                          <span className={`record-status status-${record.status?.toLowerCase().replace(' ', '-')}`}>
                            {record.status ? tStatus(tCommon, record.status) : 'N/A'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="record-row">
                          <span className="record-label">Date Given:</span>
                          <span className="record-value">{record.date_given || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Vaccine:</span>
                          <span className="record-value">{record.vaccine_name || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Vaccine Type:</span>
                          <span className="record-value">{record.vaccine_type || 'N/A'}</span>
                        </div>
                        <div className="record-row">
                          <span className="record-label">Veterinarian:</span>
                          <span className="record-value">{record.vet_name || 'N/A'}</span>
                        </div>
                        {record.next_due_date && (
                          <div className="record-row">
                            <span className="record-label">Next Due:</span>
                            <span className="record-value">{record.next_due_date}</span>
                          </div>
                        )}
                        <div className="record-row">
                          <span className="record-label">Status:</span>
                          <span className="record-value">{record.status_display || record.status || 'N/A'}</span>
                        </div>
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
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRecordsModal;
