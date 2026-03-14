// import React, { useMemo, useState } from "react";

// // TraderOrdersDashboard.jsx
// // Single-file React component (Tailwind CSS assumed) that demonstrates
// // a clean dashboard for two order types: "Requested by me" and "Requested by customers".

// export default function TraderOrdersDashboard() {
//   const [activeTab, setActiveTab] = useState("mine"); // 'mine' or 'customers'
//   const [query, setQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   // Sample mock data. Replace with API fetch in production.
//   const orders = useMemo(
//     () => [
//       {
//         id: "ORD-1001",
//         type: "mine",
//         client: "N/A",
//         pair: "BTC/USDT",
//         side: "Buy",
//         quantity: 0.5,
//         price: 54000,
//         status: "open",
//         createdAt: "2025-10-15",
//       },
//       {
//         id: "ORD-1002",
//         type: "customers",
//         client: "Alpha Traders",
//         pair: "ETH/USDT",
//         side: "Sell",
//         quantity: 10,
//         price: 3400,
//         status: "completed",
//         createdAt: "2025-10-18",
//       },
//       {
//         id: "ORD-1003",
//         type: "customers",
//         client: "Beta Capital",
//         pair: "SOL/USDT",
//         side: "Buy",
//         quantity: 200,
//         price: 140,
//         status: "cancelled",
//         createdAt: "2025-10-10",
//       },
//       {
//         id: "ORD-1004",
//         type: "mine",
//         client: "N/A",
//         pair: "BTC/USDT",
//         side: "Sell",
//         quantity: 0.1,
//         price: 54500,
//         status: "executed",
//         createdAt: "2025-10-19",
//       },
//     ],
//     []
//   );

//   // Helper: filter and search
//   const filtered = orders
//     .filter((o) => o.type === activeTab)
//     .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
//     .filter((o) => {
//       if (!query) return true;
//       const q = query.toLowerCase();
//       return (
//         o.id.toLowerCase().includes(q) ||
//         (o.client || "").toLowerCase().includes(q) ||
//         o.pair.toLowerCase().includes(q)
//       );
//     })
//     .filter((o) => {
//       if (!dateFrom && !dateTo) return true;
//       const d = new Date(o.createdAt);
//       if (dateFrom && d < new Date(dateFrom)) return false;
//       if (dateTo && d > new Date(dateTo)) return false;
//       return true;
//     });

//   // Simple export to CSV
//   const exportCSV = () => {
//     const header = [
//       "id",
//       "type",
//       "client",
//       "pair",
//       "side",
//       "quantity",
//       "price",
//       "status",
//       "createdAt",
//     ];
//     const rows = filtered.map((o) => header.map((h) => JSON.stringify(o[h] ?? "")).join(","));
//     const csv = [header.join(","), ...rows].join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `orders_${activeTab}_${new Date().toISOString()}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Row actions (demo)
//   const onView = (id) => alert(`View ${id}`);
//   const onCancel = (id) => {
//     // In production: call API then refresh
//     alert(`Request cancel for ${id} (demo)`);
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <header className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold">Orders Dashboard</h1>
//         <div className="space-x-2 flex items-center">
//           <button
//             onClick={() => setActiveTab("mine")}
//             className={`px-3 py-1 rounded-md ${activeTab === "mine" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
//           >
//             Requested by me
//           </button>
//           <button
//             onClick={() => setActiveTab("customers")}
//             className={`px-3 py-1 rounded-md ${activeTab === "customers" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
//           >
//             Requested by customers
//           </button>
//         </div>
//       </header>

//       <section className="bg-white shadow-sm rounded-md p-4 mb-6">
//         <div className="flex gap-3 items-center mb-4">
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search by order id, client, pair..."
//             className="border rounded p-2 flex-1"
//           />

//           <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded p-2">
//             <option value="all">All statuses</option>
//             <option value="open">Open</option>
//             <option value="executed">Executed</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>

//           <div className="flex items-center gap-2">
//             <label className="text-sm">From</label>
//             <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded p-2" />
//             <label className="text-sm">To</label>
//             <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded p-2" />
//           </div>

//           <button onClick={exportCSV} className="px-3 py-2 bg-green-600 text-white rounded">Export CSV</button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left table-auto border-collapse">
//             <thead>
//               <tr className="text-sm text-gray-600">
//                 <th className="py-2 px-3">Order ID</th>
                    <th className="py-2 px-3">Firm Name</th>
//                 <th className="py-2 px-3">Pair</th>
//                 <th className="py-2 px-3">Side</th>
//                 <th className="py-2 px-3">Qty</th>
//                 <th className="py-2 px-3">Price</th>
//                 <th className="py-2 px-3">Status</th>
//                 <th className="py-2 px-3">Created</th>
//                 <th className="py-2 px-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan={9} className="py-8 text-center text-gray-500">
//                     No orders found
//                   </td>
//                 </tr>
//               )}

//               {filtered.map((o) => (
//                 <tr key={o.id} className="border-t">
//                   <td className="py-3 px-3 font-medium">{o.id}</td>
//                   <td className="py-3 px-3">{o.client || "—"}</td>
//                   <td className="py-3 px-3">{o.pair}</td>
//                   <td className="py-3 px-3">{o.side}</td>
//                   <td className="py-3 px-3">{o.quantity}</td>
//                   <td className="py-3 px-3">{o.price}</td>
//                   <td className="py-3 px-3">
//                     <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusClass(o.status)}`}>{o.status}</span>
//                   </td>
//                   <td className="py-3 px-3">{o.createdAt}</td>
//                   <td className="py-3 px-3 space-x-2">
//                     <button onClick={() => onView(o.id)} className="px-2 py-1 border rounded text-sm">View</button>
//                     {o.status === "open" && <button onClick={() => onCancel(o.id)} className="px-2 py-1 border rounded text-sm">Cancel</button>}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       <section className="grid grid-cols-3 gap-4">
//         <div className="p-4 bg-white shadow-sm rounded-md">
//           <h3 className="text-sm text-gray-600">Orders count</h3>
//           <p className="text-2xl font-semibold mt-2">{filtered.length}</p>
//         </div>
//         <div className="p-4 bg-white shadow-sm rounded-md">
//           <h3 className="text-sm text-gray-600">Total notional</h3>
//           <p className="text-2xl font-semibold mt-2">{filtered.reduce((s, o) => s + o.quantity * o.price, 0)}</p>
//         </div>
//         <div className="p-4 bg-white shadow-sm rounded-md">
//           <h3 className="text-sm text-gray-600">Open orders</h3>
//           <p className="text-2xl font-semibold mt-2">{filtered.filter((o) => o.status === "open").length}</p>
//         </div>
//       </section>
//     </div>
//   );
// }

// // small helper to map status to tailwind-style classes
// function getStatusClass(status) {
//   switch (status) {
//     case "open":
//       return "bg-yellow-100 text-yellow-800";
//     case "executed":
//     case "completed":
//       return "bg-green-100 text-green-800";
//     case "cancelled":
//       return "bg-red-100 text-red-800";
//     default:
//       return "bg-gray-100 text-gray-800";
//   }
// }


// import React, { useMemo, useState, useEffect } from "react";

// export default function TraderOrdersDashboard() {
//   const [activeTab, setActiveTab] = useState("mine");
//   const [query, setQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [darkMode, setDarkMode] = useState(false);
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   const orders = useMemo(
//     () => [
//       {
//         id: "ORD-1001",
//         type: "mine",
//         client: "N/A",
//         pair: "BTC/USDT",
//         side: "Buy",
//         quantity: 0.5,
//         price: 54000,
//         status: "open",
//         createdAt: "2025-10-15",
//       },
//       {
//         id: "ORD-1002",
//         type: "customers",
//         client: "Alpha Traders",
//         pair: "ETH/USDT",
//         side: "Sell",
//         quantity: 10,
//         price: 3400,
//         status: "completed",
//         createdAt: "2025-10-18",
//       },
//       {
//         id: "ORD-1003",
//         type: "customers",
//         client: "Beta Capital",
//         pair: "SOL/USDT",
//         side: "Buy",
//         quantity: 200,
//         price: 140,
//         status: "cancelled",
//         createdAt: "2025-10-10",
//       },
//       {
//         id: "ORD-1004",
//         type: "mine",
//         client: "N/A",
//         pair: "BTC/USDT",
//         side: "Sell",
//         quantity: 0.1,
//         price: 54500,
//         status: "executed",
//         createdAt: "2025-10-19",
//       },
//       {
//         id: "ORD-1005",
//         type: "mine",
//         client: "N/A",
//         pair: "ADA/USDT",
//         side: "Buy",
//         quantity: 1000,
//         price: 0.65,
//         status: "open",
//         createdAt: "2025-10-20",
//       },
//       {
//         id: "ORD-1006",
//         type: "customers",
//         client: "Gamma Investments",
//         pair: "BNB/USDT",
//         side: "Buy",
//         quantity: 50,
//         price: 310,
//         status: "executed",
//         createdAt: "2025-10-17",
//       },
//     ],
//     []
//   );
  
//   const filtered = orders
//     .filter((o) => o.type === activeTab)
//     .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
//     .filter((o) => {
//       if (!query) return true;
//       const q = query.toLowerCase();
//       return (
//         o.id.toLowerCase().includes(q) ||
//         (o.client || "").toLowerCase().includes(q) ||
//         o.pair.toLowerCase().includes(q)
//       );
//     })
//     .filter((o) => {
//       if (!dateFrom && !dateTo) return true;
//       const d = new Date(o.createdAt);
//       if (dateFrom && d < new Date(dateFrom)) return false;
//       if (dateTo && d > new Date(dateTo)) return false;
//       return true;
//     })
//     .sort((a, b) => {
//       let aVal = a[sortBy];
//       let bVal = b[sortBy];
//       if (sortBy === "createdAt") {
//         aVal = new Date(aVal).getTime();
//         bVal = new Date(bVal).getTime();
//       }
//       if (sortOrder === "asc") {
//         return aVal > bVal ? 1 : -1;
//       }
//       return aVal < bVal ? 1 : -1;
//     });

//   const exportCSV = () => {
//     const header = [
//       "id",
//       "type",
//       "client",
//       "pair",
//       "side",
//       "quantity",
//       "price",
//       "status",
//       "createdAt",
//     ];
//     const rows = filtered.map((o) =>
//       header.map((h) => JSON.stringify(o[h] ?? "")).join(",")
//     );
//     const csv = [header.join(","), ...rows].join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `orders_${activeTab}_${new Date().toISOString()}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const onView = (id) => alert(`View details for ${id}`);
//   const onCancel = (id) => {
//     alert(`Cancel request sent for ${id}`);
//   };

//   const clearFilters = () => {
//     setQuery("");
//     setStatusFilter("all");
//     setDateFrom("");
//     setDateTo("");
//     setSortBy("createdAt");
//     setSortOrder("desc");
//   };

//   const stats = {
//     total: filtered.length,
//     notional: filtered.reduce((s, o) => s + o.quantity * o.price, 0),
//     open: filtered.filter((o) => o.status === "open").length,
//     completed: filtered.filter((o) => o.status === "completed" || o.status === "executed").length,
//   };
//   const getStatusClass = (status) => {
//   switch (status) {
//     case "open":
//       return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
//     case "executed":
//     case "completed":
//       return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
//     case "cancelled":
//       return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
//     default:
//       return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
//   }
// };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
//       <div className="p-4 md:p-8 max-w-7xl mx-auto">
//         {/* Header */}
//         <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
//               Orders Dashboard
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 text-sm">
//               Manage and track your trading orders
//             </p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
//               title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? (
//                 <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                 </svg>
//               )}
//             </button>

//             <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md border border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => setActiveTab("mine")}
//                 className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
//                   activeTab === "mine"
//                     ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
//                     : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                 }`}
//               >
//                 My Orders
//               </button>
//               <button
//                 onClick={() => setActiveTab("customers")}
//                 className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
//                   activeTab === "customers"
//                     ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
//                     : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                 }`}
//               >
//                 Customer Orders
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Stats Cards */}
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
//                 Total Orders
//               </h3>
//               <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
//                 <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active in current view</p>
//           </div>

//           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
//                 Total Value
//               </h3>
//               <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
//                 <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 dark:text-white">
//               ${stats.notional.toLocaleString(undefined, { maximumFractionDigits: 0 })}
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Sum of all orders</p>
//           </div>

//           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
//                 Open Orders
//               </h3>
//               <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
//                 <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.open}</p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Awaiting execution</p>
//           </div>

//           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
//                 Completed
//               </h3>
//               <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
//                 <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Successfully executed</p>
//           </div>
//         </section>

//         {/* Filters Section */}
//         <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
//           <div className="flex flex-wrap gap-3 items-center">
//             <div className="flex-1 min-w-64">
//               <div className="relative">
//                 <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search by order ID, client, or pair..."
//                   className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 />
//               </div>
//             </div>

//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
//             >
//               <option value="all">All statuses</option>
//               <option value="open">Open</option>
//               <option value="executed">Executed</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//             </select>

//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
//             >
//               <option value="createdAt">Sort by Date</option>
//               <option value="price">Sort by Price</option>
//               <option value="quantity">Sort by Quantity</option>
//             </select>

//             <button
//               onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//               className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
//               title={sortOrder === "asc" ? "Ascending" : "Descending"}
//             >
//               {sortOrder === "asc" ? (
//                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               )}
//             </button>

//             <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600">
//               <label className="text-sm font-medium text-gray-600 dark:text-gray-300">From</label>
//               <input
//                 type="date"
//                 value={dateFrom}
//                 onChange={(e) => setDateFrom(e.target.value)}
//                 className="border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0 px-2 py-1 text-sm"
//               />
//               <label className="text-sm font-medium text-gray-600 dark:text-gray-300">To</label>
//               <input
//                 type="date"
//                 value={dateTo}
//                 onChange={(e) => setDateTo(e.target.value)}
//                 className="border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0 px-2 py-1 text-sm"
//               />
//             </div>

//             <button
//               onClick={clearFilters}
//               className="px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-xl transition-all flex items-center gap-2 font-medium"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//               Clear
//             </button>

//             <button
//               onClick={exportCSV}
//               className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Export CSV
//             </button>
//           </div>
//         </section>

//         {/* Orders Table */}
//         <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
//                 <tr>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Order ID
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Client
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Pair
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Side
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Quantity
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Created
//                   </th>
//                   <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {filtered.length === 0 && (
//                   <tr>
//                     <td colSpan={9} className="py-16 text-center">
//                       <div className="flex flex-col items-center gap-3">
//                         <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
//                           <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                           </svg>
//                         </div>
//                         <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No orders found</p>
//                         <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {filtered.map((o, idx) => (
//                   <tr
//                     key={o.id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
//                     style={{ animationDelay: `${idx * 50}ms` }}
//                   >
//                     <td className="py-4 px-6">
//                       <span className="font-semibold text-gray-900 dark:text-white">{o.id}</span>
//                     </td>
//                     <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{o.client || "—"}</td>
//                     <td className="py-4 px-6">
//                       <span className="font-medium text-gray-900 dark:text-white">{o.pair}</span>
//                     </td>
//                     <td className="py-4 px-6">
//                       <span
//                         className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg ${
//                           o.side === "Buy"
//                             ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
//                             : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
//                         }`}
//                       >
//                         {o.side}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">{o.quantity}</td>
//                     <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">
//                       ${o.price.toLocaleString()}
//                     </td>
//                     <td className="py-4 px-6">
//                       <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(o.status)}`}>
//                         <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
//                         {o.status}
//                       </span>
//                     </td>
//                     <td className="py-4 px-6 text-gray-700 dark:text-gray-300 text-sm">{o.createdAt}</td>
//                     <td className="py-4 px-6">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => onView(o.id)}
//                           className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all"
//                         >
//                           View
//                         </button>
//                         {o.status === "open" && (
//                           <button
//                             onClick={() => onCancel(o.id)}
//                             className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all"
//                           >
//                             Cancel
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </div> 
//       </div>)}



import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";

export default function TraderOrdersDashboard() {
  const [activeTab, setActiveTab] = useState("mine");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    type: activeTab,
    client: "",
    pair: "",
    side: "Buy",
    quantity: "",
    price: "",
    status: "open"
  });

  useEffect(() => {
    setOrderForm(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  const API_URL = import.meta.env.VITE_API_URL || '';;

  // ✅ Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ✅ Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/dashboard-orders`);
      const formattedOrders = response.data.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt).toISOString().split('T')[0]
      }));
      setOrders(formattedOrders);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Refresh orders
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // ✅ Filter and sort orders
  const filtered = orders
    .filter((o) => o.type === activeTab)
    .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
    .filter((o) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.client || "").toLowerCase().includes(q) ||
        (o.pair || "").toLowerCase().includes(q)
      );
    })
    .filter((o) => {
      if (!dateFrom && !dateTo) return true;
      const d = new Date(o.createdAt);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo)) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

  // ✅ Format price in Indian Rupees
  const formatIndianPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // ✅ Export CSV
  const exportCSV = () => {
    const header = [
      "id",
      "type",
      "client",
      "pair",
      "side",
      "quantity",
      "price",
      "status",
      "createdAt",
    ];
    const rows = filtered.map((o) =>
      header.map((h) => JSON.stringify(o[h] ?? "")).join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${activeTab}_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ View order
  const onView = (id) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      alert(`Order Details:\n\nID: ${order.id}\nClient: ${order.client}\nPair: ${order.pair}\nSide: ${order.side}\nQuantity: ${order.quantity}\nPrice: ${formatIndianPrice(order.price)}\nStatus: ${order.status}\nCreated: ${order.createdAt}`);
    }
  };

  // ✅ Cancel order
  const onCancel = async (id) => {
    if (window.confirm(`Are you sure you want to cancel order ${id}?`)) {
      try {
        const order = orders.find(o => o.id === id);
        if (!order) {
          alert("Order not found");
          return;
        }

        await axios.put(`${API_URL}/api/dashboard-orders/${order._id}`, { status: "cancelled" });
        setOrders(orders.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
        alert(`Order ${id} cancelled successfully`);
      } catch (err) {
        console.error("Failed to cancel order:", err);
        alert("Failed to cancel order");
      }
    }
  };

  // ✅ Add new order
  const handleAddOrder = async () => {
    if (!orderForm.client || !orderForm.pair || !orderForm.quantity || !orderForm.price) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      // Find the highest existing order number and increment it.
      const maxId = orders.reduce((max, order) => {
        const orderNum = parseInt(order.id.split('-')[1], 10);
        return orderNum > max ? orderNum : max;
      }, 0);
      const newIdNumber = maxId + 1;
      const orderId = `ORD-${String(newIdNumber).padStart(4, '0')}`;



      const newOrder = {
        id: orderId,
        ...orderForm,
        quantity: Number(orderForm.quantity),
        price: Number(orderForm.price),
        createdAt: new Date().toISOString()
      };

      const response = await axios.post(`${API_URL}/api/dashboard-orders`, newOrder);
      setOrders([...orders, response.data]);
      setShowAddForm(false);
      setOrderForm({
        type: activeTab,
        client: "",
        pair: "",
        side: "Buy",
        quantity: "",
        price: "",
        status: "open"
      });
      alert("Order added successfully!");
    } catch (err) {
      console.error("Failed to add order:", err);
      alert("Failed to add order");
    }
  };



  // ✅ Clear filters
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  // ✅ Calculate stats
  const stats = {
    total: filtered.length,
    notional: filtered.reduce((s, o) => s + (o.quantity * o.price || 0), 0),
    open: filtered.filter((o) => o.status === "open").length,
    completed: filtered.filter((o) => o.status === "completed" || o.status === "executed").length,
  };

  // ✅ Status color mapping
  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "executed":
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Orders Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage and track your trading orders
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              title="Refresh orders"
            >
              <svg className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button> */}

            <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("mine")}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "mine"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "customers"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Customer Orders
              </button>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading orders...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              <button onClick={handleRefresh} className="text-red-600 dark:text-red-400 hover:underline text-sm">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Orders
                  </h3>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active in current view</p>
              </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Value
                  </h3>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center w-12 h-12">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-300">₹</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatIndianPrice(stats.notional)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Sum of all orders</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Open Orders
                  </h3>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.open}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Awaiting execution</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Completed
                  </h3>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Successfully executed</p>
              </div>
            </section>

            {/* Filters Section */}
            <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by order ID, client, or pair..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="executed">Executed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="price">Sort by Price</option>
                  <option value="quantity">Sort by Quantity</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? (
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0 px-2 py-1 text-sm"
                  />
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0 px-2 py-1 text-sm"
                  />
                </div>

                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-xl transition-all flex items-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {showAddForm ? 'Hide Form' : 'Add Order'}
                </button>

                <button
                  onClick={exportCSV}
                  className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </section>

            {/* Add Order Form */}
            {showAddForm && (
              <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl -m-6 mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Add New {activeTab === "mine" ? "My Order" : "Customer Order"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    placeholder={activeTab === "mine" ? "Firm Name *" : "Client *"}
                    name="client"
                    value={orderForm.client}
                    onChange={(e) => setOrderForm({ ...orderForm, client: e.target.value })}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    placeholder="Trading Pair *"
                    name="pair"
                    value={orderForm.pair}
                    onChange={(e) => setOrderForm({ ...orderForm, pair: e.target.value })}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <select
                    name="side"
                    value={orderForm.side}
                    onChange={(e) => setOrderForm({ ...orderForm, side: e.target.value })}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity *"
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price (₹) *"
                    name="price"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-xl transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddOrder}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium"
                    >
                      Add Order
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Orders Table */}
            <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {activeTab === "mine" ? "Firm Name" : "Client"}
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pair</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Side</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price (₹)</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Created</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No orders found</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filtered.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">{o.id}</td>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{o.client || "—"}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{o.pair}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg ${o.side === "Buy" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"}`}>
                            {o.side}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">{o.quantity.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">{formatIndianPrice(o.price)}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(o.status)}`}>
                            <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300 text-sm">{o.createdAt}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button onClick={() => onView(o.id)} className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all">
                              View
                            </button>
                            {o.status === "open" && (
                              <button onClick={() => onCancel(o.id)} className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all">
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}



      </div>
    </div>
  );
}
