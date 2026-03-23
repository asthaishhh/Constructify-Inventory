
import { ArrowDownRight, ArrowRight, ArrowUpRight, ReceiptIndianRupee, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getDashboardAnalytics } from "../../api/dashboard.api.js";

const StatsGrid = () => {
  // replaced totalOrders with customerOrders
  const [customerOrders, setCustomerOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [changes, setChanges] = useState({
    revenue: { pct: 0, trend: "flat" },
    profit: { pct: 0, trend: "flat" },
    cost: { pct: 0, trend: "flat" },
    orders: { pct: 0, trend: "flat" },
  });
  const [loading, setLoading] = useState(true);

  const getChangeMeta = (currentValue, previousValue) => {
    const current = Number(currentValue || 0);
    const previous = Number(previousValue || 0);

    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return { pct: 0, trend: "flat" };
    }

    if (previous === 0) {
      if (current > 0) return { pct: 100, trend: "up" };
      return { pct: 0, trend: "flat" };
    }

    const rawPct = ((current - previous) / Math.abs(previous)) * 100;
    const pct = Number(rawPct.toFixed(1));
    if (pct > 0) return { pct, trend: "up" };
    if (pct < 0) return { pct, trend: "down" };
    return { pct: 0, trend: "flat" };
  };

  // fetch customer orders count from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const analytics = await getDashboardAnalytics();
        const summary = analytics?.summary || {};
        const revenueTrend = Array.isArray(analytics?.revenueTrend) ? analytics.revenueTrend : [];
        const currentMonth = revenueTrend[revenueTrend.length - 1] || {};
        const previousMonth = revenueTrend[revenueTrend.length - 2] || {};

        const revenue = Number(summary.totalRevenue || 0);
        const cost = Number(summary.orderRevenue || 0);
        const profit = revenue - cost;

        setCustomerOrders(Number(summary.totalOrders || 0));
        setTotalRevenue(revenue);
        setTotalCost(cost);
        setTotalProfit(profit);
        setChanges({
          revenue: getChangeMeta(currentMonth.revenue, previousMonth.revenue),
          profit: getChangeMeta(currentMonth.profit, previousMonth.profit),
          cost: getChangeMeta(currentMonth.expenses, previousMonth.expenses),
          orders: getChangeMeta(currentMonth.orders, previousMonth.orders),
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setCustomerOrders(0);
        setTotalRevenue(0);
        setTotalCost(0);
        setTotalProfit(0);
        setChanges({
          revenue: { pct: 0, trend: "flat" },
          profit: { pct: 0, trend: "flat" },
          cost: { pct: 0, trend: "flat" },
          orders: { pct: 0, trend: "flat" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatIndianPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (value) => {
    const numeric = Number(value || 0);
    if (numeric > 0) return `+${numeric}%`;
    return `${numeric}%`;
  };

  const StatsData = [
    {
      title: "Total Revenue",
      value: loading ? "..." : formatIndianPrice(totalRevenue),
      change: loading ? "..." : formatChange(changes.revenue.pct),
      trend: changes.revenue.trend,
      icon: ReceiptIndianRupee,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Profit",
      value: loading ? "..." : formatIndianPrice(totalProfit),
      change: loading ? "..." : formatChange(changes.profit.pct),
      trend: changes.profit.trend,
      icon: ArrowUpRight,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Cost",
      value: loading ? "..." : formatIndianPrice(totalCost),
      change: loading ? "..." : formatChange(changes.cost.pct),
      trend: changes.cost.trend,
      icon: ArrowDownRight,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Customer Orders",
      value: loading ? "..." : customerOrders.toString(),
      change: loading ? "..." : formatChange(changes.orders.pct),
      trend: changes.orders.trend,
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {StatsData.map((stats, index) => (
        <div
          key={index}
          className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300 group ${stats.bgColor}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {stats.title}
              </p>
              <p className={`text-3xl font-bold text-slate-800 dark:text-white mb-2 ${stats.textColor}`}>
                {stats.value}
              </p>
              <div className=" flex items-center space-x-2">
                {stats.trend === "up" && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {stats.trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                {stats.trend === "flat" && <ArrowRight className="w-4 h-4 text-slate-400" />}

                <span
                  className={`text-sm font-semibold ${
                    stats.trend === "up"
                      ? "text-emerald-500"
                      : stats.trend === "down"
                        ? "text-red-500"
                        : "text-slate-500"
                  }`}
                >
                  {stats.change}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">vs previous month</span>
              </div>
            </div>
            <div
              className={`p-3 rounded-xl ${stats.bgColor} group-hover:scale-110 transition-all duration-300 text-xl ${stats.textColor}`}>
              <stats.icon className={`w-6 h-6 ${stats.textColor}`} />
            </div>
          </div>
          {/* PROGRESS BAR */}
          <div className="mt-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`w-full bg-gradient-to-r ${stats.color} h-2 rounded-full transition-all duration-100`}
              style={{ width: stats.trend === "up" ? "75%" : "45%" }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
