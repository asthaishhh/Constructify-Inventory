import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Sun, Moon, Edit2, Truck, User, MapPin, Phone, CreditCard, 
  Calendar, Search, Plus, Filter, Trash2, CheckCircle, 
  AlertCircle, Clock, Package, Navigation
} from "lucide-react";

export default function TransportationDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null });
  const [editMode, setEditMode] = useState(null);
  const [formType, setFormType] = useState("driver");
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);

  // const API_URL = "/api/transportation";
  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_URL}/api/transportation/drivers`),
        axios.get(`${API_URL}/api/transportation/vehicles`),
      ]);
      setDrivers(driversRes.data.map(d => ({ ...d, id: d._id })));
      setVehicles(vehiclesRes.data.map(v => ({ ...v, id: v._id })));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const mode = localStorage.getItem("darkMode") === "true";
    setDarkMode(mode);
    document.body.classList.toggle("dark", mode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const filteredDrivers = drivers.filter((d) =>
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNo.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "" || d.status === filterStatus)
  );

  const filteredVehicles = vehicles.filter((v) =>
    (v.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "" || v.status === filterStatus)
  );

  const handleFormChange = (e) => {
    setFormData(prevFormData => ({
      ...prevFormData, [e.target.name]: e.target.value 
    }));
  };

  const openAddModal = (type) => {
    setFormType(type);
    setFormData({});
    setEditMode(null);
    setModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setFormType(type);
    setFormData(item);
    setEditMode(item.id);
    setModalOpen(true);
    setFormError("");
  };

  const handleSubmit = async () => {
    setFormError("");
    if (formType === "driver") {
      if (!formData.name || !formData.licenseNo || !formData.contact) {
        setFormError("Please fill all required fields for the driver!");
        return;
      }
      try {
        if (editMode) {
          const res = await axios.put(`${API_URL}/api/transportation/drivers/${editMode}`, formData);
          setDrivers(drivers.map((d) => (d.id === editMode ? { ...res.data, id: res.data._id } : d)));
        } else {
          const res = await axios.post(`${API_URL}/api/transportation/drivers`, { ...formData, status: "Active" });
          setDrivers([...drivers, { ...res.data, id: res.data._id }]);
        }
      } catch (error) {
        console.error("Error saving driver:", error);
        setFormError("Failed to save driver. License No. might already exist.");
        return;
      }
    } else {
      if (!formData.vehicleNo || !formData.type || !formData.capacity) {
        setFormError("Please fill all required fields for the vehicle!");
        return;
      }
      try {
        if (editMode) {
          const res = await axios.put(`${API_URL}/api/transportation/vehicles/${editMode}`, formData);
          setVehicles(vehicles.map((v) => (v.id === editMode ? { ...res.data, id: res.data._id } : v)));
        } else {
          const res = await axios.post(`${API_URL}/api/transportation/vehicles`, { ...formData, status: "Available", fuelLevel: "100%" });
          setVehicles([...vehicles, { ...res.data, id: res.data._id }]);
        }
      } catch (error) {
        console.error("Error saving vehicle:", error);
        setFormError("Failed to save vehicle. Vehicle No. might already exist.");
        return;
      }
    }

    setModalOpen(false);
    setFormData({});
    setEditMode(null);
    setFormError("");
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/transportation/${deleteModal.type}s/${deleteModal.id}`);
      fetchData(); // Refetch data to ensure consistency
    } catch (error) {
      console.error(`Error deleting ${deleteModal.type}:`, error);
    }
    setDeleteModal({ open: false, type: null, id: null });
  };

  const openDeleteModal = (type, id) => {
    setDeleteModal({ open: true, type, id });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "On Route":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Maintenance":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400";
    }
  };

  const stats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.status === "Active" || d.status === "On Route").length,
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === "Available").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold dark:text-white">
        Loading Transportation Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                Transportation Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage fleet and drivers efficiently</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={() => openAddModal("driver")}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
              <Button 
                onClick={() => openAddModal("vehicle")}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
              {/* <Button 
                variant="outline" 
                onClick={toggleDarkMode}
                className="border-2 shadow-sm"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button> */}
            </div>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Drivers</h3>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl"><User className="w-6 h-6 text-blue-600 dark:text-blue-300" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDrivers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">All registered drivers</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active Drivers</h3>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeDrivers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Ready or on route</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Vehicles</h3>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl"><Truck className="w-6 h-6 text-orange-600 dark:text-orange-300" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVehicles}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Entire fleet count</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Available Vehicles</h3>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl"><Package className="w-6 h-6 text-purple-600 dark:text-purple-300" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.availableVehicles}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Ready for assignment</p>
            </div>
          </section>

          <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 w-1/3 ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 w-1/3 ${
                activeTab === "drivers"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Drivers
            </button>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 w-1/3 ${
                activeTab === "vehicles"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Vehicles
            </button>
          </div>
        </div>

        <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search drivers or vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Available">Available</option>
              <option value="On Route">On Route</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </section>

        {(activeTab === "overview" || activeTab === "drivers") && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Drivers
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDrivers.map((driver, idx) => (
                <Card key={driver.id} className="group relative overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700">
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-90"></div>
                  
                  <CardHeader className="relative pt-6 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{driver.name}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Navigation className="w-3 h-3" />
                          <p className="text-xs">{driver.route}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {driver.status}
                      </span>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 h-8 w-8 p-0"
                        onClick={() => openEditModal("driver", driver)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-red-500/90 hover:bg-red-600 text-white h-8 w-8 p-0"
                        onClick={() => openDeleteModal("driver", driver.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-mono text-xs">{driver.licenseNo}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{driver.experience} years experience</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{driver.contact}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                      <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">{driver.assignedVehicle}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredDrivers.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full"><User className="w-12 h-12 text-gray-400" /></div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No drivers found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === "overview" || activeTab === "vehicles") && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              Vehicles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVehicles.map((vehicle, idx) => (
                <Card key={vehicle.id} className="group relative overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700">
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-90"></div>
                  
                  <CardHeader className="relative pt-6 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{vehicle.vehicleNo}</h3>
                        <p className="text-white/90 text-sm">{vehicle.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 h-8 w-8 p-0"
                        onClick={() => openEditModal("vehicle", vehicle)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-red-500/90 hover:bg-red-600 text-white h-8 w-8 p-0"
                        onClick={() => openDeleteModal("vehicle", vehicle.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                      <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium">Capacity: {vehicle.capacity}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Driver: {vehicle.driver || "Unassigned"}</span>
                    </div>
                    
                    {vehicle.lastMaintenance && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs">Last Service: {vehicle.lastMaintenance}</span>
                      </div>
                    )}
                    
                    {vehicle.fuelLevel && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          {/* <span>Fuel Level</span> */}
                          {/* <span className="font-medium">{vehicle.fuelLevel}</span> */}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: vehicle.fuelLevel }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredVehicles.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                 <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full"><Truck className="w-12 h-12 text-gray-400" /></div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No vehicles found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">
                  {editMode ? "Edit" : "Add"} {formType === "driver" ? "Driver" : "Vehicle"}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative" role="alert">
                    <span className="block sm:inline">{formError}</span>
                  </div>
                )}
                {formType === "driver" ? (
                  <>
                    <input
                      placeholder="Full Name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="License No. (e.g., GJ-2020-4587)"
                      name="licenseNo"
                      value={formData.licenseNo || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="Experience (years)"
                      name="experience"
                      type="number"
                      value={formData.experience || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="Contact Number"
                      name="contact"
                      value={formData.contact || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="Assigned Vehicle (e.g., GJ01AB1234)"
                      name="assignedVehicle"
                      value={formData.assignedVehicle || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="Route (e.g., Ahmedabad to Surat)"
                      name="route"
                      value={formData.route || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      name="status"
                      value={formData.status || "Active"}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="On Route">On Route</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      placeholder="Vehicle Number (e.g., GJ01AB1234)"
                      name="vehicleNo"
                      value={formData.vehicleNo || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      name="type"
                      value={formData.type || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini Van">Mini Van</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Container">Container</option>
                    </select>
                    <input
                      placeholder="Capacity (e.g., 15 Tons)"
                      name="capacity"
                      value={formData.capacity || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      name="status"
                      value={formData.status || "Available"}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Available">Available</option>
                      <option value="On Route">On Route</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <input
                      placeholder="Driver Name (optional)"
                      name="driver"
                      value={formData.driver || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="Last Maintenance Date (YYYY-MM-DD)"
                      name="lastMaintenance"
                      type="date"
                      value={formData.lastMaintenance || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      placeholder="Fuel Level (e.g., 75%)"
                      name="fuelLevel"
                      value={formData.fuelLevel || ""}
                      onChange={handleFormChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium"
                  >
                    {editMode ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Dialog open={deleteModal.open} onClose={() => setDeleteModal({ open: false, type: null, id: null })}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <DialogContent>
            <p className="text-gray-600 dark:text-gray-400 py-4">
              Are you sure you want to delete this {deleteModal.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModal({ open: false, type: null, id: null })}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}