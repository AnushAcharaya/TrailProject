// src/components/medicalHistory/MedicineTrackingCard.jsx
import { useState, useEffect } from "react";
import "./../../styles/medicalHistory.css";

const MedicineTrackingCard = ({ treatment, onEdit, onDelete }) => {
  const [doses, setDoses] = useState([]);
  const [nextDose, setNextDose] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [treatmentDay, setTreatmentDay] = useState(1);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [nextDayTimes, setNextDayTimes] = useState({});

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Parse time string "08:00" → Date object for current date
  const timeToDateTime = (timeStr, date = currentDate) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  };

  // Load saved progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem(`treatment_${treatment.livestockTag}_progress`);
    if (saved) {
      const progress = JSON.parse(saved);
      return progress;
    }
    return null;
  };

  // Save progress to localStorage
  const saveProgress = (date, dosesData, day, customTimes = null) => {
    const progress = {
      currentDate: formatDate(date),
      doses: dosesData,
      treatmentDay: day,
      customTimes: customTimes
    };
    localStorage.setItem(`treatment_${treatment.livestockTag}_progress`, JSON.stringify(progress));
  };

  // Initialize doses for current date
  useEffect(() => {
    const todayStr = formatDate(currentDate);

    // Calculate treatment end date
    const startDate = new Date(treatment.treatmentDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + treatment.medicines[0].duration);

    // Calculate which day of treatment we're on
    const daysSinceStart = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    setTreatmentDay(daysSinceStart);

    // If current date is outside treatment window → exit
    if (todayStr < treatment.treatmentDate || todayStr > formatDate(endDate)) {
      setDoses([]);
      return;
    }

    // Load saved progress
    const savedProgress = loadProgress();
    
    // Generate all doses for current date
    const allDoses = [];
    treatment.medicines.forEach((med) => {
      // Check if there are custom times for this date and medicine
      const customTimesForDate = savedProgress?.customTimes?.[todayStr]?.[med.name];
      
      if (customTimesForDate && customTimesForDate.length > 0) {
        // Use custom times
        customTimesForDate.forEach((time) => {
          const doseId = `${med.name}-${time}-${todayStr}`;
          allDoses.push({
            id: doseId,
            medicineName: med.name,
            time: time,
            taken: savedProgress?.currentDate === todayStr 
              ? savedProgress.doses.find(d => d.id === doseId)?.taken || false
              : false,
          });
        });
      } else if (med.scheduleType === "exact") {
        med.exactTimes.slice(0, med.frequency).forEach((time) => {
          const doseId = `${med.name}-${time}-${todayStr}`;
          allDoses.push({
            id: doseId,
            medicineName: med.name,
            time: time,
            taken: savedProgress?.currentDate === todayStr 
              ? savedProgress.doses.find(d => d.id === doseId)?.taken || false
              : false,
          });
        });
      } else if (med.scheduleType === "interval") {
        let currentTime = timeToDateTime(med.startTime, currentDate);
        for (let i = 0; i < med.frequency; i++) {
          if (i > 0) {
            currentTime = new Date(currentTime.getTime() + med.intervalHours * 60 * 60 * 1000);
          }
          const timeStr = currentTime.toTimeString().slice(0, 5);
          const doseId = `${med.name}-${timeStr}-${todayStr}`;
          allDoses.push({
            id: doseId,
            medicineName: med.name,
            time: timeStr,
            taken: savedProgress?.currentDate === todayStr 
              ? savedProgress.doses.find(d => d.id === doseId)?.taken || false
              : false,
          });
        }
      }
    });

    // Sort by time
    allDoses.sort((a, b) => timeToDateTime(a.time, currentDate) - timeToDateTime(b.time, currentDate));
    setDoses(allDoses);
  }, [treatment, currentDate]);

  // Find next upcoming dose & start countdown
  useEffect(() => {
    if (doses.length === 0) return;

    const now = new Date();
    const isToday = formatDate(currentDate) === formatDate(now);
    
    if (!isToday) {
      const firstUntaken = doses.find(dose => !dose.taken);
      setNextDose(firstUntaken || null);
      setTimeLeft("");
      return;
    }

    const upcoming = doses.find(
      (dose) => !dose.taken && timeToDateTime(dose.time, currentDate) > now
    );

    if (upcoming) {
      setNextDose(upcoming);
      const interval = setInterval(() => {
        const diff = timeToDateTime(upcoming.time, currentDate) - new Date();
        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft("Due now!");
        } else {
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          if (hours > 0) {
            setTimeLeft(`${hours}h ${mins}m`);
          } else {
            setTimeLeft(`${mins}m ${secs}s`);
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setNextDose(null);
      setTimeLeft("");
    }
  }, [doses, currentDate]);

  const handleTaken = (doseId) => {
    const updatedDoses = doses.map(d => d.id === doseId ? { ...d, taken: true } : d);
    setDoses(updatedDoses);
    const savedProgress = loadProgress();
    saveProgress(currentDate, updatedDoses, treatmentDay, savedProgress?.customTimes);
  };

  const handleOpenTimeModal = () => {
    // Initialize time inputs for each medicine
    const initialTimes = {};
    treatment.medicines.forEach((med) => {
      initialTimes[med.name] = Array(med.frequency).fill("");
    });
    setNextDayTimes(initialTimes);
    setShowTimeModal(true);
  };

  const handleTimeChange = (medicineName, index, value) => {
    setNextDayTimes(prev => ({
      ...prev,
      [medicineName]: prev[medicineName].map((t, i) => i === index ? value : t)
    }));
  };

  const handleConfirmNextDay = () => {
    // Validate that all times are filled
    let allFilled = true;
    let errorMessage = "";
    
    treatment.medicines.forEach((med) => {
      const times = nextDayTimes[med.name] || [];
      const filledTimes = times.filter(t => t !== "");
      
      if (filledTimes.length !== med.frequency) {
        allFilled = false;
        errorMessage = `Please set exactly ${med.frequency} time(s) for ${med.name}`;
      }
    });

    if (!allFilled) {
      alert(errorMessage);
      return;
    }

    // Move to next day
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = formatDate(nextDate);
    
    // Save custom times for next day
    const savedProgress = loadProgress();
    const customTimes = savedProgress?.customTimes || {};
    customTimes[nextDateStr] = nextDayTimes;
    
    saveProgress(nextDate, [], treatmentDay + 1, customTimes);
    setCurrentDate(nextDate);
    setShowTimeModal(false);
  };

  const allTakenToday = doses.length > 0 && doses.every(d => d.taken);
  const isToday = formatDate(currentDate) === formatDate(new Date());
  
  // Check if we can move to next day
  const startDate = new Date(treatment.treatmentDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + treatment.medicines[0].duration);
  const canMoveToNextDay = allTakenToday && currentDate < endDate;

  return (
    <div className="bg-white border border-light rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-body">
            Medicine Schedule: {formatDate(currentDate)}
            {!isToday && <span className="text-sm text-muted ml-2">(Future)</span>}
          </h3>
          <span className="text-sm text-muted">
            Day {treatmentDay} of {treatment.medicines[0].duration}
          </span>
        </div>
        
        {/* Edit and Delete Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit && onEdit(treatment)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(treatment)}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {doses.length === 0 ? (
        <p className="text-muted">No doses scheduled for this date.</p>
      ) : (
        <div className="space-y-3">
          {doses.map((dose) => (
            <div key={dose.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <div className="font-medium">{dose.medicineName}</div>
                <div className="text-sm text-muted">At {dose.time}</div>
              </div>
              {dose.taken ? (
                <span className="text-green-600">✅ Taken</span>
              ) : nextDose?.id === dose.id && isToday ? (
                <div className="text-right">
                  <div className="font-bold text-status-warning">{timeLeft}</div>
                  <button
                    onClick={() => handleTaken(dose.id)}
                    className="mt-1 bg-primary text-white px-2 py-1 rounded text-xs hover:bg-green-800"
                  >
                    Mark Taken
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleTaken(dose.id)}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                >
                  Mark Taken
                </button>
              )}
            </div>
          ))}

          {allTakenToday && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-semibold mb-3">
                ✅ All doses completed for Day {treatmentDay}!
              </p>
              {canMoveToNextDay && (
                <button
                  onClick={handleOpenTimeModal}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800 font-medium"
                >
                  Set Times for Day {treatmentDay + 1} →
                </button>
              )}
              {!canMoveToNextDay && treatmentDay >= treatment.medicines[0].duration && (
                <p className="text-green-600 mt-2">
                  🎉 Treatment completed successfully!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Time Setting Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Set Times for Day {treatmentDay + 1}
            </h3>
            <p className="text-sm text-muted mb-4">
              Set the exact times for each medicine dose. You must set exactly the required number of times.
            </p>

            {treatment.medicines.map((med) => (
              <div key={med.name} className="mb-6">
                <h4 className="font-medium mb-2">
                  {med.name} - {med.frequency} dose(s) required
                </h4>
                <div className="space-y-2">
                  {Array.from({ length: med.frequency }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <label className="text-sm w-16">Dose {index + 1}:</label>
                      <input
                        type="time"
                        value={nextDayTimes[med.name]?.[index] || ""}
                        onChange={(e) => handleTimeChange(med.name, index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTimeModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNextDay}
                className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-green-800"
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineTrackingCard;