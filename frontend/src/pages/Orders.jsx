import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import {
  RefreshCw, Plus, X, Download, Search,
  FileText, Clock, CheckCircle, TrendingUp,
  ChevronUp, ChevronDown, Calendar, User,
  ArrowRightLeft, Hash,
} from "lucide-react";

export default function TraderOrdersDashboard() {
  const [activeTab, setActiveTab]       = useState("mine");
  const [query, setQuery]               = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [sortBy, setSortBy]             = useState("createdAt");
  const [sortOrder, setSortOrder]       = useState("desc");
  const [orders, setOrders]             = useState([]);
  const [materials, setMaterials]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [orderForm, setOrderForm]       = useState({
    type: "mine", client: "", materialName: "", quantity: "", costPrice: "", status: "open",
  });

  useEffect(() => {
    setOrderForm((prev) => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/orders`);
      setOrders(
        response.data.map((o) => ({
          ...o,
          materialName: o.materialName || o.material?.name || "",
          sellingPrice: Number(o.sellingPrice ?? 0),
          costPrice: Number(o.costPrice ?? 0),
          profit: Number(o.profit ?? 0),
          createdAt: new Date(o.createdAt).toISOString().split("T")[0],
        }))
      );
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/materials`);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filtered = orders
    .filter((o) => o.type === activeTab)
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (o.id || "").toLowerCase().includes(q) ||
        (o.client || "").toLowerCase().includes(q) ||
        (o.materialName || "").toLowerCase().includes(q)
      );
    })
    .filter((o) => {
      if (!dateFrom && !dateTo) return true;
      const d = new Date(o.createdAt);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo   && d > new Date(dateTo))   return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "createdAt") { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const formatINR = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price);

  const exportCSV = () => {
    const header = ["id", "type", "client", "materialName", "quantity", "costPrice", "status", "createdAt"];
    const rows = filtered.map((o) => header.map((h) => JSON.stringify(o[h] ?? "")).join(","));
    const csv  = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `orders_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const onView = (id) => {
    const o = orders.find((o) => o.id === id);
    if (o) alert(`Order Details:\n\nID: ${o.id}\nClient: ${o.client}\nMaterial: ${o.materialName}\nQty: ${o.quantity}\nCost Price: ${formatINR(o.costPrice)}\nStatus: ${o.status}\nCreated: ${o.createdAt}`);
  };

  const onCancel = async (id) => {
    if (!window.confirm(`Cancel order ${id}?`)) return;
    try {
      const o = orders.find((o) => o.id === id);
      if (!o) return;
      await axios.put(`${API_URL}/api/orders/${o._id}/status`, { status: "cancelled" });
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  const handleAddOrder = async () => {
    if (!orderForm.client || !orderForm.materialName || !orderForm.quantity || !orderForm.costPrice) {
      alert("Please fill all required fields!"); return;
    }

    const cost = Number(orderForm.costPrice);
    if (!Number.isFinite(cost) || cost < 0) {
      alert("Cost price must be a valid number.");
      return;
    }

    try {
      const maxId = orders.reduce((max, o) => {
        const n = parseInt((o.id || "ORD-0000").split("-")[1], 10);
        return n > max ? n : max;
      }, 0);
      const newOrder = {
        id: `ORD-${String(maxId + 1).padStart(4, "0")}`,
        ...orderForm,
        quantity: Number(orderForm.quantity),
        costPrice: cost,
        createdAt: new Date().toISOString(),
      };
      const res = await axios.post(`${API_URL}/api/orders`, newOrder);
      const created = res.data?.order || res.data;
      setOrders([...orders, {
        ...created,
        materialName: created.materialName || created.material?.name || "",
        sellingPrice: Number(created.sellingPrice ?? 0),
        costPrice: Number(created.costPrice ?? cost),
        profit: Number(created.profit ?? 0),
      }]);
      setShowAddForm(false);
      setOrderForm({ type: activeTab, client: "", materialName: "", quantity: "", costPrice: "", status: "open" });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add order");
    }
  };

  const clearFilters = () => {
    setQuery(""); setStatusFilter("all"); setDateFrom(""); setDateTo("");
    setSortBy("createdAt"); setSortOrder("desc");
  };

  const stats = {
    total:     filtered.length,
    notional:  filtered.reduce((s, o) => s + (o.quantity * o.costPrice || 0), 0),
    profit:    filtered.reduce((s, o) => s + (Number(o.profit) || 0), 0),
    open:      filtered.filter((o) => o.status === "open").length,
    completed: filtered.filter((o) => o.status === "completed" || o.status === "executed").length,
  };

  const statusMeta = (status) => {
    switch (status) {
      case "open":      return { dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"   };
      case "executed":
      case "completed": return { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"   };
      case "cancelled": return { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"           };
      default:          return { dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"          };
    }
  };

  const inputCls =
    "w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-xl " +
    "bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 " +
    "dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
    "outline-none transition-all";

  const hasActiveFilters = query || statusFilter !== "all" || dateFrom || dateTo;

  /* ── Loading ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading orders…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Header ── */}
        <header className="flex items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
              <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                Orders Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Manage and track your trading orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Tab toggle */}
            <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
              {[
                { key: "mine",      label: "My Orders"  },
                { key: "customers", label: "Customers"  },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === key
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Add order */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">{showAddForm ? "Close" : "Add Order"}</span>
            </button>
          </div>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 border-l-4 border-l-red-500 rounded-xl p-3 sm:p-4 mb-6 text-sm text-red-700 dark:text-red-400">
            <span>{error}</span>
            <button onClick={handleRefresh} className="text-red-600 hover:underline text-xs font-semibold flex-shrink-0">Retry</button>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Orders", value: stats.total,              sub: "Current view",        icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,       bg: "bg-blue-50 dark:bg-blue-900/20"   },
            { label: "Total Cost",   value: formatINR(stats.notional),sub: "Cost at order time",  icon: <span className="text-base font-bold text-green-600 dark:text-green-400">₹</span>, bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Net Profit",   value: formatINR(stats.profit),  sub: "Computed at invoice", icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,                      bg: "bg-indigo-50 dark:bg-indigo-900/20"},
            { label: "Open Orders",  value: stats.open,               sub: "Awaiting execution",  icon: <Clock className="w-5 h-5 text-amber-500" />,                             bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Completed",    value: stats.completed,          sub: "Successfully executed",icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,                   bg: "bg-emerald-50 dark:bg-emerald-900/20"},
          ].map(({ label, value, sub, icon, bg }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <div className={`p-2 rounded-lg ${bg} flex-shrink-0 flex items-center justify-center min-w-[32px] min-h-[32px]`}>{icon}</div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </section>

        {/* ── Add Order Form ── */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                Add New {activeTab === "mine" ? "My Order" : "Customer Order"}
              </h2>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <User className="w-3.5 h-3.5" /> {activeTab === "mine" ? "Firm Name" : "Client"} *
                  </label>
                  <input placeholder={activeTab === "mine" ? "Firm name…" : "Client name…"} value={orderForm.client}
                    onChange={(e) => setOrderForm({ ...orderForm, client: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Material *
                  </label>
                  <select
                    value={orderForm.materialName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const m = materials.find((x) => x.name === name);
                      setOrderForm({ ...orderForm, materialName: name, costPrice: m ? String(m.price ?? "") : orderForm.costPrice });
                    }}
                    className={inputCls}
                  >
                    <option value="">Select material</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Cost Price (₹) *</label>
                  <input type="number" placeholder="0" min="0" value={orderForm.costPrice}
                    onChange={(e) => setOrderForm({ ...orderForm, costPrice: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Quantity *</label>
                  <input type="number" placeholder="0" min="0" value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Selling price and profit will be finalized during invoice generation.
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button onClick={() => setShowAddForm(false)}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all active:scale-95">
                      Cancel
                    </button>
                    <button onClick={handleAddOrder}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md">
                      Add Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            {/* Row 1: search + status + sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by order ID, client, or pair…"
                  placeholder="Search by order ID, client, or material…"
                  className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[120px]">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="executed">Executed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[120px]">
                  <option value="createdAt">Sort: Date</option>
                  <option value="costPrice">Sort: Cost Price</option>
                  <option value="profit">Sort: Profit</option>
                  <option value="quantity">Sort: Qty</option>
                </select>

                <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}>
                  {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Row 2: date range + export + clear */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/60 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 flex-1">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm outline-none min-w-0" />
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm outline-none min-w-0" />
              </div>

              <div className="flex gap-2">
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold shadow-sm transition-all flex-shrink-0">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all flex-shrink-0">
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter result count */}
          {hasActiveFilters && (
            <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-blue-600">{filtered.length}</span> of {orders.filter(o => o.type === activeTab).length} orders shown
              </p>
            </div>
          )}
        </section>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
              <FileText className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">No orders found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MOBILE & TABLET (<lg) — card list
        ═══════════════════════════════════════════════ */}
        {filtered.length > 0 && (
          <div className="lg:hidden flex flex-col gap-3">
            {filtered.map((o) => {
              const sm = statusMeta(o.status);
              return (
                <div key={o.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <div className="p-4">
                    {/* Top: ID + side badge + status + actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{o.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${sm.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{o.status}
                          </span>
                        </div>
                        {o.client && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />{o.client}
                          </p>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => onView(o.id)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="View">
                          <FileText className="w-4 h-4" />
                        </button>
                        {o.status === "open" && (
                          <button onClick={() => onCancel(o.id)}
                            className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" />Material</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{o.materialName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5">Quantity</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{o.quantity?.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5">Price</p>
                        <p className="font-bold text-green-600 dark:text-green-400">{formatINR(o.costPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5">Profit</p>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">{formatINR(o.profit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" />Created</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{o.createdAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            DESKTOP (lg+) — full table
        ═══════════════════════════════════════════════ */}
        {filtered.length > 0 && (
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-100 dark:border-gray-700">
                  {[
                    "Order ID",
                    activeTab === "mine" ? "Firm Name" : "Client",
                    "Material", "Quantity", "Cost (₹)", "Profit (₹)", "Status", "Created", "Actions"
                  ].map((h) => (
                    <th key={h} className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filtered.map((o) => {
                  const sm = statusMeta(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{o.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-600 dark:text-gray-300 max-w-[140px] truncate">
                        {o.client || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{o.materialName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {o.quantity?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatINR(o.costPrice)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                          {formatINR(o.profit)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${sm.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5" />{o.createdAt}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onView(o.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all">
                            View
                          </button>
                          {o.status === "open" && (
                            <button onClick={() => onCancel(o.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}