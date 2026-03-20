// Bill.jsx
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// import logoImage from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Download,
  Trash2,
  Edit,
  X,
  Search,
  Mail,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import axios from "../utils/axiosConfig";
import { loadCompanyProfile } from "../utils/companyProfile";

// ── UI Components ──────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 pt-6 pb-4 border-b border-gray-50 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-bold tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

function Button({
  children,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl";
  const variants = {
    default:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg focus:ring-indigo-400",
    outline:
      "border-2 border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-600 focus:ring-indigo-400",
    destructive:
      "bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white focus:ring-red-400",
    ghost:
      "text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:ring-gray-300",
    gradient:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg focus:ring-indigo-400",
  };
  const sizes = {
    default: "px-5 py-2.5 text-sm gap-2",
    sm: "px-3.5 py-2 text-xs gap-1.5",
    icon: "p-2.5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  className = "",
  type = "text",
  min,
  disabled = false,
  label,
}) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all ${className}`}
      />
    </div>
  );
}

function Select({ children, value, onValueChange, label }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function InvoiceGenerator() {
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    sourceOrderId: "",
    client: "",
    status: "pending",
    materials: [{ name: "", quantity: 1, rate: 0 }],
  });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(null);
  const [showCriticalPopup, setShowCriticalPopup] = useState(false);
  const [criticalPopupItems, setCriticalPopupItems] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Helper: format any date/string to IST human-friendly string
  const formatToIST = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
        timeZoneName: "short",
      });
    } catch (e) {
      return String(value);
    }
  };

  // Helper: format date+time for PDF header (compact, with IST)
  const formatToISTDateTimeForPDF = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      const datePart = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
      const timePart = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
      return `${datePart} ${timePart} IST`;
    } catch (e) {
      return String(value);
    }
  };

  // Normalize a single invoice object for UI use
  const normalizeInvoice = (inv) => {
    const dateRaw = inv.dateRaw || inv.date || inv.dateIssued || inv.createdAt || new Date().toISOString();
    const localMaterials = materials || [];
    const mats = (inv.materials || []).map((it) => {
      const populatedName = it.name || (it.material && (it.material.name || it.material.materialName));
      const lookupName = localMaterials.find((m) => String(m._id) === String(it.material))?.name;
      return {
        ...it,
        name: populatedName || lookupName || "",
      };
    });
    return {
      ...inv,
      client: inv.client || (inv.customer && inv.customer.name) || "",
      clientEmail: inv.clientEmail || (inv.customer && inv.customer.email) || "",
      clientPhone: inv.clientPhone || (inv.customer && inv.customer.phone) || "",
      clientAddress: inv.clientAddress || (inv.customer && inv.customer.address) || "",
      dateRaw,
      date: formatToIST(dateRaw),
      materials: mats,
    };
  };

  const fetchCustomers = async () => {
    console.log("Bill.jsx: fetching customers...");
    try {
      const res = await axios.get('/api/customers');
      console.log("Bill.jsx: customers fetched", res.data?.length);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  const fetchMaterials = async () => {
    console.log("Bill.jsx: fetching materials...");
    try {
      const res = await axios.get('/api/materials');
      console.log("Bill.jsx: materials fetched", res.data?.length);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // One-time prefill when coming from Customers Orders -> Create Invoice
  useEffect(() => {
    const fromState = location?.state?.invoicePrefill;
    const fromStorageRaw = localStorage.getItem("invoicePrefillFromOrder");
    const fromStorage = fromStorageRaw ? JSON.parse(fromStorageRaw) : null;
    const prefill = fromState || fromStorage;

    if (!prefill || !showForm) {
      if (!prefill) return;
    }

    if (!prefill || customers.length === 0 || materials.length === 0) return;

    const selectedCustomer =
      customers.find((c) => String(c._id) === String(prefill.customerId)) ||
      customers.find((c) => String(c.name || "").toLowerCase() === String(prefill.client || "").toLowerCase());

    const selectedMaterial =
      materials.find((m) => String(m.name || "").toLowerCase() === String(prefill.materialName || "").toLowerCase());

    setForm((prev) => ({
      ...prev,
      id: null,
      sourceOrderId: prefill.sourceOrderId || "",
      customerId: selectedCustomer?._id || "",
      client: selectedCustomer?.name || prefill.client || "",
      status: prefill.status || "pending",
      materials: [
        {
          name: selectedMaterial?.name || prefill.materialName || "",
          quantity: Number(prefill.quantity || 1),
          rate: prefill.rate ?? "",
        },
      ],
    }));
    setShowForm(true);

    localStorage.removeItem("invoicePrefillFromOrder");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state, customers, materials]);

  // If materials load after invoices, re-normalize invoice material names
  useEffect(() => {
    if (!materials || materials.length === 0) return;
    if (!invoices || invoices.length === 0) return;
    setInvoices((prev) =>
      (prev || []).map((inv) => ({
        ...inv,
        materials: (inv.materials || []).map((it) => ({
          ...it,
          name: it.name || (it.material && (it.material.name || it.material.materialName)) || materials.find((m) => String(m._id) === String(it.material))?.name || "",
        })),
      })),
    );
  }, [materials]);

const fetchInvoices = async () => {
  console.log("Bill.jsx: fetching invoices...");
  try {
    const res = await axios.get('/api/invoices');
    console.log("Bill.jsx: invoices fetched", res.data?.length);

    // Normalize invoices so UI can rely on `client` and material `name`
    const localMaterials = materials || [];

    const normalized = (res.data || []).map((inv) => {
      const dateRaw =
        inv.date ||
        inv.dateIssued ||
        inv.createdAt ||
        new Date().toISOString();

      return {
        ...inv,
        client: inv.client || (inv.customer && inv.customer.name) || "",
        clientEmail: inv.clientEmail || (inv.customer && inv.customer.email) || "",
        clientPhone: inv.clientPhone || (inv.customer && inv.customer.phone) || "",
        clientAddress: inv.clientAddress || (inv.customer && inv.customer.address) || "",

        // store raw date and formatted display date
        dateRaw,
        date: formatToIST(dateRaw),

        materials: (inv.materials || []).map((it) => {
          // Try several fallbacks: explicit name, populated material.name, lookup by id in local materials
          const populatedName =
            it.name ||
            (it.material && (it.material.name || it.material.materialName));

          const lookupName = localMaterials.find(
            (m) => String(m._id) === String(it.material)
          )?.name;

          return {
            ...it,
            name: populatedName || lookupName || "",
          };
        }),
      };
    });

    setInvoices(normalized);
  } catch (err) {
    console.error("Error fetching invoices:", err);
  }
};

  useEffect(() => {
    console.log("Bill.jsx mounted");
    fetchInvoices();
  }, []);

  const totalAmount = form.materials.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0,
  );

  const addMaterial = () =>
    setForm({
      ...form,
      materials: [...form.materials, { name: "", quantity: 1, rate: 0 }],
    });
  const removeMaterial = (index) => {
    if (form.materials.length > 1)
      setForm({
        ...form,
        materials: form.materials.filter((_, i) => i !== index),
      });
  };
  const updateMaterial = (index, field, value) => {
    const updated = [...form.materials];
    updated[index][field] = field === "name" ? value : Number(value) || 0;
    setForm({ ...form, materials: updated });
  };

  const isFormValid = () => {
    if (!form.customerId) return false;
    if (form.materials.length === 0) return false;
    return form.materials.every(
      (m) => m.name.trim() && m.quantity > 0 && m.rate >= 0,
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert("Please fill in all required fields correctly");
      return;
    }
    try {
      for (const material of form.materials) {
        if (material.name && material.quantity > 0) {
          const inventoryResponse = await axios.get('/api/materials');
          const inventoryMaterial = inventoryResponse.data.find(
            (m) => m.name.toLowerCase() === material.name.toLowerCase(),
          );
          if (inventoryMaterial) {
            const nextQty = Math.max(0, inventoryMaterial.quantity - material.quantity);
            await axios.put(
              `/api/materials/${inventoryMaterial._id}`,
              {
                ...inventoryMaterial,
                quantity: nextQty,
                lastUpdated: new Date().toISOString().split("T")[0],
              },
            );
          }
        }
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Failed to update inventory.");
      return;
    }

    const invoiceData = {
      ...form,
      amount: totalAmount,
      // store full ISO timestamp so server saves the exact time (not midnight)
      date: new Date().toISOString(),
    };
    try {
      let res;
      if (form.id) {
        res = await axios.put(
          `/api/invoices/${form.id}`,
          invoiceData,
        );
        const normalized = normalizeInvoice(res.data);
        setInvoices((prev) => prev.map((inv) => (inv._id === form.id ? normalized : inv)));
      } else {
        res = await axios.post('/api/invoices', invoiceData);
        const normalized = normalizeInvoice(res.data);
        setInvoices((prev) => [...(prev || []), normalized]);
      }

      // Check if response includes lowStockAlerts (indicates threshold crossing)
      const lowStockAlerts = res.data.lowStockAlerts || [];

      // Broadcast inventory/dashboard refresh so Overview/Inventory can update instantly.
      window.dispatchEvent(new Event("dashboard:refresh"));
      window.dispatchEvent(new CustomEvent("inventory:updated", { detail: { criticalAlerts: lowStockAlerts } }));

      if (lowStockAlerts.length > 0) {
        setCriticalPopupItems(lowStockAlerts);
        setShowCriticalPopup(true);

        const key = "appNotifications";
        const existing = (() => {
          try {
            return JSON.parse(localStorage.getItem(key) || "[]");
          } catch (e) {
            return [];
          }
        })();

        const entries = lowStockAlerts.map((a) => ({
          id: `low-stock-${Date.now()}-${a.material}`,
          type: "low-stock",
          title: "Critical Low Stock Alert",
          message: `${a.material} is low (${a.quantity} left, min ${a.minStock})`,
          createdAt: new Date().toISOString(),
        }));

        localStorage.setItem(key, JSON.stringify([...entries, ...existing].slice(0, 30)));
      }
    } catch (err) {
      console.error("Error saving invoice:", err.response?.data || err.message);
      alert("Failed to save invoice.");
      return;
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({
      id: null,
      sourceOrderId: "",
      client: "",
      customerId: "",
      status: "pending",
      materials: [{ name: "", quantity: 1, rate: 0 }],
    });
    setShowForm(false);
  };
  const handleEdit = (invoice) => {
    console.log("Bill.jsx: edit invoice", invoice && invoice._id);
    setForm(invoice);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      await axios.delete(`/api/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Failed to delete invoice.");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === "all" || inv.status === filter;
    const clientName = (inv.client || (inv.customer && inv.customer.name) || "").toString();
    const matchesSearch = clientName.toLowerCase().includes((search || "").toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const loadImageAsDataURL = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (err) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
      if (img.complete)
        setTimeout(() => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (e) {
            resolve(null);
          }
        }, 50);
    });

  const createPdfDoc = (invoice) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth(); // 210
    const pageH = doc.internal.pageSize.getHeight(); // 297

    // ─── PALETTE ────────────────────────────────────────────
    const teal = [15, 76, 92]; // deep teal  #0f4c5c
    const tealMid = [22, 101, 122]; // mid teal   #16657a
    const saffron = [214, 120, 30]; // warm rust  #d6781e
    const offWhite = [250, 248, 244]; // warm paper
    const lightGray = [235, 232, 226]; // ruled line
    const charcoal = [38, 35, 32]; // body text
    const mutedText = [130, 122, 112]; // secondary
    const white = [255, 255, 255];
    const greenBadge = [42, 140, 90];
    const amberBadge = [200, 130, 20];
    const blueBadge = [50, 100, 180];

    // ─── PAPER BACKGROUND ───────────────────────────────────
    doc.setFillColor(...offWhite);
    doc.rect(0, 0, pageW, pageH, "F");

    // ─── HEADER BAND ────────────────────────────────────────
    doc.setFillColor(...teal);
    doc.rect(0, 0, pageW, 46, "F");

    // Diagonal accent slice inside header
    doc.setFillColor(...tealMid);
    doc.triangle(0, 0, 70, 0, 0, 46, "F");

    // ─── COMPANY WORDMARK (top-left) ────────────────────────
    // Logo is intentionally rendered as a text wordmark to avoid
    // white-box artefacts when PNG images have opaque backgrounds.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...white);
    doc.text("Vrindavan", 14, 19);

    // Saffron highlight on "Traders"
    doc.setTextColor(...saffron);
    doc.text("Traders", 14 + doc.getTextWidth("Vrindavan ") - 1, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 210, 218);
    doc.text("Warehouse No. 9, Happy Street, Ahmedabad - 380001", 14, 28);
    doc.text("vrindavantraders@email.com  |  +91 98765 43210", 14, 35);

    // ─── INVOICE TITLE + NUMBER ─────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...white);
    const titleX = pageW - 14;
    doc.text("INVOICE", titleX, 20, { align: "right" });

    const invNum = `#VT-${String(invoice.id || Date.now()).slice(-6)}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 210, 218);
    doc.text(invNum, titleX, 30, { align: "right" });

    const dateStr = formatToISTDateTimeForPDF(invoice.dateRaw || invoice.date || new Date().toISOString());
    doc.text(dateStr, titleX, 38, { align: "right" });

    // ─── SAFFRON ACCENT STRIPE ──────────────────────────────
    doc.setFillColor(...saffron);
    doc.rect(0, 46, pageW, 3, "F");

    // ─── BILL TO / DETAILS SECTION ──────────────────────────
    const secY = 58;

    // Bill To card
    doc.setFillColor(...white);
    doc.roundedRect(14, secY, 86, 48, 3, 3, "F");
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, secY, 86, 48, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...saffron);
    doc.text("BILL TO", 20, secY + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...charcoal);
    const clientDisplay = invoice.client || (invoice.customer && invoice.customer.name) || "N/A";
    doc.text(clientDisplay, 20, secY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    // Use customer address/email/phone when available
    const addrLines = [];
    if (invoice.clientAddress) {
      addrLines.push(...invoice.clientAddress.split(/\r?\n|,\s*/));
    } else if (invoice.customer && invoice.customer.address) {
      addrLines.push(...String(invoice.customer.address).split(/\r?\n|,\s*/));
    } else {
      addrLines.push("Warehouse No. 25,", "Happy Street,", "Ahmedabad - 380004");
    }
    // contact lines
    if (invoice.clientEmail || (invoice.customer && invoice.customer.email)) {
      addrLines.push(invoice.clientEmail || invoice.customer.email);
    }
    if (invoice.clientPhone || (invoice.customer && invoice.customer.phone)) {
      addrLines.push(invoice.clientPhone || invoice.customer.phone);
    }

    doc.text(addrLines, 20, secY + 26);

    // Invoice details card — tall enough for 3 rows + a separate badge row
    const detailCardH = 66;
    doc.setFillColor(...white);
    doc.roundedRect(pageW - 100, secY, 86, detailCardH, 3, 3, "F");
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.4);
    doc.roundedRect(pageW - 100, secY, 86, detailCardH, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...saffron);
    doc.text("INVOICE DETAILS", pageW - 94, secY + 9);

    const status = (invoice.status || "pending").toUpperCase();
    const statusColor =
      invoice.status === "paid"
        ? greenBadge
        : invoice.status === "completed"
          ? blueBadge
          : amberBadge;

    const detailRows = [
      ["Invoice No.", invNum],
      ["Date Issued", dateStr],
      ["Due Date", getDueDate30()],
    ];

    // 3 rows, each 11mm apart, starting at secY+18
    detailRows.forEach(([label, value], i) => {
      const rowY = secY + 18 + i * 11;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...mutedText);
      doc.text(label, pageW - 94, rowY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...charcoal);
      doc.text(value, pageW - 17, rowY, { align: "right" });
    });

    // Thin divider above badge
    const dividerY = secY + detailCardH - 16;
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(pageW - 94, dividerY, pageW - 17, dividerY);

    // Status badge — sits 4mm below divider, right-aligned, never overlaps rows
    const badgeY = dividerY + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const badgeW = doc.getTextWidth(status) + 14;
    doc.setFillColor(...statusColor);
    doc.roundedRect(
      pageW - 17 - badgeW,
      badgeY - 5.5,
      badgeW,
      9,
      4.5,
      4.5,
      "F",
    );
    doc.setTextColor(...white);
    doc.text(status, pageW - 17 - badgeW / 2, badgeY, { align: "center" });

    // ─── MATERIALS TABLE ────────────────────────────────────
    const tableY = secY + detailCardH + 10;

    const amount =
      typeof invoice.amount === "number"
        ? invoice.amount
        : (invoice.materials || []).reduce(
            (acc, it) => acc + (it.quantity || 0) * (it.rate || 0),
            0,
          );

    const tableData = (invoice.materials || []).map((item, i) => {
      const populatedName = item.name || (item.material && (item.material.name || item.material.materialName));
      const lookupName = materials.find((m) => String(m._id) === String(item.material))?.name;
      const name = populatedName || lookupName || "—";
      return [
        i + 1,
        name,
        item.quantity ?? 0,
        `₹${(item.rate ?? 0).toLocaleString("en-IN")}`,
        `₹${((item.quantity ?? 0) * (item.rate ?? 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ];
    });

    autoTable(doc, {
      startY: tableY,
      margin: { left: 14, right: 14 },
      head: [["#", "Material / Description", "Qty", "Rate", "Amount"]],
      body:
        tableData.length > 0 ? tableData : [["—", "No items", "—", "—", "—"]],
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 9.5,
        textColor: charcoal,
        cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
      },
      headStyles: {
        fillColor: teal,
        textColor: white,
        fontStyle: "bold",
        fontSize: 8.5,
        cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
      },
      alternateRowStyles: {
        fillColor: [244, 242, 238],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 36, halign: "right", fontStyle: "bold" },
      },
      tableLineColor: lightGray,
      tableLineWidth: 0.3,
    });

    // ─── TOTALS BLOCK ───────────────────────────────────────
    const afterTable = doc.lastAutoTable.finalY + 8;
    const totX = pageW - 14 - 80;

    const subtotal = amount;
    const gst = +(subtotal * 0.18).toFixed(2);
    const total = +(subtotal + gst).toFixed(2);

    // Subtotal row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text("Subtotal", totX, afterTable + 5);
    doc.setTextColor(...charcoal);
    doc.text(
      `₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      pageW - 14,
      afterTable + 5,
      { align: "right" },
    );

    // GST row
    doc.setTextColor(...mutedText);
    doc.text("GST (18%)", totX, afterTable + 14);
    doc.setTextColor(...charcoal);
    doc.text(
      `₹${gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      pageW - 14,
      afterTable + 14,
      { align: "right" },
    );

    // Divider line
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.4);
    doc.line(totX, afterTable + 18, pageW - 14, afterTable + 18);

    // TOTAL highlight row
    doc.setFillColor(...saffron);
    doc.roundedRect(totX, afterTable + 20, pageW - 14 - totX, 13, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...white);
    doc.text("TOTAL DUE", totX + 5, afterTable + 29);
    doc.text(
      `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      pageW - 14 - 4,
      afterTable + 29,
      { align: "right" },
    );

    // ─── DIVIDER BEFORE FOOTER ──────────────────────────────
    const footerTop = pageH - 28;
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.line(14, footerTop, pageW - 14, footerTop);

    // ─── SAFFRON LEFT ACCENT ────────────────────────────────
    doc.setFillColor(...saffron);
    doc.rect(14, footerTop + 2, 2, 16, "F");

    // ─── FOOTER TEXT ────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...teal);
    doc.text("Thank you for your business!", 20, footerTop + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text(
      "Payment due within 30 days. For queries: vrindavantraders@email.com",
      20,
      footerTop + 18,
    );

    // Page number
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    const pgTxt = "Page 1 of 1";
    doc.text(pgTxt, pageW - 14, footerTop + 10, { align: "right" });

    return doc;
  };

  // helper – 30-day due date
  function getDueDate30() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const generatePDFAndDownload = async (invoice) => {
    setGeneratingPDF(invoice._id);
    try {
      const companyProfile = loadCompanyProfile();
      // request backend-generated PDF
      const resp = await axios.post(`/api/invoices/${invoice._id}/pdf`, {
        companyProfile,
      }, {
        responseType: "blob",
      });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber || invoice._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  // Keep old generatePDF as alias
  const generatePDF = generatePDFAndDownload;

  const sendEmail = async (invoice) => {
    setIsSendingEmail(invoice._id);
    try {
      const companyProfile = loadCompanyProfile();
      // Call server endpoint that generates PDF and sends email using invoice's registered email
      await axios.post(`/api/email/send-bill/invoice/${invoice._id}`, { companyProfile });
      alert(`Invoice emailed to ${invoice.clientEmail || (invoice.customer && invoice.customer.email) || 'customer'}`);
    } catch (error) {
      console.error("Failed to send invoice via server:", error);
      // Show server-provided message and underlying error when available (temporary, for debugging)
      const serverMessage = error.response?.data?.message;
      const serverError = error.response?.data?.error;
      const msg = serverError ? `${serverMessage || 'Failed to send invoice'}: ${serverError}` : serverMessage || error.message || 'Failed to send invoice.';
      alert(msg);
    } finally {
      setIsSendingEmail(null);
    }
  };

  // Stats
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      {/* Top nav bar accent */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Invoice Generator
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Vrindavan Traders · Ahmedabad
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="text-sm"
          >
            {showForm ? (
              <>
                <X size={16} /> Cancel
              </>
            ) : (
              <>
                <Plus size={16} /> New Invoice
              </>
            )}
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={FileText}
            label="Total"
            value={invoices.length}
            color="indigo"
          />
          <StatCard
            icon={CheckCircle}
            label="Paid"
            value={paidCount}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            color="purple"
          />
        </div>

        {/* ── Invoice Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">
                    {form.id ? "✏️ Edit Invoice" : "🧾 Create Invoice"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-6">
                  {/* Client & Status row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Select Customer *"
                      value={form.customerId}
                      onValueChange={(val) => {
                        const selectedCustomer = customers.find(
                          (c) => c._id === val,
                        );
                        setForm({
                          ...form,
                          customerId: val,
                          client: selectedCustomer?.name || "",
                        });
                      }}
                    >
                      <SelectItem value="">Select Customer</SelectItem>
                      {customers.map((cust) => (
                        <SelectItem key={cust._id} value={cust._id}>
                          {cust.name}{" "}
                          {cust.companyName ? `(${cust.companyName})` : ""}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Status"
                      value={form.status}
                      onValueChange={(val) => setForm({ ...form, status: val })}
                    >
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="paid">✅ Paid</SelectItem>
                    </Select>
                  </div>

                  {/* Materials */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Materials *
                      </label>
                      <Button onClick={addMaterial} size="sm" variant="outline">
                        <Plus size={14} /> Add Row
                      </Button>
                    </div>

                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-3 mb-1">
                      {["Material", "Qty", "Rate (₹)", ""].map((h, i) => (
                        <span
                          key={i}
                          className={`text-xs font-semibold text-gray-400 uppercase tracking-wide ${i === 0 ? "col-span-5" : i === 3 ? "col-span-1" : "col-span-3"}`}
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {form.materials.map((material, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                            className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            {/* Material select */}
                            <div className="col-span-12 sm:col-span-5">
                              <label className="block text-xs font-medium text-gray-400 mb-1 sm:hidden">
                                Material
                              </label>
                              <select
                                value={material.name}
                                onChange={(e) =>
                                  updateMaterial(index, "name", e.target.value)
                                }
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-900 text-sm"
                              >
                                <option value="">Select Material</option>
                                {materials.map((m) => (
                                  <option key={m._id} value={m.name}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Qty */}
                            <div className="col-span-5 sm:col-span-3">
                              <label className="block text-xs font-medium text-gray-400 mb-1 sm:hidden">
                                Qty
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={material.quantity}
                                onChange={(e) =>
                                  updateMaterial(
                                    index,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-900 text-sm"
                              />
                            </div>

                            {/* Rate */}
                            <div className="col-span-5 sm:col-span-3">
                              <label className="block text-xs font-medium text-gray-400 mb-1 sm:hidden">
                                Rate
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={material.rate}
                                onChange={(e) =>
                                  updateMaterial(index, "rate", e.target.value)
                                }
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-900 text-sm"
                              />
                            </div>

                            {/* Delete */}
                            <div className="col-span-2 sm:col-span-1 flex justify-end">
                              <button
                                onClick={() => removeMaterial(index)}
                                disabled={form.materials.length === 1}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    <span className="text-sm font-semibold text-gray-600">
                      Total Amount
                    </span>
                    <span className="text-2xl font-extrabold text-indigo-600">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      variant="gradient"
                      className="flex-1"
                      disabled={!isFormValid()}
                    >
                      {form.id ? "Update Invoice" : "Create Invoice"}
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filter & Search ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              placeholder="Search by client name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm shadow-sm"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
            {["all", "pending", "paid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filter === f ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Invoice List ── */}
        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <FileText size={28} className="text-indigo-400" />
              </div>
              <p className="text-gray-500 font-medium">No invoices found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first invoice to get started
              </p>
            </div>
          ) : (
            filteredInvoices.map((inv, idx) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                layout
              >
                <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 overflow-hidden">
                  {/* Status accent bar */}
                  <div
                    className={`h-0.5 ${inv.status === "paid" ? "bg-green-400" : "bg-amber-400"}`}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-5 py-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {inv.client}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            inv.status === "paid"
                              ? "bg-green-50 text-green-600 border border-green-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {inv.status === "paid" ? "✓" : "⏳"}{" "}
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-xl font-extrabold text-indigo-600">
                          ₹{inv.amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {inv.date} · {inv.materials.length} item{inv.materials.length !== 1 ? "s" : ""}
                          {inv.materials && inv.materials.length > 0 && (
                            <>
                              {' '}
                              · {inv.materials[0].name || (inv.materials[0].material && inv.materials[0].material.name) || materials.find((m) => String(m._id) === String(inv.materials[0].material))?.name || "—"}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Email */}
                      <button
                        onClick={() => sendEmail(inv)}
                        disabled={isSendingEmail === inv._id}
                        title="Send via Email"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40"
                      >
                        {isSendingEmail === inv._id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Mail size={15} />
                          </motion.div>
                        ) : (
                          <Mail size={15} />
                        )}
                      </button>

                      {/* Download */}
                      <button
                        onClick={() => generatePDFAndDownload(inv)}
                        disabled={generatingPDF === inv._id}
                        title="Download PDF"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40"
                      >
                        {generatingPDF === inv._id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Download size={15} />
                          </motion.div>
                        ) : (
                          <Download size={15} />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(inv)}
                        title="Edit Invoice"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all"
                      >
                        <Edit size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(inv._id)}
                        title="Delete Invoice"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {filteredInvoices.length > 0 && (
          <p className="text-center text-xs text-gray-300 pb-4">
            Showing {filteredInvoices.length} of {invoices.length} invoice
            {invoices.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

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
              {criticalPopupItems.map((m, idx) => (
                <div key={`${m.material}-${idx}`} className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{m.material}</span>: {m.quantity} left (min {m.minStock})
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCriticalPopup(false)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold text-sm"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
