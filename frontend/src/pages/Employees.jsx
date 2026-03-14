import React, { useState, useEffect } from "react";
import axios from "../utils/axiosConfig";
import {
  Sun,
  Moon,
  Edit2,
  Users,
  Phone,
  Calendar,
  IndianRupee,
  Trash2,
  Search,
  Plus,
} from "lucide-react";

export default function WarehouseEmployees() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    designation: "",
    shift: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    experience: "",
    salary: "",
    shift: "",
    contact: "",
    photo: "",
  });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "";

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const isAdmin = role === "admin";

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/employees`);
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const filteredEmployees = employees
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.designation === "" ||
          emp.designation === filters.designation) &&
        (filters.shift === "" || emp.shift === filters.shift),
    )
    .sort((a, b) => {
      if (sortBy === "salaryAsc") return a.salary - b.salary;
      if (sortBy === "salaryDesc") return b.salary - a.salary;
      if (sortBy === "expAsc") return a.experience - b.experience;
      if (sortBy === "expDesc") return b.experience - a.experience;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or Edit Employee
  const handleAddOrEdit = async () => {
    if (
      !formData.name ||
      !formData.designation ||
      !formData.experience ||
      !formData.salary ||
      !formData.contact
    ) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      if (editingEmployee) {
        if (!isAdmin) {
          alert("You are not authorized to edit employees.");
          return;
        }
        // Edit
        const res = await axios.put(
          `${API_URL}/api/employees/${editingEmployee._id}`,
          {
            ...formData,
            experience: Number(formData.experience),
            salary: Number(formData.salary),
          },
        );
        setEmployees((prev) =>
          prev.map((emp) => (emp._id === res.data._id ? res.data : emp)),
        );
      } else {
        // Add
        const newEmp = {
          ...formData,
          experience: Number(formData.experience),
          salary: Number(formData.salary),
          photo:
            formData.photo ||
            `https://randomuser.me/api/portraits/${
              Math.random() > 0.5 ? "men" : "women"
            }/${Math.floor(Math.random() * 70)}.jpg`,
        };
        const res = await axios.post(`${API_URL}/api/employees`, newEmp);
        setEmployees([...employees, res.data]);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Error saving employee");
    }

    setModalOpen(false);
    setFormData({
      name: "",
      designation: "",
      experience: "",
      salary: "",
      shift: "",
      contact: "",
      photo: "",
    });
    setEditingEmployee(null);
  };

  // Delete employee
  const handleDelete = async (_id) => {
    if (!isAdmin) {
      alert("You are not authorized to delete employees.");
      return;
    }
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
    setFormData(emp);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      designation: "",
      experience: "",
      salary: "",
      shift: "",
      contact: "",
      photo: "",
    });
    setModalOpen(true);
  };

  const getShiftBadgeColor = (shift) =>
    shift === "Day"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";

  const stats = {
    total: employees.length,
    dayShift: employees.filter((e) => e.shift === "Day").length,
    nightShift: employees.filter((e) => e.shift === "Night").length,
    avgSalary: employees.length
      ? Math.round(
          employees.reduce((sum, e) => sum + e.salary, 0) / employees.length,
        )
      : 0,
  };

  const formatIndianPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Employees...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Warehouse Team
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your workforce efficiently
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* <button
                onClick={toggleDarkMode}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button> */}

            <button
              onClick={openAddModal}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Staff
              </h3>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Active employees
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Day Shift
              </h3>
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-xl">
                <Sun className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.dayShift}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Working daytime
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Night Shift
              </h3>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.nightShift}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Working nighttime
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Avg Salary
              </h3>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center w-12 h-12">
                <span className="text-2xl font-bold text-green-600 dark:text-green-300">
                  ₹
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatIndianPrice(stats.avgSalary)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Average monthly
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Search by name..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <select
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Watchman">Watchman</option>
              <option value="Caretaker">Caretaker</option>
              <option value="Load Lifter">Load Lifter</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Electrician">Electrician</option>
              <option value="Security Guard">Security Guard</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Housekeeper">Housekeeper</option>
              <option value="Driver">Driver</option>
              <option value="Technician">Technician</option>
              <option value="Gardener">Gardener</option>
            </select>

            <select
              name="shift"
              value={filters.shift}
              onChange={handleFilterChange}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="">All Shifts</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="salaryAsc">Salary ↑</option>
              <option value="salaryDesc">Salary ↓</option>
              <option value="expAsc">Experience ↑</option>
              <option value="expDesc">Experience ↓</option>
            </select>
          </div>
        </section>

        {/* Employee Table */}
        <section className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Users className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                          No employees found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {emp.designation}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{emp.experience} yrs</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg w-fit font-semibold">
                        <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                        {formatIndianPrice(emp.salary)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${getShiftBadgeColor(emp.shift)}`}
                      >
                        {emp.shift === "Day" ? "☀️ Day" : "🌙 Night"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{emp.contact}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(emp)}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all flex items-center gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(emp._id)}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <input
                  placeholder="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Role *</option>
                  <option value="Watchman">Watchman</option>
                  <option value="Caretaker">Caretaker</option>
                  <option value="Load Lifter">Load Lifter</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Housekeeper">Housekeeper</option>
                  <option value="Driver">Driver</option>
                  <option value="Technician">Technician</option>
                  <option value="Gardener">Gardener</option>
                </select>
                <input
                  type="number"
                  placeholder="Experience (years) *"
                  name="experience"
                  value={formData.experience}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Salary (₹) *"
                  name="salary"
                  value={formData.salary}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Shift</option>
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
                <input
                  placeholder="Contact Number *"
                  name="contact"
                  value={formData.contact}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  placeholder="Photo URL (optional)"
                  name="photo"
                  value={formData.photo}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddOrEdit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium"
                  >
                    {editingEmployee ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
