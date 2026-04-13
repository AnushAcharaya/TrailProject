import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { fetchAdminDashboardStats } from "../services/api";

export default function StatsSection() {
  const { t } = useTranslation('admin');
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const result = await fetchAdminDashboardStats();
      if (result.success) {
        // Set monthly verifications data
        if (result.data.monthly_verifications && result.data.monthly_verifications.length > 0) {
          setMonthlyData(result.data.monthly_verifications);
        } else {
          // Fallback to mock data if no real data
          setMonthlyData([
            { name: "Jan", farmers: 0, veterinarians: 0 },
            { name: "Feb", farmers: 0, veterinarians: 0 },
            { name: "Mar", farmers: 0, veterinarians: 0 },
            { name: "Apr", farmers: 0, veterinarians: 0 },
            { name: "May", farmers: 0, veterinarians: 0 },
            { name: "Jun", farmers: 0, veterinarians: 0 },
          ]);
        }

        // Set weekly activity data
        if (result.data.weekly_activity && result.data.weekly_activity.length > 0) {
          setWeeklyData(result.data.weekly_activity);
        } else {
          // Fallback to mock data if no real data
          setWeeklyData([
            { name: "Mon", value: 0 },
            { name: "Tue", value: 0 },
            { name: "Wed", value: 0 },
            { name: "Thu", value: 0 },
            { name: "Fri", value: 0 },
            { name: "Sat", value: 0 },
            { name: "Sun", value: 0 },
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Set empty data on error
      setMonthlyData([
        { name: "Jan", farmers: 0, veterinarians: 0 },
        { name: "Feb", farmers: 0, veterinarians: 0 },
        { name: "Mar", farmers: 0, veterinarians: 0 },
        { name: "Apr", farmers: 0, veterinarians: 0 },
        { name: "May", farmers: 0, veterinarians: 0 },
        { name: "Jun", farmers: 0, veterinarians: 0 },
      ]);
      setWeeklyData([
        { name: "Mon", value: 0 },
        { name: "Tue", value: 0 },
        { name: "Wed", value: 0 },
        { name: "Thu", value: 0 },
        { name: "Fri", value: 0 },
        { name: "Sat", value: 0 },
        { name: "Sun", value: 0 },
      ]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 h-64 sm:h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 h-64 sm:h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Monthly Verifications Chart */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 h-64 sm:h-72 md:h-80">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t('dashboard.charts.monthlyVerifications')}</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#666" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 10, fill: "#666" }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="farmers" fill="#2E7D32" name={t('dashboard.charts.farmers')} />
            <Bar dataKey="veterinarians" fill="#A5D6A7" name={t('dashboard.charts.veterinarians')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 h-64 sm:h-72 md:h-80">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t('dashboard.charts.weeklyActivity')}</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#666" }}
              interval={0}
            />
            <YAxis tick={{ fontSize: 10, fill: "#666" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2E7D32"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}