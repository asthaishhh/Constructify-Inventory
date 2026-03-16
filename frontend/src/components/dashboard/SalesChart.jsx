import React from 'react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getDashboardAnalytics } from "../../api/dashboard.api";

const SalesChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analytics = await getDashboardAnalytics();
        setData(Array.isArray(analytics?.salesByCategory) ? analytics.salesByCategory : []);
      } catch (error) {
        console.error("Failed to load sales category data", error);
        setData([]);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-b-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Sales by Category
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Production Distribution
        </p>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* <div className="space-y-3 mt-4">
        {data.map((item, index) => (
          <div className="flex items-center justify-between" key={index}>
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white">
              {item.value}%
            </div>
          </div>
        ))}
      </div> */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-10 mt-6">
  {data.map((item, index) => (
    <div key={index} className="flex items-center justify-between h-6">
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        ></span>
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {item.name}
        </span>
      </div>

      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {item.value}%
      </span>
    </div>
  ))}
</div>


    </div>
  );
};

export default SalesChart;
