// AdminCards.jsx
import React from "react";
import { Users, Clock, CheckCircle, Activity } from "lucide-react";

const cardsData = [
  {
    id: 1,
    title: "Total Registrations",
    value: "1,245",
    icon: <Users className="w-12 h-12 text-white" />,
    bgGradient: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Pending Reviews",
    value: "321",
    icon: <Clock className="w-12 h-12 text-white" />,
    bgGradient: "bg-gradient-to-r from-yellow-400 to-yellow-500",
  },
  {
    id: 3,
    title: "Approved Accounts",
    value: "865",
    icon: <CheckCircle className="w-12 h-12 text-white" />,
    bgGradient: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    id: 4,
    title: "Active This Week",
    value: "432",
    icon: <Activity className="w-12 h-12 text-white" />,
    bgGradient: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
];

const AdminCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full p-3">
      {cardsData.map((card) => (
        <div
          key={card.id}
          className={`${card.bgGradient} flex items-center justify-between 
          p-5 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]`}
        >
          <div>
            <h4 className="text-white text-sm font-semibold">{card.title}</h4>
            <p className="text-white text-3xl font-bold mt-2">{card.value}</p>
          </div>
          <div>{card.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminCards;
