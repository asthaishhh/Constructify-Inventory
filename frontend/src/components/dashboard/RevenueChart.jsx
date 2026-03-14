import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const RevenueChart = () => {

  const RevenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 38000, profit: 14000 },
    { month: 'Mar', revenue: 48000, expenses: 35000, profit: 13000 },
    { month: 'Apr', revenue: 61000, expenses: 42000, profit: 19000 },
    { month: 'May', revenue: 55000, expenses: 39000, profit: 16000 },
    { month: 'Jun', revenue: 48000, expenses: 36000, profit: 12000 },
    { month: 'Jul', revenue: 68000, expenses: 45000, profit: 23000 },
    { month: 'Aug', revenue: 72000, expenses: 48000, profit: 24000 },
    { month: 'Sep', revenue: 89000, expenses: 62000, profit: 27000 },
    { month: 'Oct', revenue: 98000, expenses: 68000, profit: 30000 },
    { month: 'Nov', revenue: 34000, expenses: 28000, profit: 6000 },
    { month: 'Dec', revenue: 75000, expenses: 52000, profit: 23000 }
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Revenue Chart
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monthly Revenue and Expenses
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Revenue
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-slate-500 rounded-full"></div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Expenses
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={RevenueData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f8" opacity={0.3} />
            <XAxis
              dataKey="month"
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => `₹ ${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                color: "#000000" // ensure tooltip text is black
              }}
              formatter={(value, name) => [`₹ ${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
              labelFormatter={label => `Month: ${label}`}
            />
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expenses"
              fill="url(#expenseGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
