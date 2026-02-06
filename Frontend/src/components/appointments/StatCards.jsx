import React from "react";
import { FiClock, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "../../styles/appointments.css";

const StatCards = () => {
  const stats = [
    { 
      label: "Upcoming", 
      value: 2, 
      color: "green",
      icon: <FiClock size={24} />,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    { 
      label: "Pending", 
      value: 1, 
      color: "yellow",
      icon: <FiAlertCircle size={24} />,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    { 
      label: "Completed", 
      value: 12, 
      color: "blue",
      icon: <FiCheckCircle size={24} />,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    { 
      label: "Cancelled", 
      value: 3, 
      color: "red",
      icon: <FiXCircle size={24} />,
      bgColor: "bg-red-100",
      iconColor: "text-red-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
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
