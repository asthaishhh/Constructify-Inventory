import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import { Plus, Edit, Trash2, PackageSearch, Sun, Moon, Download, AlertTriangle, TrendingUp, Package } from "lucide-react";

export default function Inventory() {
  // const [materials, setMaterials] = useState([
  //   { id: 1, name: "Cement", quantity: 120, unit: "bags", category: "Building Materials", minStock: 50, lastUpdated: "2025-10-15" },
  //   { id: 2, name: "Sand", quantity: 80, unit: "tons", category: "Aggregates", minStock: 100, lastUpdated: "2025-10-18" },
  //   { id: 3, name: "Iron Rods", quantity: 45, unit: "bundles", category: "Steel", minStock: 60, lastUpdated: "2025-10-10" },
  //   { id: 4, name: "Bricks", quantity: 5000, unit: "pieces", category: "Building Materials", minStock: 3000, lastUpdated: "2025-10-19" },
  //   // { id: 5, name: "Paint", quantity: 30, unit: "gallons", category: "Finishing", minStock: 20, lastUpdated: "2025-10-20" },
  // ]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "", category: "", minStock: "" });
  const [darkMode, setDarkMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // const API_URL = "/api/materials";
  const API_URL = import.meta.env.VITE_API_URL || '';
  // Fetch materials from backend
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };
  useEffect(() => {
    fetchMaterials();
  }, []);
console.log(fetchMaterials);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSave = async () => {
  if (!form.name || !form.quantity || !form.unit || !form.category) {
    alert("Please fill all required fields!");
    return;
  }

  const currentDate = new Date().toISOString().split('T')[0];

  try {
    if (editItem) {
      // Editing existing item
      const payload = {
        name: form.name,
        quantity: Number(form.quantity),
        unit: form.unit,
        category: form.category,
        minStock: Number(form.minStock) || 0,
        lastUpdated: currentDate,
      };
      const res = await axios.put(`${API_URL}/api/materials/${editItem._id}`, payload);
      setMaterials((prev) =>
        prev.map((m) => (m._id === editItem._id ? res.data : m))
      );
    } else {
      // Adding new or updating existing
      const existingMaterial = materials.find(m => m.name.toLowerCase() === form.name.toLowerCase());
      if (existingMaterial) {
        // Update existing material by adding quantity
        const updatedQuantity = existingMaterial.quantity + Number(form.quantity);
        const payload = {
          name: existingMaterial.name,
          quantity: updatedQuantity,
          unit: existingMaterial.unit, // Keep existing unit
          category: existingMaterial.category, // Keep existing category
          minStock: existingMaterial.minStock, // Keep existing minStock
          lastUpdated: currentDate,
        };
        const res = await axios.put(`${API_URL}/api/materials/${existingMaterial._id}`, payload);
        setMaterials((prev) =>
          prev.map((m) => (m._id === existingMaterial._id ? res.data : m))
        );
      } else {
        // Create new material
        const payload = {
          name: form.name,
          quantity: Number(form.quantity),
          unit: form.unit,
          category: form.category,
          minStock: Number(form.minStock) || 0,
          lastUpdated: currentDate,
        };
        const res = await axios.post(`${API_URL}/api/materials`, payload);
        setMaterials((prev) => [...prev, res.data]);
      }
    }
  } catch (err) {
    console.error("Error saving material:", err.response?.data || err.message);
  }

  setForm({ name: "", quantity: "", unit: "", category: "", minStock: "" });
  setEditItem(null);
  setShowModal(false);
};


  // Delete material
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await axios.delete(`${API_URL}/api/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting material:", err);
    }
  };

  const exportCSV = () => {
    const headers = ["Material", "Quantity", "Unit", "Category", "Min Stock", "Status", "Last Updated"];
    const rows = filtered.map((m) => [
      m.name,
      m.quantity,
      m.unit,
      m.category,
      m.minStock,
      getStockStatus(m).status,
      m.lastUpdated
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStockStatus = (material) => {
    const percentage = (material.quantity / material.minStock) * 100;
    if (material.quantity < material.minStock * 0.5) {
      return { status: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" };
    } else if (material.quantity < material.minStock) {
      return { status: "Low Stock", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200" };
    }
    return { status: "In Stock", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" };
  };

  const categories = ["all", ...new Set(materials.map(m => m.category))];

  const filtered = materials
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => categoryFilter === "all" || m.category === categoryFilter)
    .filter((m) => {
      if (statusFilter === "all") return true;
      const status = getStockStatus(m).status;
      return status === statusFilter;
    });

  const stats = {
    total: materials.length,
    lowStock: materials.filter(m => getStockStatus(m).status === "Low Stock").length,
    critical: materials.filter(m => getStockStatus(m).status === "Critical").length,
    totalValue: materials.reduce((sum, m) => sum + m.quantity, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track and manage your construction materials
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button> */}

            <button
              onClick={() => {
                setShowModal(true);
                setEditItem(null);
                setForm({ name: "", quantity: "", unit: "", category: "", minStock: "" });
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
            >
              <Plus size={18} /> Add/Update Material
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Items
              </h3>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Unique materials</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Low Stock
              </h3>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Needs attention</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Critical
              </h3>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.critical}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Urgent reorder</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Units
              </h3>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Combined quantity</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <PackageSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>

            <button
              onClick={exportCSV}
              className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Min Stock
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <PackageSearch className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No materials found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}

                {filtered.map((m, idx) => {
                  const stockStatus = getStockStatus(m);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900 dark:text-white">{m.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">
                        {m.quantity.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{m.unit}</td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{m.minStock}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${stockStatus.color}`}>
                          <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300 text-sm">{m.lastUpdated}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem(m);
                              setForm(m);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {editItem ? "Edit Material" : "Add Material"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Material *
                  </label>
                  <select
                    value={form.name}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const selectedMaterial = materials.find(m => m.name === selectedName);
                      if (selectedMaterial) {
                        const suggestedQuantity = Math.max(0, selectedMaterial.minStock - selectedMaterial.quantity);
                        setForm({
                          name: selectedMaterial.name,
                          quantity: suggestedQuantity.toString(),
                          unit: selectedMaterial.unit,
                          category: selectedMaterial.category,
                          minStock: selectedMaterial.minStock.toString()
                        });
                      } else {
                        setForm({ ...form, name: selectedName });
                      }
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a material</option>
                    {materials.map(m => (
                      <option key={m._id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Building Materials"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit *
                    </label>
                    <input
                      type="text"
                      placeholder="bags"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditItem(null);
                    setForm({ name: "", quantity: "", unit: "", category: "", minStock: "" });
                  }}
                  className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
                >
                  {editItem ? "Update" : "Add Material"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// InventoryPreview.jsx
// Place this file in `src/pages/InventoryPreview.jsx` of your React app.
// Requirements: Tailwind CSS configured, framer-motion and lucide-react installed.
// Install: npm i framer-motion lucide-react

// // InventoryPreview.jsx
// // Place this file in `src/pages/InventoryPreview.jsx` of your React app.
// // Requirements: Tailwind CSS configured, framer-motion and lucide-react installed.
// // Install: npm i framer-motion lucide-react

// import React, { useState, useEffect } from "react";
// import { Plus, Edit, Trash2, PackageSearch } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function InventoryPreview() {
//   const initial = [
//     { id: 1, name: "Cement", quantity: 120, unit: "bags", note: "OPC 43" },
//     { id: 2, name: "Sand", quantity: 80, unit: "tons", note: "River sand" },
//     { id: 3, name: "Iron Rods", quantity: 45, unit: "bundles", note: "12mm" },
//     { id: 4, name: "Bricks", quantity: 5000, unit: "pieces", note: "9x4.5x3" },
//   ];

//   const [materials, setMaterials] = useState(initial);
//   const [search, setSearch] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editItem, setEditItem] = useState(null);
//   const [form, setForm] = useState({ name: "", quantity: "", unit: "", note: "" });
//   const [sortKey, setSortKey] = useState("name");
//   const [lowThreshold, setLowThreshold] = useState(50);

//   useEffect(() => {
//     // keep unit suggestions limited to our four materials
//     if (form.name) {
//       const map = {
//         Cement: "bags",
//         Sand: "tons",
//         "Iron Rods": "bundles",
//         Bricks: "pieces",
//       };
//       if (map[form.name]) setForm((f) => ({ ...f, unit: map[form.name] }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [form.name]);

//   const handleSave = () => {
//     if (!form.name || form.quantity === "" || !form.unit) {
//       alert("Please fill all required fields (name, quantity, unit).");
//       return;
//     }

//     if (editItem) {
//       setMaterials((prev) =>
//         prev.map((m) => (m.id === editItem.id ? { ...m, ...form, quantity: Number(form.quantity) } : m))
//       );
//     } else {
//       // restrict names to the 4 allowed materials
//       const allowed = ["Cement", "Sand", "Iron Rods", "Bricks"];
//       if (!allowed.includes(form.name)) {
//         alert("Material must be one of: Cement, Sand, Iron Rods, Bricks");
//         return;
//       }
//       setMaterials((prev) => [
//         ...prev,
//         { id: Date.now(), name: form.name, quantity: Number(form.quantity), unit: form.unit, note: form.note },
//       ]);
//     }

//     setForm({ name: "", quantity: "", unit: "", note: "" });
//     setEditItem(null);
//     setShowModal(false);
//   };

//   const handleDelete = (id) => {
//     if (confirm("Delete this material record?")) setMaterials((p) => p.filter((m) => m.id !== id));
//   };

//   const filtered = materials
//     .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => {
//       if (sortKey === "name") return a.name.localeCompare(b.name);
//       if (sortKey === "quantity") return b.quantity - a.quantity;
//       return 0;
//     });

//   return (
//     <div className="p-6 min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
//             <p className="text-sm text-gray-500 mt-1">Manage Cement, Sand, Iron Rods & Bricks</p>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="flex items-center bg-white rounded-lg p-2 border">
//               <PackageSearch size={16} className="text-gray-500 mr-2" />
//               <input
//                 className="outline-none text-sm w-48"
//                 placeholder="Search materials..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>

//             <select
//               value={sortKey}
//               onChange={(e) => setSortKey(e.target.value)}
//               className="bg-white border rounded-lg p-2 text-sm"
//             >
//               <option value="name">Sort: Name</option>
//               <option value="quantity">Sort: Quantity (desc)</option>
//             </select>

//             <button
//               onClick={() => {
//                 setEditItem(null);
//                 setForm({ name: "", quantity: "", unit: "", note: "" });
//                 setShowModal(true);
//               }}
//               className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700"
//             >
//               <Plus size={16} /> Add
//             </button>
//           </div>
//         </div>

//         {/* Overview cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {materials.map((m) => (
//             <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-sm text-gray-500">{m.name}</div>
//                   <div className="text-xl font-semibold">{m.quantity} {m.unit}</div>
//                 </div>
//                 <div>
//                   <div
//                     className={`px-2 py-1 rounded-full text-sm font-medium ${
//                       m.quantity < lowThreshold ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {m.quantity < lowThreshold ? "Low" : "OK"}
//                   </div>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-400 mt-2">{m.note}</div>
//               <div className="flex gap-2 mt-4">
//                 <button
//                   onClick={() => {
//                     setEditItem(m);
//                     setForm({ name: m.name, quantity: String(m.quantity), unit: m.unit, note: m.note || "" });
//                     setShowModal(true);
//                   }}
//                   className="flex-1 px-3 py-2 border rounded-lg text-sm flex items-center justify-center gap-2"
//                 >
//                   <Edit size={14} /> Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(m.id)}
//                   className="px-3 py-2 border rounded-lg text-sm text-red-600"
//                 >
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Inventory table */}
//         <div className="bg-white rounded-2xl shadow overflow-x-auto">
//           <table className="min-w-full table-auto">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="text-left p-4 text-sm text-gray-600">Material</th>
//                 <th className="text-left p-4 text-sm text-gray-600">Quantity</th>
//                 <th className="text-left p-4 text-sm text-gray-600">Unit</th>
//                 <th className="text-left p-4 text-sm text-gray-600">Note</th>
//                 <th className="text-left p-4 text-sm text-gray-600">Status</th>
//                 <th className="text-center p-4 text-sm text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((m) => (
//                 <tr key={m.id} className="border-t hover:bg-gray-50">
//                   <td className="p-4 font-medium">{m.name}</td>
//                   <td className="p-4">{m.quantity}</td>
//                   <td className="p-4">{m.unit}</td>
//                   <td className="p-4 text-sm text-gray-500">{m.note}</td>
//                   <td className="p-4">
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${m.quantity < lowThreshold ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                       {m.quantity < lowThreshold ? 'Low Stock' : 'In Stock'}
//                     </span>
//                   </td>
//                   <td className="p-4 flex justify-center gap-2">
//                     <button
//                       onClick={() => {
//                         setEditItem(m);
//                         setForm({ name: m.name, quantity: String(m.quantity), unit: m.unit, note: m.note || "" });
//                         setShowModal(true);
//                       }}
//                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                     >
//                       <Edit size={16} />
//                     </button>
//                     <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
//                       <Trash2 size={16} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="p-6 text-center text-gray-500">No records</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Controls */}
//         <div className="flex items-center gap-4 mt-4">
//           <label className="text-sm text-gray-600">Low stock threshold:</label>
//           <input
//             type="number"
//             value={lowThreshold}
//             onChange={(e) => setLowThreshold(Number(e.target.value))}
//             className="w-24 p-2 border rounded-lg"
//           />

//           <div className="ml-auto text-sm text-gray-500">Total SKUs: {materials.length}</div>
//         </div>

//         {/* Modal */}
//         <AnimatePresence>
//           {showModal && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
//             >
//               <motion.div
//                 initial={{ y: 20, scale: 0.98 }}
//                 animate={{ y: 0, scale: 1 }}
//                 exit={{ y: 10, scale: 0.98 }}
//                 className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
//               >
//                 <h3 className="text-lg font-semibold mb-3">{editItem ? 'Edit' : 'Add'} Material</h3>

//                 <div className="grid grid-cols-1 gap-3">
//                   <select
//                     value={form.name}
//                     onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                     className="p-2 border rounded-lg"
//                   >
//                     <option value="">Select material</option>
//                     <option value="Cement">Cement</option>
//                     <option value="Sand">Sand</option>
//                     <option value="Iron Rods">Iron Rods</option>
//                     <option value="Bricks">Bricks</option>
//                   </select>

//                   <input
//                     type="number"
//                     value={form.quantity}
//                     onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
//                     placeholder="Quantity"
//                     className="p-2 border rounded-lg"
//                   />

//                   <input
//                     type="text"
//                     value={form.unit}
//                     onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
//                     placeholder="Unit (e.g., bags, tons, bundles, pieces)"
//                     className="p-2 border rounded-lg"
//                   />

//                   <input
//                     type="text"
//                     value={form.note}
//                     onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
//                     placeholder="Note (optional)"
//                     className="p-2 border rounded-lg"
//                   />
//                 </div>

//                 <div className="flex items-center justify-end gap-3 mt-4">
//                   <button onClick={() => { setShowModal(false); setEditItem(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
//                   <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }
