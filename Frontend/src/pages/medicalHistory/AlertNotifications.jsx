// src/pages/medicalHistory/AlertsNotifications.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/medicalHistory/PageHeader";
import AlertCard from "../../components/medicalHistory/AlertCard";
import TreatmentCard from "../../components/medicalHistory/TreatmentCard";
import "../../styles/medicalHistory.css";

const AlertsNotifications = () => {
  const [treatments, setTreatments] = useState([]);
  const [alerts7Days, setAlerts7Days] = useState([]);
  const [alerts3Days, setAlerts3Days] = useState([]);
  const [alerts1Day, setAlerts1Day] = useState([]);
  const [alertsToday, setAlertsToday] = useState([]);
  const [alertsOverdue, setAlertsOverdue] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    const saved = localStorage.getItem("treatments");
    if (saved) {
      const allTreatments = JSON.parse(saved);
      
      // Filter treatments that have a next follow-up date
      const treatmentsWithFollowUp = allTreatments.filter(t => t.nextTreatmentDate);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const day7 = [];
      const day3 = [];
      const day1 = [];
      const dayToday = [];
      const overdue = [];
      
      treatmentsWithFollowUp.forEach(treatment => {
        const followUpDate = new Date(treatment.nextTreatmentDate);
        followUpDate.setHours(0, 0, 0, 0);
        
        const diffTime = followUpDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          overdue.push({ ...treatment, alertMessage: `Overdue by ${Math.abs(diffDays)} days` });
        } else if (diffDays === 0) {
          dayToday.push({ ...treatment, alertMessage: "Follow-up due today!" });
        } else if (diffDays === 1) {
          day1.push({ ...treatment, alertMessage: "Follow-up due tomorrow" });
        } else if (diffDays === 3) {
          day3.push({ ...treatment, alertMessage: "Follow-up in 3 days" });
        } else if (diffDays === 7) {
          day7.push({ ...treatment, alertMessage: "Follow-up in 7 days" });
        }
      });
      
      setTreatments(allTreatments);
      setAlerts7Days(day7);
      setAlerts3Days(day3);
      setAlerts1Day(day1);
      setAlertsToday(dayToday);
      setAlertsOverdue(overdue);
    }
  };

  const handleEdit = (treatment) => {
    localStorage.setItem("editTreatmentId", treatment.id);
    navigate("/medical/edit");
  };

  const handleDelete = (treatment) => {
    const updated = treatments.filter(t => t.id !== treatment.id);
    localStorage.setItem("treatments", JSON.stringify(updated));
    loadAlerts();
  };

  const handleView = (treatment) => {
    navigate("/medical/history");
  };

  const totalAlerts = alertsOverdue.length + alertsToday.length + alerts1Day.length + alerts3Days.length + alerts7Days.length;

  return (
    <div className="bg-app-bg min-h-screen p-6">
      <PageHeader
        title="Treatment Alerts"
        subtitle="Notifications for upcoming or missed follow-up appointments"
      />

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <AlertCard title="Overdue" count={alertsOverdue.length} colorClass="overdue" />
        <AlertCard title="Today" count={alertsToday.length} colorClass="today" />
        <AlertCard title="1 Day" count={alerts1Day.length} colorClass="days-1" />
        <AlertCard title="3 Days" count={alerts3Days.length} colorClass="days-3" />
        <AlertCard title="7 Days" count={alerts7Days.length} colorClass="days-7" />
      </div>

      {/* Overdue Alerts */}
      {alertsOverdue.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🚨</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Overdue Follow-ups</h3>
                <p className="text-sm text-red-700">These treatments have missed their follow-up dates. Please schedule appointments immediately.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {alertsOverdue.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold z-10 animate-pulse">
                  {treatment.alertMessage}
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

      {/* Today Alerts */}
      {alertsToday.length > 0 && (
        <div className="mb-6">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📅</div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800">Follow-ups Due Today</h3>
                <p className="text-sm text-orange-700">These treatments require follow-up appointments today.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {alertsToday.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
                  {treatment.alertMessage}
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

      {/* 1 Day Alerts */}
      {alerts1Day.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏰</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Follow-ups Tomorrow</h3>
                <p className="text-sm text-yellow-700">Prepare for these follow-up appointments scheduled for tomorrow.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {alerts1Day.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
                  {treatment.alertMessage}
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

      {/* 3 Days Alerts */}
      {alerts3Days.length > 0 && (
        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📌</div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Follow-ups in 3 Days</h3>
                <p className="text-sm text-blue-700">Plan ahead for these upcoming follow-up appointments.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {alerts3Days.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
                  {treatment.alertMessage}
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

      {/* 7 Days Alerts */}
      {alerts7Days.length > 0 && (
        <div className="mb-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Follow-ups in 7 Days</h3>
                <p className="text-sm text-green-700">Early reminder for follow-ups scheduled next week.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {alerts7Days.map((treatment, index) => (
              <div key={index} className="relative">
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold z-10">
                  {treatment.alertMessage}
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
      {totalAlerts === 0 && (
        <div className="empty-state">
          <div>🔔</div>
          <p>No Alerts</p>
          <p className="mt-1 text-sm text-muted">All follow-up appointments are scheduled well in advance!</p>
        </div>
      )}
    </div>
  );
};

export default AlertsNotifications;