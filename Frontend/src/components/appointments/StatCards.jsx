import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiClock, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { getAppointmentStats } from "../../services/appointmentApi";
import "../../styles/appointments.css";

const StatCards = () => {
  const { t } = useTranslation('appointments');
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAppointmentStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load appointment stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: t('status.confirmed'),
      value: stats.upcoming, 
      color: "green",
      icon: <FiClock size={24} />,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    { 
      label: t('status.pending'),
      value: stats.pending, 
      color: "yellow",
      icon: <FiAlertCircle size={24} />,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    { 
      label: t('status.completed'),
      value: stats.completed, 
      color: "blue",
      icon: <FiCheckCircle size={24} />,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    { 
      label: t('status.cancelled'),
      value: stats.cancelled, 
      color: "red",
      icon: <FiXCircle size={24} />,
      bgColor: "bg-red-100",
      iconColor: "text-red-600"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, i) => (
        <div key={i} className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="stat-label">{stat.label}</p>
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
          <p className={`stat-value text-${stat.color}-600`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
