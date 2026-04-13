// AdminCards.jsx
import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminDashboardStats } from "../services/api";

const AdminCards = () => {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState({
    total_registrations: 0,
    pending_reviews: 0,
    approved_accounts: 0,
    active_this_week: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const response = await fetchAdminDashboardStats();
    if (response.success) {
      setStats(response.data.stats);
    } else {
      console.error('Failed to fetch stats:', response.error);
    }
    setLoading(false);
  };

  const cardsData = [
    {
      id: 1,
      title: t('dashboard.cards.totalRegistrations'),
      value: loading ? "..." : stats.total_registrations.toLocaleString(),
      icon: <Users className="w-12 h-12 text-white" />,
      bgGradient: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: t('dashboard.cards.pendingReviews'),
      value: loading ? "..." : stats.pending_reviews.toLocaleString(),
      icon: <Clock className="w-12 h-12 text-white" />,
      bgGradient: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    },
    {
      id: 3,
      title: t('dashboard.cards.approvedAccounts'),
      value: loading ? "..." : stats.approved_accounts.toLocaleString(),
      icon: <CheckCircle className="w-12 h-12 text-white" />,
      bgGradient: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      id: 4,
      title: t('dashboard.cards.activeThisWeek'),
      value: loading ? "..." : stats.active_this_week.toLocaleString(),
      icon: <Activity className="w-12 h-12 text-white" />,
      bgGradient: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
  ];

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
