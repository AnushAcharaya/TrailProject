import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import "../../styles/farmerdashboard.css";

const activities = [
  {
    title: "Cattle #A142 Vaccinated",
    time: "2 hours ago",
    type: "success",
    icon: <FiCheckCircle />,
  },
  {
    title: "Overdue Vaccination - Sheep #B203",
    time: "4 hours ago",
    type: "warning",
    icon: <FiAlertCircle />,
  },
  {
    title: "Health Check Completed - Goat #C089",
    time: "6 hours ago",
    type: "success",
    icon: <FiCheckCircle />,
  },
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Recent Activity</h3>
        <button className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 rounded-lg flex items-start gap-3 ${
              activity.type === "success" ? "bg-green-50" : "bg-yellow-50"
            }`}
          >
            <div
              className={`mt-0.5 ${
                activity.type === "success" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 text-sm sm:text-base truncate sm:whitespace-normal">
                {activity.title}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
