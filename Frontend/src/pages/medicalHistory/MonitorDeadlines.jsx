// src/pages/medicalHistory/MonitorDeadlines.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/medicalHistory/PageHeader";
import DeadlineMonitor from "../../components/medicalHistory/DeadlineMonitor";
import TreatmentCard from "../../components/medicalHistory/TreatmentCard";
import "../../styles/medicalHistory.css";

const MonitorDeadlines = () => {
  const [treatments, setTreatments] = useState([]);
  const [overdueTreatments, setOverdueTreatments] = useState([]);
  const [dueSoonTreatments, setDueSoonTreatments] = useState([]);
  const [onTrackTreatments, setOnTrackTreatments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = () => {
    const saved = localStorage.getItem("treatments");
    if (saved) {
      const allTreatments = JSON.parse(saved);
      
      // Filter treatments that have a next follow-up date
      const treatmentsWithFollowUp = allTreatments.filter(t => t.nextTreatmentDate);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const overdue = [];
      const dueSoon = [];
      const onTrack = [];
      
      treatmentsWithFollowUp.forEach(treatment => {
        const followUpDate = new Date(treatment.nextTreatmentDate);
        followUpDate.setHours(0, 0, 0, 0);
        
        const diffTime = followUpDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          // Overdue
          overdue.push({ ...treatment, daysInfo: `${Math.abs(diffDays)} days overdue` });
        } else if (diffDays <= 7) {
          // Due soon (within 7 days)
          dueSoon.push({ ...treatment, daysInfo: diffDays === 0 ? "Due today" : `Due in ${diffDays} days` });
        } else {
          // On track (more than 7 days)
          onTrack.push({ ...treatment, daysInfo: `Due in ${diffDays} days` });
        }
      });
      
      setTreatments(allTreatments);
      setOverdueTreatments(overdue);
      setDueSoonTreatments(dueSoon);
      setOnTrackTreatments(onTrack);
    }
  };

  const handleEdit = (treatment) => {
    localStorage.setItem("editTreatmentId", treatment.id);
    navigate("/medical/edit");
  };

  const handleDelete = (treatment) => {
    const updated = treatments.filter(t => t.id !== treatment.id);
    localStorage.setItem("treatments", JSON.stringify(updated));
    loadTreatments();
  };

  const handleView = (treatment) => {
    // Navigate to history page or open modal
    navigate("/medical/history");
  };

  return (
    <div className="bg-app-bg min-h-screen p-6">
      <PageHeader
        title="Treatment Deadlines"
        subtitle="Track upcoming and overdue follow-up appointments"
      />

      <DeadlineMonitor 
        overdue={overdueTreatments.length} 
        dueSoon={dueSoonTreatments.length} 
        onTrack={onTrackTreatments.length} 
      />

      {/* Overdue Treatments */}
      {overdueTreatments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-red-600">❌ Overdue Follow-ups</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
              {overdueTreatments.length}
            </span>
          </div>
          <div className="space-y-3">
            {overdueTreatments.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                  {treatment.daysInfo}
                </div>
                <TreatmentCard 
                  treatment={treatment} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Soon Treatments */}
      {dueSoonTreatments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-yellow-600">⚠️ Due Soon (Within 7 Days)</h3>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
              {dueSoonTreatments.length}
            </span>
          </div>
          <div className="space-y-3">
            {dueSoonTreatments.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                  {treatment.daysInfo}
                </div>
                <TreatmentCard 
                  treatment={treatment} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On Track Treatments */}
      {onTrackTreatments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-green-600">✅ On Track</h3>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
              {onTrackTreatments.length}
            </span>
          </div>
          <div className="space-y-3">
            {onTrackTreatments.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                  {treatment.daysInfo}
                </div>
                <TreatmentCard 
                  treatment={treatment} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {overdueTreatments.length === 0 && dueSoonTreatments.length === 0 && onTrackTreatments.length === 0 && (
        <div className="empty-state">
          <div>⏰</div>
          <p>No treatment follow-ups scheduled</p>
          <p className="text-sm text-muted mt-2">Add follow-up dates to treatments to track deadlines</p>
        </div>
      )}
    </div>
  );
};

export default MonitorDeadlines;