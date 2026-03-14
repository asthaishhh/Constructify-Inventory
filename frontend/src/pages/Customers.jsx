import React, { useEffect, useState } from "react";
import customersApi from "../api/customers.api";

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
  ink:        "#1a1a2e",
  teal:       "#0f4c5c",
  tealMid:    "#1a6778",
  tealLt:     "#e8f4f7",
  tealBorder: "#c5dfe7",
  saffron:    "#d6781e",
  saffronLt:  "#fff4eb",
  saffronB:   "#f0d4b0",
  muted:      "#6b7280",
  rule:       "#e5e7eb",
  bg:         "#f4f1ec",
  white:      "#ffffff",
  red:        "#dc2626",
  redLt:      "#fef2f2",
};

/* ─── Styles ─────────────────────────────────────────────────── */
const css = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    fontFamily: "'DM Sans', sans-serif",
    color: T.ink,
    padding: "32px 28px",
  },

  /* Page header */
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: `1px solid ${T.rule}`,
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 30,
    fontWeight: 800,
    color: T.teal,
    letterSpacing: "-0.5px",
    lineHeight: 1,
    margin: 0,
  },
  pageTitleAccent: { color: T.saffron },
  pageSubtitle: {
    fontSize: 12,
    color: T.muted,
    marginTop: 5,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontWeight: 500,
  },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: T.teal,
    color: T.white,
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.5px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* ── Search bar ── */
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  searchWrap: (focused) => ({
    display: "flex",
    alignItems: "center",
    flex: 1,
    background: T.white,
    border: `1.5px solid ${focused ? T.teal : T.rule}`,
    borderRadius: 9,
    overflow: "hidden",
    boxShadow: focused ? `0 0 0 3px ${T.tealLt}` : "0 1px 6px rgba(15,76,92,0.06)",
    transition: "border-color 0.15s, box-shadow 0.15s",
  }),
  searchIconWrap: {
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    color: T.muted,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 0",
    fontSize: 13,
    color: T.ink,
    fontFamily: "'DM Sans', sans-serif",
    background: "transparent",
  },
  searchClearBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: T.muted,
    fontSize: 16,
    borderRadius: "50%",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
    marginRight: 4,
  },
  searchMeta: {
    fontSize: 11,
    color: T.muted,
    marginBottom: 16,
    paddingLeft: 2,
  },
  searchMetaCount: {
    fontWeight: 600,
    color: T.teal,
  },
  noResults: {
    textAlign: "center",
    padding: "40px 24px",
    color: T.muted,
    fontSize: 13,
  },

  /* Form card */
  formCard: {
    background: T.white,
    border: `1px solid ${T.rule}`,
    borderRadius: 12,
    padding: "22px 24px",
    marginBottom: 24,
    boxShadow: "0 2px 16px rgba(15,76,92,0.07)",
  },
  formCardTitle: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: T.saffron,
    marginBottom: 16,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px 16px",
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: T.muted,
  },
  input: (focused) => ({
    border: `1px solid ${focused ? T.teal : T.rule}`,
    borderRadius: 7,
    padding: "8px 11px",
    fontSize: 12,
    color: T.ink,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: T.white,
    boxShadow: focused ? `0 0 0 3px ${T.tealLt}` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    width: "100%",
    boxSizing: "border-box",
  }),
  formActions: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    paddingTop: 16,
    borderTop: `1px solid ${T.rule}`,
  },
  submitBtn: {
    background: T.teal,
    color: T.white,
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  cancelBtn: {
    background: T.white,
    color: T.muted,
    border: `1px solid ${T.rule}`,
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Error */
  errorBar: {
    background: T.redLt,
    border: `1px solid #fca5a5`,
    borderLeft: `3px solid ${T.red}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: T.red,
    marginBottom: 20,
  },

  /* Table card */
  tableCard: {
    background: T.white,
    border: `1px solid ${T.rule}`,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 16px rgba(15,76,92,0.07)",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  thead: { background: T.teal },
  th: {
    color: T.white,
    fontWeight: 500,
    fontSize: 9,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    padding: "11px 14px",
    textAlign: "left",
    whiteSpace: "nowrap",
    fontFamily: "'DM Sans', sans-serif",
  },
  tdBase: {
    padding: "11px 14px",
    borderBottom: `1px solid ${T.rule}`,
    color: T.ink,
    verticalAlign: "middle",
    fontSize: 12,
  },
  tdMuted: {
    padding: "11px 14px",
    borderBottom: `1px solid ${T.rule}`,
    color: T.muted,
    verticalAlign: "middle",
    fontSize: 12,
  },
  nameWrap: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: T.tealLt,
    border: `1px solid ${T.tealBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: T.teal,
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  namePrimary: { fontWeight: 600, color: T.ink, fontSize: 12 },
  nameCompany: { fontSize: 10, color: T.muted, marginTop: 1 },
  gstBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: T.tealLt,
    border: `1px solid ${T.tealBorder}`,
    borderRadius: 4,
    padding: "2px 7px",
    fontSize: 10,
    fontWeight: 600,
    color: T.teal,
    letterSpacing: "0.3px",
    fontFamily: "'DM Sans', monospace",
  },
  actionCell: {
    padding: "11px 14px",
    borderBottom: `1px solid ${T.rule}`,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    textAlign: "right",
  },
  editBtn: {
    background: T.tealLt,
    color: T.teal,
    border: `1px solid ${T.tealBorder}`,
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginRight: 6,
  },
  deleteBtn: {
    background: T.redLt,
    color: T.red,
    border: "1px solid #fca5a5",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    color: T.muted,
    fontSize: 13,
  },
  emptyIcon: { fontSize: 32, marginBottom: 10, opacity: 0.4 },
  countChip: {
    display: "inline-flex",
    alignItems: "center",
    background: T.saffronLt,
    border: `1px solid ${T.saffronB}`,
    borderRadius: 100,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: T.saffron,
    marginLeft: 10,
    verticalAlign: "middle",
  },
};

/* ─── Highlight matched text ─────────────────────────────────── */
const Highlight = ({ text = "", query = "" }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: T.saffronLt,
        color: T.saffron,
        borderRadius: 3,
        padding: "0 2px",
        fontWeight: 700,
      }}>
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
};

/* ─── Component ───────────────────────────────────────────────── */
const Customers = () => {
  const [customers, setCustomers]         = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [editingId, setEditingId]         = useState(null);
  const [focusedField, setFocusedField]   = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const emptyForm = { name: "", phone: "", email: "", address: "", companyName: "", gstNumber: "" };
  const [formData, setFormData] = useState(emptyForm);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  /* Filtered list — searches name + company */
  const q = searchQuery.trim().toLowerCase();
  const filteredCustomers = q
    ? customers.filter((c) =>
        (c.companyName || "").toLowerCase().includes(q) ||
        (c.name || "").toLowerCase().includes(q)
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

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(false);
  };

  const initials = (name = "") =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const fields = [
    { name: "name",        label: "Customer Name", type: "text",  required: true  },
    { name: "phone",       label: "Phone",         type: "text",  required: true  },
    { name: "email",       label: "Email",         type: "email", required: false },
    { name: "companyName", label: "Company Name",  type: "text",  required: false },
    { name: "gstNumber",   label: "GST Number",    type: "text",  required: false },
    { name: "address",     label: "Address",       type: "text",  required: false },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
        rel="stylesheet"
      />

      <div style={css.page}>

        {/* ── Page Header ── */}
        <div style={css.pageHeader}>
          <div>
            <h1 style={css.pageTitle}>
              Customer<span style={css.pageTitleAccent}>s</span>
              <span style={css.countChip}>{customers.length}</span>
            </h1>
            <div style={css.pageSubtitle}>Manage your client directory</div>
          </div>
          {!showForm && (
            <button
              style={css.addBtn}
              onClick={() => setShowForm(true)}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.tealMid)}
              onMouseLeave={(e) => (e.currentTarget.style.background = T.teal)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Customer
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && <div style={css.errorBar}>{error}</div>}

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div style={css.formCard}>
            <div style={css.formCardTitle}>
              {editingId ? "✎  Edit Customer" : "+ New Customer"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={css.formGrid}>
                {fields.map(({ name, label, type, required }) => (
                  <div key={name} style={css.fieldWrap}>
                    <label style={css.fieldLabel}>
                      {label}{required && <span style={{ color: T.saffron }}> *</span>}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      required={required}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      style={css.input(focusedField === name)}
                      onFocus={() => setFocusedField(name)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                ))}
              </div>
              <div style={css.formActions}>
                <button type="submit" style={css.submitBtn}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.tealMid)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = T.teal)}
                >
                  {editingId ? "Update Customer" : "Add Customer"}
                </button>
                <button type="button" style={css.cancelBtn} onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Search Bar ── */}
        <div style={css.searchRow}>
          <div style={css.searchWrap(searchFocused)}>
            <div style={css.searchIconWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by company or customer name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={css.searchInput}
            />
            {searchQuery && (
              <button
                style={css.searchClearBtn}
                onClick={() => setSearchQuery("")}
                title="Clear search"
                onMouseEnter={(e) => (e.currentTarget.style.color = T.ink)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Search result meta */}
        {q && (
          <div style={css.searchMeta}>
            <span style={css.searchMetaCount}>{filteredCustomers.length}</span>
            {" "}result{filteredCustomers.length !== 1 ? "s" : ""} for &ldquo;{searchQuery.trim()}&rdquo;
          </div>
        )}

        {/* ── Table Card ── */}
        <div style={css.tableCard}>
          {loading ? (
            <div style={css.emptyState}>
              <div style={css.emptyIcon}>⟳</div>
              Loading customers…
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={css.emptyState}>
              <div style={css.emptyIcon}>{q ? "🔍" : "👤"}</div>
              {q
                ? <>No customers match &ldquo;<strong>{searchQuery.trim()}</strong>&rdquo;</>
                : "No customers yet. Add your first one above."
              }
            </div>
          ) : (
            <div style={css.tableWrap}>
              <table style={css.table}>
                <thead style={css.thead}>
                  <tr>
                    <th style={css.th}>Customer</th>
                    <th style={css.th}>Phone</th>
                    <th style={css.th}>Email</th>
                    <th style={css.th}>GST Number</th>
                    <th style={css.th}>Address</th>
                    {isAdmin && <th style={{ ...css.th, textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((cust, i) => (
                    <tr
                      key={cust._id}
                      style={{ background: i % 2 === 0 ? T.white : "#fafafa" }}
                      onMouseEnter={(e) => {
                        Array.from(e.currentTarget.children).forEach(
                          (td) => (td.style.background = T.tealLt)
                        );
                      }}
                      onMouseLeave={(e) => {
                        Array.from(e.currentTarget.children).forEach(
                          (td) => (td.style.background = i % 2 === 0 ? T.white : "#fafafa")
                        );
                      }}
                    >
                      {/* Name + company with highlight */}
                      <td style={css.tdBase}>
                        <div style={css.nameWrap}>
                          <div style={css.avatar}>{initials(cust.name)}</div>
                          <div>
                            <div style={css.namePrimary}>
                              <Highlight text={cust.name} query={searchQuery} />
                            </div>
                            {cust.companyName && (
                              <div style={css.nameCompany}>
                                <Highlight text={cust.companyName} query={searchQuery} />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={css.tdMuted}>{cust.phone || "—"}</td>
                      <td style={css.tdMuted}>{cust.email || "—"}</td>

                      <td style={css.tdBase}>
                        {cust.gstNumber
                          ? <span style={css.gstBadge}>{cust.gstNumber}</span>
                          : <span style={{ color: T.rule }}>—</span>
                        }
                      </td>

                      <td style={css.tdMuted}>{cust.address || "—"}</td>

                      {isAdmin && (
                        <td style={css.actionCell}>
                          <button
                            style={css.editBtn}
                            onClick={() => handleEdit(cust)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = T.tealBorder)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = T.tealLt)}
                          >
                            Edit
                          </button>
                          <button
                            style={css.deleteBtn}
                            onClick={() => handleDelete(cust._id)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = T.redLt)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default Customers;