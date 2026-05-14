import { FiActivity, FiClock, FiAlertTriangle, FiGrid } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useLocalizedNumber } from "../../utils/formatNumber";
import "../../styles/farmerdashboard.css";

const SummaryCards = ({ stats, loading }) => {
  const { t } = useTranslation('dashboard');
  const fmt = useLocalizedNumber();

  const cards = [
    {
      title: t('stats.totalLivestock'),
      value: loading ? "—" : fmt(stats?.total_livestock ?? 0),
      icon: <FiGrid />,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: t('stats.upcomingVaccinations'),
      value: loading ? "—" : fmt(stats?.upcoming_vaccinations ?? 0),
      icon: <FiClock />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: t('stats.underTreatment'),
      value: loading ? "—" : fmt(stats?.under_treatment ?? 0),
      icon: <FiActivity />,
      color: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: t('stats.overdueTasks'),
      value: loading ? "—" : fmt(stats?.overdue_tasks ?? 0),
      icon: <FiAlertTriangle />,
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

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
              <h2 className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${loading ? "text-slate-300 animate-pulse" : "text-slate-800"}`}>
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
