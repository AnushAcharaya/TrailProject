import { FiCheckCircle, FiAlertCircle, FiActivity, FiGrid } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "../../styles/farmerdashboard.css";

const typeIcon = (type, status) => {
  if (type === "vaccination") return status === "success" ? <FiCheckCircle /> : <FiAlertCircle />;
  if (type === "treatment") return <FiActivity />;
  return <FiGrid />;
};

const formatTimestamp = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
};

const RecentActivity = ({ activities, loading }) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700 text-sm sm:text-base">{t('recentActivity.title')}</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3 rounded-lg bg-slate-50">
              <div className="w-5 h-5 rounded-full bg-slate-200 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 sm:p-4 rounded-lg flex items-start gap-3 ${
                activity.status === "success" ? "bg-green-50" : "bg-yellow-50"
              }`}
            >
              <div className={`mt-0.5 ${activity.status === "success" ? "text-green-600" : "text-yellow-600"}`}>
                {typeIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm sm:text-base truncate sm:whitespace-normal">
                  {activity.description}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
