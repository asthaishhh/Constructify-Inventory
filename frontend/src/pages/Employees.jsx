import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import {
  Sun,
  Moon,
  Edit2,
  Users,
  Phone,
  Calendar,
  Trash2,
  Search,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Briefcase,
} from "lucide-react";

export default function WarehouseEmployees() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ search: "", designation: "", shift: "" });
  const [sortBy, setSortBy] = useState("name");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "", designation: "", experience: "", salary: "", shift: "", contact: "", photo: "",
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"
  const API_URL = import.meta.env.VITE_API_URL || "";

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const isAdmin = role === "admin";

  const normalizeEmployee = (emp) => {
    const safeSalary = Number(emp?.salary);
    const safeExperience = Number(emp?.experience);
    return {
      ...emp,
      designation: emp?.designation || emp?.role || "",
      role: emp?.role || emp?.designation || "",
      experience: Number.isFinite(safeExperience) ? safeExperience : 0,
      salary: Number.isFinite(safeSalary) ? safeSalary : 0,
      shift: emp?.shift || "",
      photo:
        emp?.photo ||
        `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 70)}.jpg`,
    };
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/employees`);
        const payload = Array.isArray(res.data) ? res.data : res.data?.employees || [];
        setEmployees(payload.map(normalizeEmployee));
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const filteredEmployees = employees
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.designation === "" || emp.designation === filters.designation) &&
        (filters.shift === "" || emp.shift === filters.shift)
    )
    .sort((a, b) => {
      if (sortBy === "salaryAsc") return a.salary - b.salary;
      if (sortBy === "salaryDesc") return b.salary - a.salary;
      if (sortBy === "expAsc") return a.experience - b.experience;
      if (sortBy === "expDesc") return b.experience - a.experience;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddOrEdit = async () => {
    if (!formData.name || !formData.designation || !formData.experience || !formData.salary || !formData.contact) {
      alert("Please fill all required fields!");
      return;
    }
    try {
      if (editingEmployee) {
        if (!isAdmin) { alert("You are not authorized to edit employees."); return; }
        const res = await axios.put(`${API_URL}/api/employees/${editingEmployee._id}`, {
          ...formData,
          role: formData.designation,
          experience: Number(formData.experience),
          salary: Number(formData.salary),
        });
        const updatedEmployee = normalizeEmployee(res.data?.employee || res.data);
        setEmployees((prev) => prev.map((emp) => (emp._id === updatedEmployee._id ? updatedEmployee : emp)));
      } else {
        const newEmp = {
          ...formData,
          role: formData.designation,
          experience: Number(formData.experience),
          salary: Number(formData.salary),
          photo: formData.photo || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 70)}.jpg`,
        };
        const res = await axios.post(`${API_URL}/api/employees`, newEmp);
        const createdEmployee = normalizeEmployee(res.data?.employee || res.data);
        setEmployees((prev) => [...prev, createdEmployee]);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Error saving employee");
    }
    setModalOpen(false);
    setFormData({ name: "", designation: "", experience: "", salary: "", shift: "", contact: "", photo: "" });
    setEditingEmployee(null);
  };

  const handleDelete = async (_id) => {
    if (!isAdmin) { alert("You are not authorized to delete employees."); return; }
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${API_URL}/api/employees/${_id}`);
        setEmployees(employees.filter((emp) => emp._id !== _id));
      } catch (err) {
        console.error("Error deleting employee:", err);
        alert("Error deleting employee");
      }
    }
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name || "",
      designation: emp.designation || emp.role || "",
      experience: String(emp.experience ?? ""),
      salary: String(emp.salary ?? ""),
      shift: emp.shift || "",
      contact: emp.contact || "",
      photo: emp.photo || "",
    });
    setModalOpen(true);
  };
  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ name: "", designation: "", experience: "", salary: "", shift: "", contact: "", photo: "" });
    setModalOpen(true);
  };

  const formatIndianPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const stats = {
    total: employees.length,
    dayShift: employees.filter((e) => e.shift === "Day").length,
    nightShift: employees.filter((e) => e.shift === "Night").length,
    avgSalary: employees.length ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length) : 0,
  };

  const ROLES = ["Watchman", "Caretaker", "Load Lifter", "Supervisor", "Electrician", "Security Guard", "Cleaner", "Housekeeper", "Driver", "Technician", "Gardener"];

  const inputCls = "w-full border-2 border-gray-200 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";
  const selectCls = `${inputCls} cursor-pointer`;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg animate-pulse">Loading Employees...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Warehouse Team
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-[52px]">
              {stats.total} active employees · {stats.dayShift} day · {stats.nightShift} night
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2.5 text-xs font-semibold transition-all ${viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2.5 text-xs font-semibold transition-all ${viewMode === "cards" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                Cards
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </header>

        {/* ── Stats Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Staff", value: stats.total, sub: "Active employees", icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-800/30" },
            { label: "Day Shift", value: stats.dayShift, sub: "Working daytime", icon: <Sun className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-800/30" },
            { label: "Night Shift", value: stats.nightShift, sub: "Working nights", icon: <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />, bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-100 dark:border-indigo-800/30" },
            { label: "Avg Salary", value: formatIndianPrice(stats.avgSalary), sub: "Monthly average", icon: <span className="text-base font-bold text-green-600 dark:text-green-400">₹</span>, bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-100 dark:border-green-800/30" },
          ].map(({ label, value, sub, icon, bg, border }) => (
            <div key={label} className={`bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border ${border} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
                <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>{icon}</div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </section>

        {/* ── Filters ── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search employees..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {filters.search && (
                <button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <select name="designation" value={filters.designation} onChange={handleFilterChange}
                className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer min-w-[120px]">
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <select name="shift" value={filters.shift} onChange={handleFilterChange}
                className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer min-w-[110px]">
                <option value="">All Shifts</option>
                <option value="Day">☀️ Day</option>
                <option value="Night">🌙 Night</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer min-w-[130px]">
                <option value="name">Name A–Z</option>
                <option value="salaryAsc">Salary ↑</option>
                <option value="salaryDesc">Salary ↓</option>
                <option value="expAsc">Experience ↑</option>
                <option value="expDesc">Experience ↓</option>
              </select>
            </div>
          </div>

          {/* Active filters count */}
          {(filters.search || filters.designation || filters.shift) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-blue-600">{filteredEmployees.length}</span> of {employees.length} employees
              </span>
              <button onClick={() => setFilters({ search: "", designation: "", shift: "" })}
                className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            </div>
          )}
        </section>

        {/* ── Table View ── */}
        {viewMode === "table" && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-100 dark:border-gray-700">
                    {["Employee", "Designation", "Experience", "Salary", "Shift", "Contact", ...(isAdmin ? ["Actions"] : [])].map(h => (
                      <th key={h} className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                            <Users className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-semibold">No employees found</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-100 group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img src={emp.photo} alt={emp.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm" />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${emp.shift === "Day" ? "bg-amber-400" : "bg-indigo-500"}`} />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                          <Briefcase className="w-3 h-3" />
                          {emp.designation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">{emp.experience}</span>
                          <span className="text-gray-400 text-xs">yrs</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-green-700 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg">
                          {formatIndianPrice(emp.salary)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${emp.shift === "Day" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"}`}>
                          {emp.shift === "Day" ? "☀️ Day" : "🌙 Night"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <a href={`tel:${emp.contact}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm group/phone">
                          <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="group-hover/phone:underline">{emp.contact}</span>
                        </a>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(emp)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                              title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(emp._id)}
                              className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all"
                              title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {filteredEmployees.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} shown
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Card View ── */}
        {viewMode === "cards" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-semibold">No employees found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            ) : filteredEmployees.map((emp) => (
              <div key={emp._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
                {/* Card top accent */}
                <div className={`h-1 ${emp.shift === "Day" ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`} />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative flex-shrink-0">
                      <img src={emp.photo} alt={emp.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] ${emp.shift === "Day" ? "bg-amber-100" : "bg-indigo-100"}`}>
                        {emp.shift === "Day" ? "☀️" : "🌙"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{emp.name}</h3>
                      <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium">
                        <Briefcase className="w-3 h-3" />
                        {emp.designation}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Experience
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{emp.experience} yrs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 dark:text-gray-500">Salary</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{formatIndianPrice(emp.salary)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Contact
                      </span>
                      <a href={`tel:${emp.contact}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{emp.contact}</a>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => openEditModal(emp)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(emp._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                <input placeholder="e.g. Rajesh Kumar" name="name" value={formData.name} onChange={handleFormChange} className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Role *</label>
                <select name="designation" value={formData.designation} onChange={handleFormChange} className={selectCls}>
                  <option value="">Select role...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Experience (yrs) *</label>
                  <input type="number" placeholder="0" name="experience" value={formData.experience} onChange={handleFormChange} className={inputCls} min="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Salary (₹) *</label>
                  <input type="number" placeholder="0" name="salary" value={formData.salary} onChange={handleFormChange} className={inputCls} min="0" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Shift</label>
                <select name="shift" value={formData.shift} onChange={handleFormChange} className={selectCls}>
                  <option value="">Select shift...</option>
                  <option value="Day">☀️ Day</option>
                  <option value="Night">🌙 Night</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Contact Number *</label>
                <input placeholder="+91 98765 43210" name="contact" value={formData.contact} onChange={handleFormChange} className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Photo URL <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                <input placeholder="https://..." name="photo" value={formData.photo} onChange={handleFormChange} className={inputCls} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all active:scale-95">
                  Cancel
                </button>
                <button onClick={handleAddOrEdit}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md shadow-blue-200 dark:shadow-blue-900/30">
                  {editingEmployee ? "Update" : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}