import React, { useState, useEffect, useMemo } from "react";
import { getDashboardAnalytics } from "../api/dashboard.api.js";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, ReceiptIndianRupee,
  ShoppingCart, Package, AlertTriangle, BarChart2,
  Calendar, X, ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  color: "#1f2937",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

/* Convert "Jan 2025" / "Jan" / "2025-01" → Date (first of that month) */
const parseMonthLabel = (label = "") => {
  if (!label) return null;
  // "2025-01" format
  if (/^\d{4}-\d{2}/.test(label)) return new Date(label + "-01");
  // "Jan 2025" or "Jan"
  const parts = label.trim().split(" ");
  const monthStr = parts[0];
  const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
  const d = new Date(`${monthStr} 1, ${year}`);
  return isNaN(d.getTime()) ? null : d;
};

/* Quick-preset ranges */
const PRESETS = [
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

const ChartCard = ({ title, subtitle, children, className = "", badge }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 ${className}`}>
    <div className="flex items-start justify-between gap-2 mb-4">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {badge}
    </div>
    {children}
  </div>
);

const LegendRow = ({ items }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-1.5 min-w-0">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || item.fill }} />
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.name || item.status}</span>
        <span className="text-xs font-bold text-gray-800 dark:text-white ml-auto">{item.value}%</span>
      </div>
    ))}
  </div>
);

const Skeleton = () => (
  <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
);

const EmptyChart = ({ height = 200 }) => (
  <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-2" style={{ height }}>
    <BarChart2 className="w-8 h-8" />
    <span className="text-xs">No data for selected range</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

const ConstructifyAnalytics = () => {
  /* ── raw data from API ── */
  const [rawRevenue,    setRawRevenue]    = useState([]);
  const [rawProfit,     setRawProfit]     = useState([]);
  const [salesCategoryData,  setSalesCategoryData]  = useState([]);
  const [expenseBreakdownData, setExpenseBreakdownData] = useState([]);
  const [orderStatusData,    setOrderStatusData]    = useState([]);
  const [stockLevelsData,    setStockLevelsData]    = useState([]);
  const [baseSummary,   setBaseSummary]   = useState({ totalRevenue: 0, totalOrders: 0, lowStockCount: 0 });
  const [statsLoading,  setStatsLoading]  = useState(true);

  /* ── filter state ── */
  const [dateFrom,      setDateFrom]      = useState("");   // "YYYY-MM"
  const [dateTo,        setDateTo]        = useState("");   // "YYYY-MM"
  const [showPicker,    setShowPicker]    = useState(false);
  const [activePreset,  setActivePreset]  = useState(null); // label string | null

  /* ── chart type ── */
  const [chartType, setChartType] = useState("Revenue");

  /* ── load analytics ── */
  useEffect(() => {
    const load = async () => {
      try {
        setStatsLoading(true);
        const a = await getDashboardAnalytics();
        setRawRevenue(Array.isArray(a?.revenueTrend)       ? a.revenueTrend       : []);
        setRawProfit(Array.isArray(a?.profitMarginTrend)    ? a.profitMarginTrend  : []);
        setSalesCategoryData(Array.isArray(a?.salesByCategory)   ? a.salesByCategory   : []);
        setExpenseBreakdownData(Array.isArray(a?.expenseBreakdown)  ? a.expenseBreakdown  : []);
        setOrderStatusData(Array.isArray(a?.orderStatus)    ? a.orderStatus    : []);
        setStockLevelsData(Array.isArray(a?.stockLevels)    ? a.stockLevels    : []);
        setBaseSummary({
          totalRevenue:  Number(a?.summary?.totalRevenue  || 0),
          totalOrders:   Number(a?.summary?.totalOrders   || 0),
          lowStockCount: Number(a?.summary?.lowStockCount || 0),
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  /* ── filter helpers ── */
  const toYM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const applyPreset = (months) => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    setDateFrom(toYM(start));
    setDateTo(toYM(now));
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setActivePreset(null);
  };

  const isFiltered = dateFrom || dateTo;

  /* ── filtered time-series data ── */
  const filterByRange = (arr) => {
    if (!dateFrom && !dateTo) return arr;
    return arr.filter((row) => {
      const d = parseMonthLabel(row.month);
      if (!d) return true;
      const ym = toYM(d);
      if (dateFrom && ym < dateFrom) return false;
      if (dateTo   && ym > dateTo)   return false;
      return true;
    });
  };

  const revenueData    = useMemo(() => filterByRange(rawRevenue), [rawRevenue, dateFrom, dateTo]);
  const profitMarginData = useMemo(() => filterByRange(rawProfit),  [rawProfit,  dateFrom, dateTo]);

  /* ── derived stat card values from filtered revenue data ── */
  const filteredStats = useMemo(() => {
    if (!isFiltered) return baseSummary;
    const rev    = revenueData.reduce((s, r) => s + (Number(r.revenue) || 0), 0);
    const orders = revenueData.reduce((s, r) => s + (Number(r.orders)  || 0), 0);
    return {
      totalRevenue:  rev    || baseSummary.totalRevenue,
      totalOrders:   orders || baseSummary.totalOrders,
      lowStockCount: baseSummary.lowStockCount,
    };
  }, [revenueData, isFiltered, baseSummary]);

  /* ── chart config ── */
  const chartConfig = {
    Revenue: { dataKey: "revenue",  color: "#2563eb" },
    Orders:  { dataKey: "expenses", color: "#6366f1" },
    Profit:  { dataKey: "profit",   color: "#10b981" },
  }[chartType];

  /* ── formatting ── */
  const formatINR = (v) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);

  /* ── filter label for display ── */
  const filterLabel = useMemo(() => {
    if (!isFiltered) return "All time";
    const fmt = (ym) => {
      if (!ym) return "";
      const [y, m] = ym.split("-");
      return new Date(+y, +m - 1, 1).toLocaleString("en-IN", { month: "short", year: "numeric" });
    };
    if (dateFrom && dateTo) return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
    if (dateFrom)           return `From ${fmt(dateFrom)}`;
    return `Up to ${fmt(dateTo)}`;
  }, [dateFrom, dateTo, isFiltered]);

  /* ────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
              <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Analytics
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Comprehensive insights into your inventory performance
              </p>
            </div>
          </div>

          {/* ── Date filter pill ── */}
          <div className="relative">
            <button
              onClick={() => setShowPicker((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all shadow-sm
                ${isFiltered
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-200 dark:shadow-blue-900/40"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                }`}
            >
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="max-w-[180px] truncate">{filterLabel}</span>
              {isFiltered
                ? <X className="w-3.5 h-3.5 ml-1 flex-shrink-0" onClick={(e) => { e.stopPropagation(); clearDates(); }} />
                : <ChevronDown className={`w-3.5 h-3.5 ml-1 flex-shrink-0 transition-transform ${showPicker ? "rotate-180" : ""}`} />
              }
            </button>

            {/* Dropdown picker */}
            {showPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 w-[300px] sm:w-[340px]">
                {/* Quick presets */}
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Quick Select</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRESETS.map(({ label, months }) => (
                    <button
                      key={label}
                      onClick={() => { applyPreset(months); setActivePreset(label); setShowPicker(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                        ${activePreset === label
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:border-blue-300"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Custom Range</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">From</label>
                    <input
                      type="month"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => { setDateFrom(e.target.value); setActivePreset(null); }}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">To</label>
                    <input
                      type="month"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => { setDateTo(e.target.value); setActivePreset(null); }}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { clearDates(); setShowPicker(false); }}
                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Active filter badge */}
        {isFiltered && (
          <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl w-fit">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Showing data for: {filterLabel}
            </span>
            <button onClick={clearDates} className="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            {
              label: "Total Revenue", value: statsLoading ? null : formatINR(filteredStats.totalRevenue),
              icon: <ReceiptIndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />,
              bg: "bg-green-50 dark:bg-green-900/20",
              trend: <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" />+12.5%</span>,
            },
            {
              label: "Customer Orders", value: statsLoading ? null : filteredStats.totalOrders.toLocaleString("en-IN"),
              icon: <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
              bg: "bg-blue-50 dark:bg-blue-900/20",
              trend: <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" />+8.2%</span>,
            },
            {
              label: "Low Stock Items", value: statsLoading ? null : String(filteredStats.lowStockCount),
              icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
              bg: "bg-amber-50 dark:bg-amber-900/20",
              trend: <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" />+3.1%</span>,
            },
            {
              label: "Stock Turnover", value: "4.2×",
              icon: <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
              trend: <span className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs font-semibold"><TrendingDown className="w-3.5 h-3.5" />-2.3%</span>,
            },
          ].map(({ label, value, icon, bg, trend }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>{icon}</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {value === null ? <Skeleton /> : value}
              </div>
              {trend}
            </div>
          ))}
        </section>

        {/* ── Revenue / Orders / Profit Trend (full width) ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Revenue & Orders Trend</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {isFiltered ? `Filtered: ${filterLabel}` : "All-time monthly performance"}
              </p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1 gap-1 w-full sm:w-auto">
              {["Revenue", "Orders", "Profit"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    chartType === t
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {revenueData.length === 0 ? <EmptyChart height={280} /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartConfig.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey={chartConfig.dataKey}
                  stroke={chartConfig.color}
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: chartConfig.color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Middle row: Sales Pie + Expenses + Order Status ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">

          <ChartCard title="Sales by Category" subtitle="Product distribution breakdown">
            {salesCategoryData.length === 0 ? <EmptyChart /> : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={salesCategoryData} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {salesCategoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <LegendRow items={salesCategoryData} />
              </>
            )}
          </ChartCard>

          <ChartCard title="Expense Breakdown" subtitle="Cost distribution analysis">
            {expenseBreakdownData.length === 0 ? <EmptyChart height={240} /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={expenseBreakdownData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={85} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {expenseBreakdownData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Order Status" subtitle="Current order pipeline">
            {orderStatusData.length === 0 ? <EmptyChart height={180} /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="80%"
                      startAngle={180} endAngle={0}
                      innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                      {orderStatusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <LegendRow items={orderStatusData} />
              </>
            )}
          </ChartCard>
        </div>

        {/* ── Bottom row: Profit Margin + Stock Levels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pb-8">

          {/* Profit Margin — responds to date filter */}
          <ChartCard
            title="Profit Margin Trends"
            subtitle={isFiltered ? `Filtered: ${filterLabel}` : "Monthly profitability tracking"}
          >
            {profitMarginData.length === 0 ? <EmptyChart height={260} /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={profitMarginData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="margin" fill="url(#marginGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Stock Levels */}
          <ChartCard
            title="Inventory Stock Levels"
            subtitle="Current vs minimum required"
            badge={
              filteredStats.lowStockCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {statsLoading ? "…" : `${filteredStats.lowStockCount} low`}
                  </span>
                </div>
              )
            }
          >
            <div className="space-y-4">
              {stockLevelsData.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No stock data available</p>
              )}
              {stockLevelsData.map((item, i) => {
                const pct    = Math.min(100, Math.round((item.current / item.max) * 100));
                const isLow  = item.current <= item.minimum;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        {isLow && <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                        {item.material}
                      </span>
                      <span className={`text-xs font-bold ${isLow ? "text-amber-500" : "text-gray-700 dark:text-gray-300"}`}>
                        {item.current} <span className="font-normal text-gray-400">/ {item.max}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${isLow ? "from-amber-400 to-orange-500" : "from-blue-500 to-indigo-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-gray-400">Min: {item.minimum}</span>
                      <span className="text-[10px] text-gray-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default ConstructifyAnalytics;