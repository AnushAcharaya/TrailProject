// src/components/medicalHistory/MedicineTrackingCard.jsx
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck, FaPills, FaClock } from "react-icons/fa";
import "./../../styles/medicalHistory.css";

const getLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatTime12 = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

const MedicineTrackingCard = ({ treatment, onEdit, onDelete }) => {
  const [doses, setDoses] = useState([]);
  const [todayStr, setTodayStr] = useState(() => getLocalDateStr(new Date()));

  // Auto-refresh todayStr at midnight so doses reset without a page reload
  useEffect(() => {
    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return midnight - now;
    };
    const timer = setTimeout(() => {
      setTodayStr(getLocalDateStr(new Date()));
    }, msUntilMidnight());
    return () => clearTimeout(timer);
  }, [todayStr]);

  const startDateStr = treatment.treatment_date;
  const startDate = parseLocalDate(startDateStr);

  const duration = treatment.medicines?.[0]?.duration || 1;
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration - 1);
  const endDateStr = getLocalDateStr(endDate);

  const today = new Date();
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const treatmentDay = Math.max(1, Math.min(daysSinceStart + 1, duration));

  const generateIntervalTimes = (med) => {
    const startTime = med.start_time || med.startTime || "08:00";
    const intervalHours = med.interval_hours || med.intervalHours || 8;
    const [h, m] = startTime.split(":").map(Number);
    const times = [];
    for (let i = 0; i < med.frequency; i++) {
      const totalMins = h * 60 + m + i * intervalHours * 60;
      const hrs = Math.floor(totalMins / 60) % 24;
      const mins = totalMins % 60;
      times.push(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
    }
    return times;
  };

  useEffect(() => {
    if (todayStr < startDateStr || todayStr > endDateStr) {
      setDoses([]);
      return;
    }

    const storageKey = `treatment_${treatment.id}_doses_${todayStr}`;
    const saved = localStorage.getItem(storageKey);
    const savedDoses = saved ? JSON.parse(saved) : [];

    const allDoses = [];
    (treatment.medicines || []).forEach((med) => {
      const isExact = med.schedule_type === "exact" || med.scheduleType === "exact";
      const times = isExact
        ? (med.exact_times || med.exactTimes || []).slice(0, med.frequency)
        : generateIntervalTimes(med);

      times.forEach((time) => {
        const doseId = `${med.name}-${time}`;
        allDoses.push({
          id: doseId,
          medicineName: med.name,
          dosage: med.dosage,
          time,
          taken: savedDoses.find((d) => d.id === doseId)?.taken || false,
        });
      });
    });

    allDoses.sort((a, b) => a.time.localeCompare(b.time));
    setDoses(allDoses);
  }, [treatment, todayStr]);

  const handleTaken = (doseId) => {
    const updated = doses.map((d) => (d.id === doseId ? { ...d, taken: true } : d));
    setDoses(updated);
    const storageKey = `treatment_${treatment.id}_doses_${todayStr}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const takenCount = doses.filter((d) => d.taken).length;
  const allTaken = doses.length > 0 && takenCount === doses.length;
  const progressPercent = Math.round((treatmentDay / duration) * 100);

  return (
    <div className="medicine-tracking-card">
      {/* Header */}
      <div className="tracking-card-header">
        <div>
          <h3 className="tracking-card-title">Medicine Schedule — {todayStr}</h3>
          <span className="tracking-card-day">
            Day {treatmentDay} of {duration}
          </span>
        </div>
        <div className="tracking-card-actions">
          <button onClick={() => onEdit?.(treatment)} className="tracking-edit-btn">
            <FaEdit size={12} /> Edit
          </button>
          <button onClick={() => onDelete?.(treatment)} className="tracking-delete-btn">
            <FaTrash size={12} /> Delete
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tracking-progress-bar-container">
        <div className="tracking-progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="tracking-progress-text">{progressPercent}% of treatment complete</p>

      {/* Doses */}
      {doses.length === 0 ? (
        <p className="tracking-no-doses">No doses scheduled for today.</p>
      ) : (
        <div className="tracking-doses-list">
          <div className="tracking-doses-summary">
            <FaPills className="text-green-600" size={14} />
            <span>
              {takenCount} of {doses.length} dose{doses.length !== 1 ? "s" : ""} taken today
            </span>
          </div>

          {doses.map((dose) => (
            <div key={dose.id} className={`tracking-dose-item${dose.taken ? " taken" : ""}`}>
              <div className="tracking-dose-info">
                <div className="tracking-dose-name">{dose.medicineName}</div>
                <div className="tracking-dose-meta">
                  <FaClock size={11} style={{ display: "inline", marginRight: 4 }} />
                  {formatTime12(dose.time)}
                  {dose.dosage && (
                    <span className="tracking-dose-dosage"> &middot; {dose.dosage}</span>
                  )}
                </div>
              </div>

              {dose.taken ? (
                <div className="tracking-taken-badge">
                  <FaCheck size={12} /> Taken
                </div>
              ) : (
                <button className="tracking-take-btn" onClick={() => handleTaken(dose.id)}>
                  <FaCheck size={12} /> Mark Taken
                </button>
              )}
            </div>
          ))}

          {allTaken && (
            <div className="tracking-all-taken">
              🎉 All doses completed for today!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineTrackingCard;
