import React from 'react';
import { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ReceiptIndianRupee, ShoppingCart, Package, AlertTriangle } from 'lucide-react';


const ConstructifyAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState('Last 30 days');
  const [chartType, setChartType] = useState('Revenue');
  const [darkMode, setDarkMode] = useState(true);

  const [expenseBreakdownData, setExpenseBreakdownData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [salesCategoryData, setSalesCategoryData] = useState([]);
  const [profitMarginData, setProfitMarginData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [stockLevelsData, setStockLevelsData] = useState([]);

  // New states for dynamic stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  // ✅ Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ✅ Function to fetch chart by type
  const fetchChartData = async (type) => {
    try {
      const res = await axios.get(`${API_URL}/api/charts/${type}`);
      return res.data.data; // assuming your backend sends { data: [...] }
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const revenueExpenses = await fetchChartData("revenueExpenses");
      const salesCategory = await fetchChartData("salesByCategory");
      const profitMargin = await fetchChartData("profitMargin");
      const orderStatus = await fetchChartData("orderStatus");
      const stockLevels = await fetchChartData("stockLevels");
      const expenseBreakdown = await fetchChartData("expenseBreakdown"); // ✅ fetch

      setRevenueData(revenueExpenses);      // For your main chart
      setSalesCategoryData(salesCategory);  // For pie chart
      setProfitMarginData(profitMargin);    // For bar chart
      setOrderStatusData(orderStatus);      // For pie chart
      setStockLevelsData(stockLevels);      // For stock bars
      setExpenseBreakdownData(expenseBreakdown);
    };
    loadData();
  }, []);

  // ✅ Fetch dynamic stats from other components' data sources
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);

        // Fetch orders for revenue and total orders count
        const ordersRes = await axios.get(`${API_URL}/api/dashboard-orders`);
        const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const customersCount = allOrders.filter((o) => o.type === "customers").length;
        setTotalOrders(customersCount);

        // Calculate total revenue from all orders
        const revenue = allOrders.reduce((sum, order) => sum + (order.quantity * order.price || 0), 0);
        setTotalRevenue(revenue);

        // Fetch materials for low stock count
        const materialsRes = await axios.get(`${API_URL}/api/materials`);
        const materials = Array.isArray(materialsRes.data) ? materialsRes.data : [];
        const getStockStatus = (material) => {
          if (material.quantity < material.minStock * 0.5) {
            return { status: "Critical" };
          } else if (material.quantity < material.minStock) {
            return { status: "Low Stock" };
          }
          return { status: "In Stock" };
        };
        const lowStockCount = materials.filter(m => getStockStatus(m).status === "Low Stock").length;
        setLowStock(lowStockCount);

      } catch (err) {
        console.error("Error fetching stats:", err);
        setTotalRevenue(0);
        setTotalOrders(0);
        setLowStock(0);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getChartData = () => {
    switch (chartType) {
      case 'Revenue':
        return { dataKey: 'revenue', color: '#00D4AA' };
      case 'Orders':
        return { dataKey: 'expenses', color: '#5B8DEE' };
      case 'Profit':
        return { dataKey: 'profit', color: '#A29BFE' };
      default:
        return { dataKey: 'revenue', color: '#00D4AA' };
    }
  };

  const chartConfig = getChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">Comprehensive insights into your inventory performance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-600 text-sm"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select> */}
            {/* <button className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm">
              Filter
            </button> */}
            {/* <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-sm">
              <span>↓</span> <span className="hidden sm:inline">Export</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-4 sm:px-6 lg:px-8">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Total Revenue</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? "..." : `₹${totalRevenue.toLocaleString('en-IN')}`}
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <ReceiptIndianRupee className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5%</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Customer Orders</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? "..." : totalOrders.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.2%</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Low Stock</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? "..." : lowStock}
              </h3>
            </div>
            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-orange-500 text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+3.1%</span>
          </div>
        </div>

        {/* Stock Turnover */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1">Stock Turnover</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">4.2x</h3>
            </div>
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>-2.3%</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 px-4 sm:px-6 lg:px-8">

        {/* Revenue & Orders Trend - Full Width */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700/40 lg:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">Revenue & Orders Trend</h3>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setChartType('Revenue')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${chartType === 'Revenue'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 dark:bg-[#1a1f37] text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-[#2a3150]'
                  }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartType('Orders')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${chartType === 'Orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-[#1a1f37] text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-[#2a3150]'
                  }`}
              >
                Orders
              </button>
              <button
                onClick={() => setChartType('Profit')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${chartType === 'Profit'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-[#1a1f37] text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-[#2a3150]'
                  }`}
              >
                Profit
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2d3550" : "#e5e7eb"} />
              <XAxis dataKey="month" stroke={darkMode ? "#8892b0" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#8892b0" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#232842' : '#ffffff',
                  border: `1px solid ${darkMode ? '#3d4463' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#1f2937'
                }}
              />
              <Area
                type="monotone"
                dataKey={chartConfig.dataKey}
                stroke={chartConfig.color}
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Product Category */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Sales by Category</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">Product distribution breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={salesCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {salesCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#232842' : '#ffffff',
                  border: `1px solid ${darkMode ? '#3d4463' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#1f2937'
                }}
                itemStyle={{
                  color: darkMode ? '#ffffff' : '#1f2937',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {salesCategoryData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 dark:text-slate-300">{item.name}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Expense Breakdown</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">Cost distribution analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseBreakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2d3550" : "#e5e7eb"} horizontal={false} />
              <XAxis type="number" stroke={darkMode ? "#8892b0" : "#6b7280"} />
              <YAxis type="category" dataKey="category" stroke={darkMode ? "#8892b0" : "#6b7280"} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#232842' : '#ffffff',
                  border: `1px solid ${darkMode ? '#3d4463' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#1f2937'
                }}
                itemStyle={{
                  color: darkMode ? '#ffffff' : '#1f2937',
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {expenseBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Order Status</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">Current order pipeline status</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#252d47' : '#ffffff',
                  border: `1px solid ${darkMode ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#1f2937'
                }}
                itemStyle={{
                  color: darkMode ? '#ffffff' : '#1f2937',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {orderStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs text-gray-600 dark:text-slate-300">{item.status}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profit Margin & Stock Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">

        {/* Profit Margin Trends */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Profit Margin Trends</h3>
            <p className="text-xs text-gray-600 dark:text-slate-400">Monthly profitability tracking</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={profitMarginData}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fde68a" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#f9a8d4" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#d8b4fe" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2a3150" : "#e5e7eb"} vertical={false} />
              <XAxis dataKey="month" stroke={darkMode ? "#A5B4FC" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#A5B4FC" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#232842' : '#ffffff',
                  border: `1px solid ${darkMode ? '#3d4463' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#fff' : '#1f2937'
                }}
              />
              <Bar dataKey="margin" fill="url(#blueGradient)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Levels */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Inventory Stock Levels</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400">Current vs minimum required stock</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">{statsLoading ? "..." : `${lowStock} low`}</span>
            </div>
          </div>

          <div className="space-y-4">
            {stockLevelsData.map((item, idx) => {
              const percentage = (item.current / item.max) * 100;
              const isLow = item.current <= item.minimum;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{item.material}</span>
                    <span className={`text-xs font-bold ${isLow ? 'text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                      {item.current} / {item.max}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-[#1a1f37] rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isLow
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-300'
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructifyAnalytics;



