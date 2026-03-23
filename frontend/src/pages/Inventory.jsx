import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  Edit, Trash2, PackageSearch, Download,
  AlertTriangle, TrendingUp, Package, X, Search,
  Calendar, Tag, Layers,
} from "lucide-react";

const DEFAULT_MATERIAL_OPTIONS = ["sand", "bricks", "cement", "iron rods"];
const MATERIAL_UNIT_OPTIONS = ["kg", "ton", "bags", "pieces", "m3"];

export default function Inventory() {
  const navigate = useNavigate();
  const NOTIF_KEY = "appNotifications";
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "", category: "", minStock: "" });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showCriticalPopup, setShowCriticalPopup] = useState(false);
  const [criticalPopupItems, setCriticalPopupItems] = useState([]);
  const prevCriticalSignaturesRef = useRef(new Set());

  const API_URL = import.meta.env.VITE_API_URL || "";

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
      setNotifications(Array.isArray(existing) ? existing : []);
    } catch (e) {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const onInventoryUpdated = () => {
      fetchMaterials();
      try {
        const existing = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
        setNotifications(Array.isArray(existing) ? existing : []);
      } catch (e) {
        setNotifications([]);
      }
    };

    window.addEventListener("inventory:updated", onInventoryUpdated);
    return () => window.removeEventListener("inventory:updated", onInventoryUpdated);
  }, []);

  useEffect(() => {
    const criticalItems = materials.filter((m) => Number(m.minStock || 0) > 0 && Number(m.quantity || 0) < Number(m.minStock || 0) * 0.5);
    const currentSignatures = new Set(criticalItems.map((m) => `${m._id}:${m.quantity}`));
    const newCriticalItems = criticalItems.filter((m) => !prevCriticalSignaturesRef.current.has(`${m._id}:${m.quantity}`));

    if (newCriticalItems.length > 0) {
      setCriticalPopupItems(newCriticalItems);
      setShowCriticalPopup(true);

      const existing = (() => {
        try {
          return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
        } catch (e) {
          return [];
        }
      })();

      const entries = newCriticalItems.map((m) => ({
        id: `critical-${m._id}-${Date.now()}`,
        type: "low-stock",
        title: "Critical Stock",
        message: `${m.name} is below critical threshold (${m.quantity} left, min ${m.minStock})`,
        createdAt: new Date().toISOString(),
      }));

      const merged = [...entries, ...existing].slice(0, 30);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(merged));
      setNotifications(merged);
    }

    prevCriticalSignaturesRef.current = currentSignatures;
  }, [materials]);

  const handleRefillFromPopup = () => {
    if (!criticalPopupItems.length) return;
    const target = criticalPopupItems[0];
    const refillPrefill = {
      source: "critical-low-stock",
      materialName: target.name,
      quantity: Number(target.minStock || 1),
    };

    localStorage.setItem("orderRefillPrefill", JSON.stringify(refillPrefill));
    setShowCriticalPopup(false);
    navigate("/orders", { state: { orderRefillPrefill: refillPrefill } });
  };

  /* ── Stock status helper ── */
  const getStockStatus = (m) => {
    if (m.quantity < m.minStock * 0.5)
      return { status: "Critical",  dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
    if (m.quantity < m.minStock)
      return { status: "Low Stock", dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" };
    return   { status: "In Stock",  dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" };
  };

  /* ── Stock bar width ── */
  const getBarWidth = (m) => {
    if (!m.minStock) return 100;
    return Math.min(100, Math.round((m.quantity / m.minStock) * 100));
  };
  const getBarColor = (m) => {
    const pct = getBarWidth(m);
    if (pct < 50)  return "bg-red-500";
    if (pct < 100) return "bg-amber-400";
    return "bg-green-500";
  };

  /* ── Save (add / edit) ── */
  const handleSave = async () => {
    if (!editItem) {
      alert("Add Material form is disabled. Please use My Orders to refill inventory.");
      return;
    }

    if (!form.name || !form.quantity || !form.unit || !form.category) {
      alert("Please fill all required fields!");
      return;
    }
    const currentDate = new Date().toISOString().split("T")[0];
    const normalizedName = String(form.name || "").trim().toLowerCase();

    try {
      if (editItem) {
        const res = await axios.put(`${API_URL}/api/materials/${editItem._id}`, {
          name: normalizedName,
          quantity: Number(form.quantity),
          unit: form.unit,
          category: form.category,
          minStock: Number(form.minStock) || 0,
          lastUpdated: currentDate,
        });
        setMaterials((prev) => prev.map((m) => (m._id === editItem._id ? res.data : m)));
      } else {
        const existing = materials.find(
          (m) => String(m.name || "").toLowerCase() === normalizedName
        );
        if (existing) {
          const res = await axios.put(`${API_URL}/api/materials/${existing._id}`, {
            ...existing,
            name: normalizedName,
            quantity: existing.quantity + Number(form.quantity),
            lastUpdated: currentDate,
          });
          setMaterials((prev) => prev.map((m) => (m._id === existing._id ? res.data : m)));
        } else {
          const res = await axios.post(`${API_URL}/api/materials`, {
            name: normalizedName,
            quantity: Number(form.quantity),
            unit: form.unit,
            category: form.category,
            minStock: Number(form.minStock) || 0,
            lastUpdated: currentDate,
          });
          setMaterials((prev) => [...prev, res.data]);
        }
      }
      closeModal();
    } catch (err) {
      console.error("Error saving material:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save material. Please check values and try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await axios.delete(`${API_URL}/api/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting material:", err);
    }
  };

  const openEditModal = (m) => {
    setEditItem(m);
    setForm({
      name: m.name,
      quantity: String(m.quantity),
      unit: m.unit,
      category: m.category,
      minStock: String(m.minStock),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ name: "", quantity: "", unit: "", category: "", minStock: "" });
  };

  const exportCSV = () => {
    const headers = ["Material", "Quantity", "Unit", "Category", "Min Stock", "Status", "Last Updated"];
    const rows = filtered.map((m) => [m.name, m.quantity, m.unit, m.category, m.minStock, getStockStatus(m).status, m.lastUpdated]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ["all", ...new Set(materials.map((m) => m.category).filter(Boolean))];
  const materialNameOptions = [
    ...new Set([
      ...DEFAULT_MATERIAL_OPTIONS,
      ...materials.map((m) => String(m.name || "").trim()).filter(Boolean),
    ]),
  ];

  const filtered = materials
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => categoryFilter === "all" || m.category === categoryFilter)
    .filter((m) => {
      if (statusFilter === "all") return true;
      return getStockStatus(m).status === statusFilter;
    });

  const stats = {
    total:    materials.length,
    lowStock: materials.filter((m) => getStockStatus(m).status === "Low Stock").length,
    critical: materials.filter((m) => getStockStatus(m).status === "Critical").length,
    totalUnits: materials.reduce((sum, m) => sum + m.quantity, 0),
  };

  const inputCls =
    "w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-xl " +
    "bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 " +
    "dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
    "outline-none transition-all";

  /* ── Loading ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading inventory…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Header ── */}
        <header className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                Inventory
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Track and manage your construction materials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-green-600" />
              <span>Export</span>
            </button>
          </div>
        </header>

        <section className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            Inventory additions are managed through My Orders completion. Use Orders page to procure and refill stock.
          </p>
        </section>

        {/* ── Stats Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Items",  value: stats.total,                        sub: "Unique materials", icon: <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />,        bg: "bg-blue-50 dark:bg-blue-900/20"   },
            { label: "Low Stock",    value: stats.lowStock,                     sub: "Needs attention",  icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,                    bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Critical",     value: stats.critical,                     sub: "Urgent reorder",   icon: <AlertTriangle className="w-5 h-5 text-red-500" />,                      bg: "bg-red-50 dark:bg-red-900/20"     },
            { label: "Total Units",  value: stats.totalUnits.toLocaleString(),  sub: "Combined qty",     icon: <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />,   bg: "bg-green-50 dark:bg-green-900/20" },
          ].map(({ label, value, sub, icon, bg }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>{icon}</div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </section>

        {/* ── Filters ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search materials…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[130px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical</option>
              </select>

              {/* Mobile export */}
              <button
                onClick={exportCSV}
                className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
              >
                <Download className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>

          {/* Active filter summary */}
          {(search || categoryFilter !== "all" || statusFilter !== "all") && (
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-blue-600">{filtered.length}</span> of {materials.length} materials
              </p>
              <button
                onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); }}
                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </section>

        {/* ── Notification section ── */}
        {notifications.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => {
                  localStorage.setItem(NOTIF_KEY, JSON.stringify([]));
                  setNotifications([]);
                }}
                className="text-xs text-red-500 hover:text-red-600 font-semibold"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{n.title}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
              <PackageSearch className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">No materials found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MOBILE & TABLET (<lg) — card list
        ═══════════════════════════════════════════════ */}
        {filtered.length > 0 && (
          <div className="lg:hidden flex flex-col gap-3">
            {filtered.map((m) => {
              const ss = getStockStatus(m);
              const barW = getBarWidth(m);
              const barC = getBarColor(m);
              return (
                <div key={m._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{m.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-md">
                            <Tag className="w-3 h-3" />{m.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${ss.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                            {ss.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEditModal(m)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(m._id)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5">Quantity</p>
                        <p className="font-bold text-gray-900 dark:text-white">{m.quantity.toLocaleString()} <span className="font-normal text-gray-500">{m.unit}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5">Min Stock</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{m.minStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" />Updated</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{m.lastUpdated}</p>
                      </div>
                    </div>

                    {/* Stock bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                        <span>Stock level</span>
                        <span>{barW}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barC}`} style={{ width: `${barW}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">
              {filtered.length} material{filtered.length !== 1 ? "s" : ""}
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
                  {["Material", "Category", "Quantity", "Unit", "Min Stock", "Stock Level", "Status", "Last Updated", "Actions"].map((h) => (
                    <th key={h} className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filtered.map((m) => {
                  const ss = getStockStatus(m);
                  const barW = getBarWidth(m);
                  const barC = getBarColor(m);
                  return (
                    <tr key={m._id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg">
                          <Tag className="w-3 h-3" />{m.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{m.quantity.toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-500 dark:text-gray-400">{m.unit}</td>
                      <td className="py-3.5 px-4 text-sm text-gray-600 dark:text-gray-300">{m.minStock}</td>
                      <td className="py-3.5 px-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barC}`} style={{ width: `${barW}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{barW}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${ss.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                          {ss.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />{m.lastUpdated}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(m)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(m._id)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {filtered.length} material{filtered.length !== 1 ? "s" : ""} shown
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editItem ? "Edit Material" : "Add / Update Material"}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Material name / select */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  <Package className="w-3.5 h-3.5" /> Material Name *
                </label>
                {!editItem ? (
                  <select
                    value={form.name}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const existing = materials.find(
                        (m) => String(m.name || "").toLowerCase() === String(sel || "").toLowerCase()
                      );
                      if (existing) {
                        setForm({
                          name: existing.name,
                          quantity: String(Math.max(0, existing.minStock - existing.quantity)),
                          unit: existing.unit,
                          category: existing.category,
                          minStock: String(existing.minStock),
                        });
                      } else {
                        setForm({ ...form, name: sel, unit: form.unit || "bags" });
                      }
                    }}
                    className={inputCls}
                  >
                    <option value="">Select material…</option>
                    {materialNameOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Material name" className={inputCls} />
                )}
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  <Tag className="w-3.5 h-3.5" /> Category *
                </label>
                <input type="text" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Building Materials" className={inputCls} />
              </div>

              {/* Qty + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <Layers className="w-3.5 h-3.5" /> Quantity *
                  </label>
                  <input type="number" min="0" value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Unit *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Select unit…</option>
                    {MATERIAL_UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Min stock */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Minimum Stock Level
                </label>
                <input type="number" min="0" value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  placeholder="50" className={inputCls} />
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={closeModal}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all active:scale-95">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="w-full sm:w-auto flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md shadow-blue-200 dark:shadow-blue-900/30">
                  {editItem ? "Update Material" : "Save Material"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Critical center popup ── */}
      {showCriticalPopup && criticalPopupItems.length > 0 && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 shadow-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Critical Low Stock Alert</h3>
              </div>
              <button
                onClick={() => setShowCriticalPopup(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {criticalPopupItems.map((m) => (
                <div key={m._id} className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{m.name}</span>: {m.quantity} left (min {m.minStock})
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCriticalPopup(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold text-sm"
              >
                Acknowledge
              </button>
              <button
                onClick={handleRefillFromPopup}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold text-sm"
              >
                Refill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}