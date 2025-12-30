// src/components/medicalHistory/DeadlineMonitor.jsx
import "./../../styles/medicalHistory.css";

const DeadlineMonitor = ({ overdue, dueSoon, onTrack }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-card border border-status-error rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">❌</div>
        <h3 className="font-semibold text-body">Overdue</h3>
        <p className="text-2xl font-bold text-status-error">{overdue}</p>
      </div>
      <div className="bg-card border border-status-warning rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">⚠️</div>
        <h3 className="font-semibold text-body">Due Soon (≤7 days)</h3>
        <p className="text-2xl font-bold text-status-warning">{dueSoon}</p>
      </div>
      <div className="bg-card border border-status-success rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">✅</div>
        <h3 className="font-semibold text-body">On Track</h3>
        <p className="text-2xl font-bold text-status-success">{onTrack}</p>
      </div>
    </div>
  );
};

export default DeadlineMonitor;