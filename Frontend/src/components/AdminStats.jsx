import React from "react";
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

export default function StatsSection() {
  // Mock data for Monthly Verifications
  const monthlyData = [
    { name: "Jan", farmers: 40, veterinarians: 15 },
    { name: "Feb", farmers: 50, veterinarians: 20 },
    { name: "Mar", farmers: 60, veterinarians: 10 },
    { name: "Apr", farmers: 55, veterinarians: 25 },
    { name: "May", farmers: 70, veterinarians: 20 },
    { name: "Jun", farmers: 65, veterinarians: 15 },
  ];

  // Mock data for Weekly Activity
  const weeklyData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 20 },
    { name: "Wed", value: 16 },
    { name: "Thu", value: 24 },
    { name: "Fri", value: 18 },
    { name: "Sat", value: 10 },
    { name: "Sun", value: 6 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Monthly Verifications Chart */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 h-64 sm:h-72 md:h-80">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Monthly Verifications</h3>
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
            <Bar dataKey="farmers" fill="#2E7D32" name="Farmers" />
            <Bar dataKey="veterinarians" fill="#A5D6A7" name="Veterinarians" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 h-64 sm:h-72 md:h-80">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Weekly Activity</h3>
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