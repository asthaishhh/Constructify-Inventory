import React, { useEffect, useMemo, useState } from "react";
import axios from "../utils/axiosConfig";
import {
  Truck,
  User,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sun,
  Moon,
  Phone,
  Route,
  BadgeCheck,
  Fuel,
  Calendar,
  Gauge,
  X,
} from "lucide-react";

const DRIVER_STATUS = ["Active", "On Route", "Inactive"];
const VEHICLE_STATUS = ["Available", "On Route", "Maintenance", "Inactive", "Standby"];

const emptyDriverForm = {
  name: "",
  licenseNo: "",
  experience: "",
  contact: "",
  assignedVehicle: "",
  route: "",
  status: "Active",
};

const emptyVehicleForm = {
  vehicleNo: "",
  type: "",
  capacity: "",
  status: "Available",
  fuelLevel: 100,
  lastMaintenance: "",
};

const inputCls =
  "w-full border-2 border-gray-200 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";

const selectCls = `${inputCls} cursor-pointer`;

const normalizeDriver = (d) => ({
  ...d,
  _id: d?._id || d?.id,
  name: d?.name || "",
  licenseNo: d?.licenseNo || "",
  experience: Number(d?.experience || 0),
  contact: d?.contact || "",
  assignedVehicle: d?.assignedVehicle || "",
  route: d?.route || "",
  status: d?.status || "Active",
});

const normalizeVehicle = (v) => ({
  ...v,
  _id: v?._id || v?.id,
  vehicleNo: v?.vehicleNo || "",
  type: v?.type || "",
  capacity: Number(v?.capacity || 0),
  status: v?.status || "Available",
  fuelLevel: Number(v?.fuelLevel ?? 0),
  lastMaintenance: v?.lastMaintenance ? String(v.lastMaintenance).slice(0, 10) : "",
});

const getStatusBadge = (status) => {
  if (["Active", "Available"].includes(status)) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
  if (status === "On Route") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
  if (status === "Maintenance") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400";
};

export default function Transportation() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState(true);

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [activeTab, setActiveTab] = useState("drivers");
  const [filters, setFilters] = useState({ search: "", status: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState("driver");
  const [editingId, setEditingId] = useState(null);
  const [driverForm, setDriverForm] = useState(emptyDriverForm);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get("/api/transportation/drivers"),
        axios.get("/api/transportation/vehicles"),
      ]);

      const driverPayload = Array.isArray(driversRes.data)
        ? driversRes.data
        : Array.isArray(driversRes.data?.drivers)
          ? driversRes.data.drivers
          : [];

      const vehiclePayload = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : Array.isArray(vehiclesRes.data?.vehicles)
          ? vehiclesRes.data.vehicles
          : [];

      setDrivers(driverPayload.map(normalizeDriver));
      setVehicles(vehiclePayload.map(normalizeVehicle));
    } catch (error) {
      console.error("Failed to fetch transportation data:", error);
      setDrivers([]);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignedDriverByVehicle = useMemo(() => {
    const map = new Map();
    drivers.forEach((d) => {
      const key = String(d.assignedVehicle || "").trim().toLowerCase();
      if (key) map.set(key, d.name);
    });
    return map;
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const s = filters.search.toLowerCase();
      const matchesSearch =
        d.name.toLowerCase().includes(s) ||
        d.licenseNo.toLowerCase().includes(s) ||
        d.contact.toLowerCase().includes(s);
      const matchesStatus = !filters.status || d.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, filters]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const s = filters.search.toLowerCase();
      const matchesSearch =
        v.vehicleNo.toLowerCase().includes(s) ||
        v.type.toLowerCase().includes(s);
      const matchesStatus = !filters.status || v.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, filters]);

  const stats = useMemo(() => {
    const activeDrivers = drivers.filter((d) => ["Active", "On Route"].includes(d.status)).length;
    const onRouteDrivers = drivers.filter((d) => d.status === "On Route").length;
    const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
    const maintenanceVehicles = vehicles.filter((v) => v.status === "Maintenance").length;

    return {
      totalDrivers: drivers.length,
      activeDrivers,
      onRouteDrivers,
      totalVehicles: vehicles.length,
      availableVehicles,
      maintenanceVehicles,
    };
  }, [drivers, vehicles]);

  const openAddModal = (type) => {
    setFormType(type);
    setEditingId(null);
    if (type === "driver") setDriverForm(emptyDriverForm);
    else setVehicleForm(emptyVehicleForm);
    setModalOpen(true);
  };

  const openEditModal = (type, row) => {
    setFormType(type);
    setEditingId(row._id);
    if (type === "driver") {
      setDriverForm({
        name: row.name || "",
        licenseNo: row.licenseNo || "",
        experience: String(row.experience ?? ""),
        contact: row.contact || "",
        assignedVehicle: row.assignedVehicle || "",
        route: row.route || "",
        status: row.status || "Active",
      });
    } else {
      setVehicleForm({
        vehicleNo: row.vehicleNo || "",
        type: row.type || "",
        capacity: String(row.capacity ?? ""),
        status: row.status || "Available",
        fuelLevel: row.fuelLevel ?? 100,
        lastMaintenance: row.lastMaintenance ? String(row.lastMaintenance).slice(0, 10) : "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setDriverForm(emptyDriverForm);
    setVehicleForm(emptyVehicleForm);
  };

  const saveDriver = async () => {
    if (!driverForm.name || !driverForm.licenseNo || !driverForm.contact) {
      alert("Name, License No and Contact are required.");
      return;
    }

    const payload = {
      ...driverForm,
      experience: Number(driverForm.experience || 0),
    };

    try {
      if (editingId) {
        const res = await axios.put(`/api/transportation/drivers/${editingId}`, payload);
        const updated = normalizeDriver(res.data?.driver || res.data);
        setDrivers((prev) => prev.map((d) => (d._id === editingId ? updated : d)));
      } else {
        const res = await axios.post("/api/transportation/drivers", payload);
        const created = normalizeDriver(res.data?.driver || res.data);
        setDrivers((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving driver:", err?.response?.data || err.message);
      alert("Failed to save driver. License number may already exist.");
    }
  };

  const saveVehicle = async () => {
    if (!vehicleForm.vehicleNo || !vehicleForm.type || !vehicleForm.capacity) {
      alert("Vehicle No, Type and Capacity are required.");
      return;
    }

    const payload = {
      ...vehicleForm,
      capacity: Number(vehicleForm.capacity || 0),
      fuelLevel: Number(vehicleForm.fuelLevel || 0),
      lastMaintenance: vehicleForm.lastMaintenance || null,
    };

    try {
      if (editingId) {
        const res = await axios.put(`/api/transportation/vehicles/${editingId}`, payload);
        const updated = normalizeVehicle(res.data?.vehicle || res.data);
        setVehicles((prev) => prev.map((v) => (v._id === editingId ? updated : v)));
      } else {
        const res = await axios.post("/api/transportation/vehicles", payload);
        const created = normalizeVehicle(res.data?.vehicle || res.data);
        setVehicles((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving vehicle:", err?.response?.data || err.message);
      alert("Failed to save vehicle. Vehicle number may already exist.");
    }
  };

  const handleDelete = async (type, id) => {
    if (!isAdmin) {
      alert("Only admin can delete records.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      if (type === "driver") {
        await axios.delete(`/api/transportation/drivers/${id}`);
        setDrivers((prev) => prev.filter((d) => d._id !== id));
      } else {
        await axios.delete(`/api/transportation/vehicles/${id}`);
        setVehicles((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err?.response?.data || err.message);
      alert(`Failed to delete ${type}.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg animate-pulse">
          Loading Transportation...
        </p>
      </div>
    );
  }

  const activeRows = activeTab === "drivers" ? filteredDrivers : filteredVehicles;
  const statusOptions = activeTab === "drivers" ? DRIVER_STATUS : VEHICLE_STATUS;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Transportation
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-[52px]">
              Manage drivers and vehicles in one place
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <button
              onClick={() => openAddModal("driver")}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Driver
            </button>

            <button
              onClick={() => openAddModal("vehicle")}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            {
              label: "Total Drivers",
              value: stats.totalDrivers,
              sub: `${stats.activeDrivers} active`,
              icon: <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "On Route",
              value: stats.onRouteDrivers,
              sub: "Drivers currently moving",
              icon: <Route className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
            },
            {
              label: "Total Vehicles",
              value: stats.totalVehicles,
              sub: `${stats.availableVehicles} available`,
              icon: <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
              bg: "bg-orange-50 dark:bg-orange-900/20",
            },
            {
              label: "Maintenance",
              value: stats.maintenanceVehicles,
              sub: "Vehicles in service",
              icon: <Gauge className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">{card.label}</p>
                <div className={`p-2 rounded-lg ${card.bg} flex-shrink-0`}>{card.icon}</div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1 w-full lg:w-auto">
              <button
                onClick={() => {
                  setActiveTab("drivers");
                  setFilters({ search: "", status: "" });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "drivers"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Drivers
              </button>
              <button
                onClick={() => {
                  setActiveTab("vehicles");
                  setFilters({ search: "", status: "" });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "vehicles"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Vehicles
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder={activeTab === "drivers" ? "Search by name/license/contact" : "Search by vehicle/type"}
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <select
                className={`${selectCls} min-w-[170px]`}
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {activeTab === "drivers" ? "Driver Records" : "Vehicle Records"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeRows.length} result(s)
            </p>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "drivers" ? (
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/40">
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">License No</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Contact</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Experience</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Assigned Vehicle</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Route</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d) => (
                    <tr key={d._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-900/30">
                      <td className="p-4 text-sm font-semibold text-gray-800 dark:text-white">{d.name}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{d.licenseNo}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{d.contact}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{d.experience} yr</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{d.assignedVehicle || "-"}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{d.route || "-"}</td>
                      <td className="p-4">
                        <span className={`${getStatusBadge(d.status)} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal("driver", d)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete("driver", d._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/40">
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Vehicle No</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Capacity</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Assigned Driver</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Fuel</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Last Maintenance</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => {
                    const assigned = assignedDriverByVehicle.get(String(v.vehicleNo || "").toLowerCase());
                    return (
                      <tr key={v._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-900/30">
                        <td className="p-4 text-sm font-semibold text-gray-800 dark:text-white">{v.vehicleNo}</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{v.type}</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{v.capacity}</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{assigned || "Unassigned"}</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{Number(v.fuelLevel || 0)}%</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-200">{v.lastMaintenance || "-"}</td>
                        <td className="p-4">
                          <span className={`${getStatusBadge(v.status)} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal("vehicle", v)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete("vehicle", v._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeRows.length === 0 && (
              <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                No records found for current filters.
              </div>
            )}
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h3 className="text-lg font-bold text-white">
                {editingId ? "Edit" : "Add"} {formType === "driver" ? "Driver" : "Vehicle"}
              </h3>
              <button onClick={closeModal} className="text-white/90 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formType === "driver" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Name" value={driverForm.name} onChange={(e) => setDriverForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className={inputCls} placeholder="License No" value={driverForm.licenseNo} onChange={(e) => setDriverForm((p) => ({ ...p, licenseNo: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Contact" value={driverForm.contact} onChange={(e) => setDriverForm((p) => ({ ...p, contact: e.target.value }))} />
                    <input className={inputCls} type="number" min="0" placeholder="Experience (years)" value={driverForm.experience} onChange={(e) => setDriverForm((p) => ({ ...p, experience: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Assigned Vehicle No" value={driverForm.assignedVehicle} onChange={(e) => setDriverForm((p) => ({ ...p, assignedVehicle: e.target.value }))} />
                    <select className={selectCls} value={driverForm.status} onChange={(e) => setDriverForm((p) => ({ ...p, status: e.target.value }))}>
                      {DRIVER_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <input className={inputCls} placeholder="Route" value={driverForm.route} onChange={(e) => setDriverForm((p) => ({ ...p, route: e.target.value }))} />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={inputCls} placeholder="Vehicle No" value={vehicleForm.vehicleNo} onChange={(e) => setVehicleForm((p) => ({ ...p, vehicleNo: e.target.value }))} />
                    <input className={inputCls} placeholder="Type (e.g. Truck)" value={vehicleForm.type} onChange={(e) => setVehicleForm((p) => ({ ...p, type: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={inputCls} type="number" min="0" placeholder="Capacity" value={vehicleForm.capacity} onChange={(e) => setVehicleForm((p) => ({ ...p, capacity: e.target.value }))} />
                    <select className={selectCls} value={vehicleForm.status} onChange={(e) => setVehicleForm((p) => ({ ...p, status: e.target.value }))}>
                      {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className={inputCls} type="number" min="0" max="100" placeholder="Fuel Level (%)" value={vehicleForm.fuelLevel} onChange={(e) => setVehicleForm((p) => ({ ...p, fuelLevel: e.target.value }))} />
                    <input className={inputCls} type="date" value={vehicleForm.lastMaintenance} onChange={(e) => setVehicleForm((p) => ({ ...p, lastMaintenance: e.target.value }))} />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button onClick={formType === "driver" ? saveDriver : saveVehicle} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
