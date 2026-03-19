import React, { useEffect, useState } from "react";
import customersApi from "../api/customers.api";
import {
  Search, Plus, X, Edit2, Trash2, User, Building2,
  Phone, Mail, MapPin, FileText, Users,
} from "lucide-react";

/* ─── Highlight matched text ─────────────────────────────────── */
const Highlight = ({ text = "", query = "" }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-amber-700 rounded px-0.5 font-bold not-italic">
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
};

/* ─── Avatar initials ─────────────────────────────────────────── */
const Avatar = ({ name = "" }) => {
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 select-none">
      {initials || <User className="w-4 h-4" />}
    </div>
  );
};

/* ─── Component ───────────────────────────────────────────────── */
const Customers = () => {
  const [customers, setCustomers]     = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [editingId, setEditingId]     = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const emptyForm = { name: "", phone: "", email: "", address: "", companyName: "", gstNumber: "" };
  const [formData, setFormData] = useState(emptyForm);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const q = searchQuery.trim().toLowerCase();
  const filteredCustomers = q
    ? customers.filter((c) =>
        (c.companyName || "").toLowerCase().includes(q) ||
        (c.name        || "").toLowerCase().includes(q) ||
        (c.phone       || "").toLowerCase().includes(q) ||
        (c.gstNumber   || "").toLowerCase().includes(q)
      )
    : customers;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customersApi.getAllCustomers();
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        if (!isAdmin) { alert("You are not authorized to edit customers."); return; }
        const updated = await customersApi.updateCustomer(editingId, formData);
        setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        await customersApi.createCustomer(formData);
        await fetchCustomers();
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error saving customer.");
    }
  };

  const handleEdit = (cust) => {
    setEditingId(cust._id);
    setFormData({
      name: cust.name || "", phone: cust.phone || "", email: cust.email || "",
      address: cust.address || "", companyName: cust.companyName || "", gstNumber: cust.gstNumber || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) { alert("You are not authorized to delete customers."); return; }
    if (!window.confirm("Delete this customer?")) return;
    try {
      await customersApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err?.message || "Error deleting customer.");
    }
  };

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); setShowForm(false); };

  const inputCls =
    "w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-xl " +
    "bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 " +
    "dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
    "outline-none transition-all";

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading customers…</p>
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
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Customers
                </h1>
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                  {customers.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Manage your client directory
              </p>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 font-semibold text-xs sm:text-sm transition-all flex-shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Add Customer</span>
            </button>
          )}
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 border-l-4 border-l-red-500 rounded-xl p-3 sm:p-4 mb-4 text-xs sm:text-sm text-red-700 dark:text-red-400">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="flex-shrink-0 text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white">
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h2>
              <button onClick={resetForm} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <User className="w-3.5 h-3.5" /> Customer Name <span className="text-blue-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    required placeholder="Enter customer name" className={inputCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone <span className="text-blue-500">*</span>
                  </label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    required placeholder="Enter phone number" className={inputCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="Enter email address" className={inputCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Company Name
                  </label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                    placeholder="Enter company name" className={inputCls} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <FileText className="w-3.5 h-3.5" /> GST Number
                  </label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                    placeholder="Enter GST number" className={inputCls} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Address
                  </label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    placeholder="Enter address" className={inputCls} />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all active:scale-95">
                  Cancel
                </button>
                <button type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md shadow-blue-200 dark:shadow-blue-900/30">
                  {editingId ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Search ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, company, phone or GST…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {q && (
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-blue-600">{filteredCustomers.length}</span>{" "}
                result{filteredCustomers.length !== 1 ? "s" : ""} for &ldquo;{searchQuery.trim()}&rdquo;
              </p>
              <button onClick={() => setSearchQuery("")}
                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {filteredCustomers.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
              {q
                ? <Search className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                : <Users className="w-10 h-10 text-gray-300 dark:text-gray-500" />
              }
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">
              {q ? `No results for "${searchQuery.trim()}"` : "No customers yet"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {q ? "Try a different search term" : "Add your first customer above"}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            MOBILE & TABLET  (<lg) — stacked card list
        ═══════════════════════════════════════════════ */}
        {filteredCustomers.length > 0 && (
          <div className="lg:hidden flex flex-col gap-3">
            {filteredCustomers.map((cust) => (
              <div key={cust._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-4">

                  {/* Top: avatar + name + action buttons */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={cust.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          <Highlight text={cust.name} query={searchQuery} />
                        </p>
                        {cust.companyName && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <Highlight text={cust.companyName} query={searchQuery} />
                          </p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(cust)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cust._id)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Detail rows */}
                  <div className="flex flex-col gap-2 text-xs">
                    {cust.phone && (
                      <a href={`tel:${cust.phone}`}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span><Highlight text={cust.phone} query={searchQuery} /></span>
                      </a>
                    )}
                    {cust.email && (
                      <a href={`mailto:${cust.email}`}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors min-w-0">
                        <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </a>
                    )}
                    {cust.gstNumber && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          <Highlight text={cust.gstNumber} query={searchQuery} />
                        </span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            DESKTOP  (lg+) — full table, no scroll needed
        ═══════════════════════════════════════════════ */}
        {filteredCustomers.length > 0 && (
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-100 dark:border-gray-700">
                  <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GST Number</th>
                  <th className="py-3.5 px-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider xl:table-cell hidden">Address</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-100 group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={cust.name} />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[180px]">
                            <Highlight text={cust.name} query={searchQuery} />
                          </p>
                          {cust.companyName && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <Highlight text={cust.companyName} query={searchQuery} />
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cust.phone
                        ? <a href={`tel:${cust.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <Highlight text={cust.phone} query={searchQuery} />
                          </a>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                    <td className="py-3.5 px-4">
                      {cust.email
                        ? <a href={`mailto:${cust.email}`}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px] block">
                            {cust.email}
                          </a>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                    <td className="py-3.5 px-4">
                      {cust.gstNumber
                        ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 font-mono">
                            <FileText className="w-3 h-3 flex-shrink-0" />
                            <Highlight text={cust.gstNumber} query={searchQuery} />
                          </span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                    <td className="py-3.5 px-4 xl:table-cell hidden">
                      {cust.address
                        ? <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5 max-w-[180px]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{cust.address}</span>
                          </span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(cust)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cust._id)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} shown
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Customers;