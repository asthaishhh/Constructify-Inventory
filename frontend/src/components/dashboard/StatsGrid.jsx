
import { ArrowDownRight, ArrowRight, ArrowUpRight, Eye, ReceiptIndianRupee, ShoppingCart, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";

const API_URL = import.meta.env.VITE_API_URL || '';

const StatsGrid = () => {
  // replaced totalOrders with customerOrders
  const [customerOrders, setCustomerOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch customer orders count from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders for revenue and customer orders count
        const ordersRes = await axios.get(`${API_URL}/api/dashboard-orders`);
        const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const customersCount = allOrders.filter((o) => o.type === "customers").length;
        setCustomerOrders(customersCount);

        // Calculate total revenue from all orders
        const revenue = allOrders.reduce((sum, order) => sum + (order.quantity * order.price || 0), 0);
        setTotalRevenue(revenue);

        // Fetch employees for cost
        const employeesRes = await axios.get(`${API_URL}/api/employees`);
        const employees = Array.isArray(employeesRes.data) ? employeesRes.data : [];
        const cost = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
        setTotalCost(cost);

        // Calculate profit
        const profit = revenue - cost;
        setTotalProfit(profit);

      } catch (err) {
        console.error("Error fetching data:", err);
        setCustomerOrders(0);
        setTotalRevenue(0);
        setTotalCost(0);
        setTotalProfit(0);
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

  const StatsData = [
    {
      title: "Total Revenue",
      value: loading ? "..." : formatIndianPrice(totalRevenue),
      change: "+12.5%",
      trend: "up",
      icon: ReceiptIndianRupee,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Profit",
      value: loading ? "..." : formatIndianPrice(totalProfit),
      change: "+9.8%",
      trend: "up",
      icon: ArrowUpRight,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Cost",
      value: loading ? "..." : formatIndianPrice(totalCost),
      change: "-3.2%",
      trend: "down",
      icon: ArrowDownRight,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Customer Orders",
      value: loading ? "..." : customerOrders.toString(),
      change: "+15.3%",
      trend: "up",
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
                {stats.trend === "up" ?
                  (<ArrowUpRight className="w-4 h-4 text-emerald-500" />) : (<ArrowDownRight className="w-4 h-4 text-red-500" />)}

                <span
                  className={`text-sm font-semibold ${stats.trend === "up" ? "text-emerald-500" : "text-red-500"
                    }`}
                >
                  {stats.change}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">VS last</span>
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
