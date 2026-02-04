import { FiActivity, FiClock, FiAlertTriangle, FiGrid } from "react-icons/fi";
import "../../styles/farmerdashboard.css";

const cards = [
  { title: "Total Livestock", value: "324", icon: <FiGrid />, color: "bg-blue-50", iconColor: "text-blue-600" },
  { title: "Upcoming Vaccinations", value: "18", icon: <FiClock />, color: "bg-green-50", iconColor: "text-green-600" },
  { title: "Under Treatment", value: "6", icon: <FiActivity />, color: "bg-yellow-50", iconColor: "text-yellow-600" },
  { title: "Overdue Tasks", value: "3", icon: <FiAlertTriangle />, color: "bg-red-50", iconColor: "text-red-600" },
];

const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="dashboard-card bg-white rounded-xl p-4 sm:p-5 card-shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">{card.title}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1 sm:mt-2">
                {card.value}
              </h2>
            </div>

            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${card.color} flex items-center justify-center text-lg sm:text-xl ${card.iconColor}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
