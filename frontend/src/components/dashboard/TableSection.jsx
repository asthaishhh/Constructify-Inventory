// // ...existing code...
// import { MoreHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import axios from "axios";

// function TableSection() {
//   const [orders, setOrders] = useState([]);
//   const [showAll, setShowAll] = useState(false);

//   const API_URL = import.meta.env.VITE_API_URL || '';
  


//   useEffect(() => {
//     const fetchCustomerOrders = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/dashboard-orders`);
//         const data = Array.isArray(res.data) ? res.data : [];

//         // keep only customer orders and normalize fields for the recent table
//         const customerOrders = data
//           .filter((o) => o.type === "customers")
//           .map((o) => {
//             const qty = Number(o.quantity) || 0;
//             const price = Number(o.price) || 0;
//             const amountValue = qty && price ? qty * price : (o.amount ? Number(String(o.amount).replace(/[^0-9.-]+/g,"")) : 0);
//             return {
//               id: o.id ?? o.orderId ?? "",
//               customer: o.client ?? o.customer ?? "—",
//               product: o.product ?? o.pair ?? "",
//               amount: formatIndianPrice(amountValue),
//               status: o.status ?? "unknown",
//               date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "",
//             };
//           });

//         setOrders(customerOrders);
//       } catch (err) {
//         console.error("Error fetching customer orders:", err);
//         setOrders([]);
//       }
//     };

//     fetchCustomerOrders();
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case "completed":
//         return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
//       case "pending":
//         return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
//       case "cancelled":
//         return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
//       default:
//         return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
//     }
//   };

//   const products = [
//     {
//       name: "Cement",
//       sales: 3421,
//       revenue: "Rs 68,420",
//       trend: "up",
//       change: "1.2%",
//     },
//     {
//       name: "Bricks",
//       sales: 2783,
//       revenue: "Rs 54,660",
//       trend: "down",
//       change: "-0.8%",
//     },
//     {
//       name: "Iron Rods",
//       sales: 1950,
//       revenue: "Rs 78,000",
//       trend: "up",
//       change: "2.5%",
//     },
//     {
//       name: "Sand",
//       sales: 3120,
//       revenue: "Rs 46,800",
//       trend: "up",
//       change: "1.0%",
//     },
//   ];

//   const visibleOrders = showAll ? orders : orders.slice(0, 5);

//   function formatIndianPrice(value) {
//     const v = Number(value) || 0;
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(v);
//   }

//   return (
//     <div className="space-y-6">
//       {/* Recent Orders */}
//       <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
//         <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-bold text-slate-800 dark:text-white">
//                 Recent
//               </h3>
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 Latest customer orders
//               </p>
//             </div>

//             <button
//               onClick={() => setShowAll(!showAll)}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//             >
//               {showAll ? "Show Less" : "View All"}
//             </button>
//           </div>
//         </div>
//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr>
//                 <th className="text-left p-4 text-sm font-semibold text-slate-600">
//                   Order ID
//                 </th>
//                 <th className="text-left p-4 text-sm font-semibold text-slate-600">
//                   Customer
//                 </th>
//                 <th className="text-left p-4 text-sm font-semibold text-slate-600">
//                   Product
//                 </th>
//                 <th className="text-left p-4 text-sm font-semibold text-slate-600">
//                   Amount
//                 </th>
//                 <th className="text-left p-4 text-sm font-semibold text-slate-600">
//                   Status
//                 </th>
//                 <th className="text-left p-4 text-sm font-semibold text-slate-600">
//                   Date
//                 </th>
//                 <th className="p-4"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {visibleOrders.map((order, index) => (
//                 <tr
//                   key={index}
//                   className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
//                 >
//                   <td className="p-4 text-sm font-medium text-blue-600">{order.id}</td>
//                   <td className="p-4 text-sm text-slate-800 dark:text-white">{order.customer}</td>
//                   <td className="p-4 text-sm text-slate-800 dark:text-white">{order.product}</td>
//                   <td className="p-4 text-sm text-slate-800 dark:text-white">{order.amount}</td>
//                   <td className="p-4">
//                     <span
//                       className={`${getStatusColor(order.status)} font-medium text-xs px-3 py-1 rounded-full`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>
//                   <td className="p-4 text-sm text-slate-800 dark:text-white">{order.date}</td>
//                   <td className="p-4">
//                     <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>

//           </table>
//         </div>
//       </div>

//       {/* Top Products */}
//       <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
//         <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-bold text-slate-800 dark:text-white">
//               Top Products
//             </h3>
//           </div>

//           <div className="p-6 space-y-4">
//             {products.map((product, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
//               >
//                 <div className="flex-1">
//                   <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
//                     {product.name}
//                   </h4>
//                   <p className="text-xs text-slate-500 dark:text-slate-400">{product.sales}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-semibold text-slate-800 dark:text-white">
//                     {product.revenue}
//                   </p>
//                   <div className="flex items-center space-x-1">
//                     {product.trend === "up" ? (
//                       <TrendingUp className="w-5 h-4 text-emerald-500" />
//                     ) : (
//                       <TrendingDown className="w-5 h-4 text-red-500" />
//                     )}
//                     <span
//                       className={`text-xs font-medium ${product.trend === "up" ? "text-emerald-500" : "text-red-500"
//                         }`}
//                     >
//                       {product.change}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default TableSection;
// // ...existing code...


import { MoreHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from "../../utils/axiosConfig";

function TableSection() {
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const API_BASE_URL = "/api";

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard-orders`);
        const data = Array.isArray(res.data) ? res.data : [];

        // keep only customer orders and normalize fields for the recent table
        const customerOrders = data
          .filter((o) => o.type === "customers")
          .map((o) => {
            const qty = Number(o.quantity) || 0;
            const price = Number(o.price) || 0;
            const amountValue = qty && price ? qty * price : (o.amount ? Number(String(o.amount).replace(/[^0-9.-]+/g,"")) : 0);
            return {
              id: o.id ?? o.orderId ?? "",
              customer: o.client ?? o.customer ?? "—",
              product: o.product ?? o.pair ?? "",
              amount: formatIndianPrice(amountValue),
              status: o.status ?? "unknown",
              date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "",
            };
          });

        setOrders(customerOrders);
      } catch (err) {
        console.error("Error fetching customer orders:", err);
        setOrders([]);
      }
    };

    fetchCustomerOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const products = [
    {
      name: "Cement",
      sales: 3421,
      revenue: "Rs 68,420",
      trend: "up",
      change: "1.2%",
    },
    {
      name: "Bricks",
      sales: 2783,
      revenue: "Rs 54,660",
      trend: "down",
      change: "-0.8%",
    },
    {
      name: "Iron Rods",
      sales: 1950,
      revenue: "Rs 78,000",
      trend: "up",
      change: "2.5%",
    },
    {
      name: "Sand",
      sales: 3120,
      revenue: "Rs 46,800",
      trend: "up",
      change: "1.0%",
    },
  ];

  const visibleOrders = showAll ? orders : orders.slice(0, 5);

  function formatIndianPrice(value) {
    const v = Number(value) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  }

  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Recent
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Latest customer orders
              </p>
            </div>

            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Order ID
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Customer
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Product
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Amount
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Date
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-blue-600">{order.id}</td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.customer}</td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.product}</td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.amount}</td>
                  <td className="p-4">
                    <span
                      className={`${getStatusColor(order.status)} font-medium text-xs px-3 py-1 rounded-full`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.date}</td>
                  <td className="p-4">
                    <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Top Products
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.sales}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {product.revenue}
                  </p>
                  <div className="flex items-center space-x-1">
                    {product.trend === "up" ? (
                      <TrendingUp className="w-5 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-5 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${product.trend === "up" ? "text-emerald-500" : "text-red-500"
                        }`}
                    >
                      {product.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default TableSection;
// ...existing code...
