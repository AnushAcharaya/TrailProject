// src/components/medicalHistory/AlertCard.jsx
import "./../../styles/medicalHistory.css";

const AlertCard = ({ title, count, colorClass }) => {
  const getColorStyles = () => {
    switch(colorClass) {
      case "overdue":
        return "bg-red-100 border-red-300 text-red-800";
      case "today":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "days-1":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "days-3":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "days-7":
        return "bg-green-100 border-green-300 text-green-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className={`rounded-lg p-4 border-2 ${getColorStyles()} text-center transition hover:shadow-md`}>
      <div className="font-semibold text-sm mb-2">{title}</div>
      <div className="text-3xl font-bold">{count}</div>
    </div>
  );
};

export default AlertCard;