import { useTranslation } from "react-i18next";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import "../../styles/farmerdashboard.css";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const ChartsSection = ({ charts, loading }) => {
  const { t } = useTranslation('dashboard');

  const livestockData = charts?.livestock_distribution ?? [];
  const monthlyData = charts?.monthly_vaccinations ?? [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 sm:p-6 card-shadow animate-pulse">
            <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
            <div className="h-56 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Livestock Distribution — Pie Chart */}
      <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
        <h3 className="font-semibold text-slate-700 mb-1 text-sm sm:text-base">
          {t('charts.livestockDistribution')}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t('charts.totalAnimals')}</p>

        {livestockData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-sm">No livestock data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={livestockData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {livestockData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Vaccination Status — Bar Chart */}
      <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
        <h3 className="font-semibold text-slate-700 mb-1 text-sm sm:text-base">
          {t('charts.vaccinationStatus')}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t('charts.monthlyVaccinated')}</p>

        {monthlyData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-sm">No vaccination data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend iconType="square" iconSize={10} />
              <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;
