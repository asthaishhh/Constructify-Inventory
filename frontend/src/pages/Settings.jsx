import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Bell, Shield, Palette, Save, Eye, EyeOff,
  Building2, Upload, X, UserPlus, Sun, Moon,
  CheckCircle, Settings as SettingsIcon, ChevronRight,
} from "lucide-react";
import { loadCompanyProfile, saveCompanyProfile } from "../utils/companyProfile";

/* ── Toggle switch ─────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

/* ── Section heading ────────────────────────────────────────── */
const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

/* ── Labelled input ─────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border-2 border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-xl " +
  "bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 " +
  "dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "outline-none transition-all";

const disabledInputCls =
  "w-full border-2 border-gray-100 dark:border-gray-700 px-3 py-2.5 rounded-xl " +
  "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed";

/* ── Save button ────────────────────────────────────────────── */
const SaveBtn = ({ label = "Save Changes", icon: Icon = Save, loading, success }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all disabled:opacity-60"
  >
    {success ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
    {success ? "Saved!" : label}
  </button>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Settings() {
  const navigate = useNavigate();
  const companyFileRef = useRef(null);

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState("profile");

  /* ── Dark mode ── */
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else          document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  /* ── Profile state — seeded from localStorage after mount ── */
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", role: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);

      // Log the raw object so you can see exactly what keys your backend stores
      console.log("[Settings] localStorage user object:", u);

      // Broad fallbacks — covers all common backend field naming conventions
      const email =
        u.email        || u.emailAddress  || u.Email        ||
        u.emailId      || u.email_address || "";

      const name =
        u.name         || u.fullName      || u.full_name    ||
        u.username     || u.userName      || u.displayName  ||
        u.firstName    || u.first_name    || "";

      const phone =
        u.phone        || u.phoneNumber   || u.phone_number ||
        u.mobile       || u.mobileNumber  || u.contact      ||
        u.contactNo    || u.Phone         || "";

      const role =
        u.role         || u.userRole      || u.user_role    ||
        u.type         || u.userType      || "User";

      setProfile({ name, email, phone, role });
    } catch (err) {
      console.error("[Settings] Failed to parse localStorage user:", err);
    }
  }, []);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    try {
      const raw = localStorage.getItem("user");
      const existing = raw ? JSON.parse(raw) : {};
      // Write back using whatever key was originally used for name/phone
      const updated = { ...existing, name: profile.name, phone: profile.phone };
      localStorage.setItem("user", JSON.stringify(updated));
    } catch (err) {
      console.error("[Settings] Failed to save profile:", err);
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  /* ── Company profile ── */
  const [company, setCompany]                     = useState(() => loadCompanyProfile());
  const [companyLogoPreview, setCompanyLogoPreview] = useState(() => loadCompanyProfile().logo || "");
  const [companyLogoFileName, setCompanyLogoFileName] = useState("");
  const [companySaved, setCompanySaved]           = useState(false);

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg","image/jpg","image/png","image/gif","image/webp","image/svg+xml"];
    if (!allowed.includes(file.type)) { alert("Please upload a valid image (JPG, PNG, GIF, WebP or SVG)."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Image must be smaller than 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCompanyLogoPreview(dataUrl);
      setCompanyLogoFileName(file.name);
      setCompany((p) => ({ ...p, logo: dataUrl }));
      setCompanySaved(false);
    };
    reader.readAsDataURL(file);
  };

  const removeCompanyLogo = () => {
    setCompanyLogoPreview("");
    setCompanyLogoFileName("");
    setCompany((p) => ({ ...p, logo: "" }));
    if (companyFileRef.current) companyFileRef.current.value = "";
  };

  const handleCompanySave = (e) => {
    e.preventDefault();
    saveCompanyProfile(company);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  };

  /* ── Notifications ── */
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications:  false,
    orderUpdates:       true,
    inventoryAlerts:    true,
    weeklyReports:      false,
  });

  const notifLabels = {
    emailNotifications: { label: "Email Notifications",  desc: "Receive updates via email"           },
    pushNotifications:  { label: "Push Notifications",   desc: "Browser push notifications"          },
    orderUpdates:       { label: "Order Updates",         desc: "Status changes on orders"            },
    inventoryAlerts:    { label: "Inventory Alerts",      desc: "Low-stock and reorder warnings"      },
    weeklyReports:      { label: "Weekly Reports",        desc: "Summary digest every Monday morning" },
  };

  /* ── Account / password ── */
  const [showPassword, setShowPassword]         = useState(false);
  const [showNewPassword, setShowNewPassword]   = useState(false);
  const [accountSettings, setAccountSettings]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaved, setPasswordSaved]       = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      alert("New passwords do not match!"); return;
    }
    setPasswordSaved(true);
    setAccountSettings({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  /* ── Avatar initials ── */
  const initials = (profile.name || profile.email || "U")
    .trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

  /* ── Tabs config ── */
  const TABS = [
    { id: "profile",       label: "Profile",       icon: User    },
    { id: "appearance",    label: "Appearance",    icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell    },
    { id: "account",       label: "Security",      icon: Shield  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Page header ── */}
        <header className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Manage your account preferences
            </p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Sidebar nav ── */}
          <aside className="lg:w-56 flex-shrink-0">
            {/* Mobile: horizontal scrollable tab bar */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                    activeTab === id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical sidebar */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-2">
              {/* User pill */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.name || "User"}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{profile.email}</p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </span>
                    {activeTab === id && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Content panel ── */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">

              {/* ══════════════ PROFILE TAB ══════════════ */}
              {activeTab === "profile" && (
                <div className="space-y-8">

                  {/* Personal profile */}
                  <section>
                    <SectionTitle icon={User} title="Profile Information" subtitle="Your personal account details" />

                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name">
                          <input
                            type="text" value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="Your full name" className={inputCls}
                          />
                        </Field>
                        <Field label="Email Address">
                          <input
                            type="email" value={profile.email}
                            disabled
                            title="Email is tied to your login and cannot be changed here"
                            className={disabledInputCls}
                          />
                        </Field>
                        <Field label="Phone Number">
                          <input
                            type="tel" value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+91 9876543210" className={inputCls}
                          />
                        </Field>
                        <Field label="Role">
                          <input
                            type="text" value={profile.role}
                            disabled className={disabledInputCls}
                          />
                        </Field>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {profileSaved && (
                          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-semibold">
                            <CheckCircle className="w-4 h-4" /> Profile saved!
                          </span>
                        )}
                        <div className="ml-auto">
                          <SaveBtn label="Save Profile" success={profileSaved} />
                        </div>
                      </div>
                    </form>
                  </section>

                  <div className="border-t border-gray-100 dark:border-gray-700" />

                  {/* Company profile */}
                  <section>
                    <SectionTitle icon={Building2} title="Company Profile" subtitle="Details used on invoices and documents" />

                    <form onSubmit={handleCompanySave} className="space-y-4">
                      {/* Logo uploader */}
                      <Field label="Company Logo">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
                            {companyLogoPreview
                              ? <img src={companyLogoPreview} alt="Logo" className="w-full h-full object-contain" />
                              : <Building2 className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                            }
                          </div>
                          <div className="flex-1 space-y-2">
                            <button
                              type="button"
                              onClick={() => companyFileRef.current?.click()}
                              className="flex items-center gap-2 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {companyLogoPreview ? "Change Logo" : "Upload Logo"}
                            </button>
                            {(companyLogoFileName || companyLogoPreview) && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
                                  {companyLogoFileName || "Current logo"}
                                </span>
                                <button type="button" onClick={removeCompanyLogo}
                                  className="text-red-400 hover:text-red-600 transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, GIF, WebP or SVG · max 2 MB</p>
                          </div>
                        </div>
                        <input
                          ref={companyFileRef} type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                          onChange={handleCompanyLogoChange} className="hidden"
                        />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Company Name">
                          <input
                            type="text" value={company.companyName || ""}
                            placeholder="Constructify Pvt. Ltd."
                            onChange={(e) => { setCompany((p) => ({ ...p, companyName: e.target.value })); setCompanySaved(false); }}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Owner Name">
                          <input
                            type="text" value={company.ownerName || ""}
                            placeholder="Rajesh Sharma"
                            onChange={(e) => { setCompany((p) => ({ ...p, ownerName: e.target.value })); setCompanySaved(false); }}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="GST IN">
                          <input
                            type="text" value={company.gstIn || ""}
                            placeholder="22AAAAA0000A1Z5"
                            onChange={(e) => { setCompany((p) => ({ ...p, gstIn: e.target.value.toUpperCase() })); setCompanySaved(false); }}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Phone">
                          <input
                            type="tel" value={company.phone || ""}
                            placeholder="+91 9876543210"
                            onChange={(e) => { setCompany((p) => ({ ...p, phone: e.target.value })); setCompanySaved(false); }}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Email">
                          <input
                            type="email" value={company.email || ""}
                            placeholder="company@example.com"
                            onChange={(e) => { setCompany((p) => ({ ...p, email: e.target.value })); setCompanySaved(false); }}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <Field label="Address">
                        <textarea
                          rows={3}
                          value={company.address || ""}
                          placeholder="Street, City, State, PIN"
                          onChange={(e) => { setCompany((p) => ({ ...p, address: e.target.value })); setCompanySaved(false); }}
                          className={`${inputCls} resize-none`}
                        />
                      </Field>

                      <div className="flex items-center justify-between pt-2">
                        {companySaved && (
                          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-semibold">
                            <CheckCircle className="w-4 h-4" /> Company saved!
                          </span>
                        )}
                        <div className="ml-auto">
                          <SaveBtn label="Save Company" success={companySaved} />
                        </div>
                      </div>
                    </form>
                  </section>

                  <div className="border-t border-gray-100 dark:border-gray-700" />

                  {/* User management */}
                  <section>
                    <SectionTitle icon={UserPlus} title="User Management" subtitle="Create new accounts for your team" />
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create New User
                    </button>
                  </section>
                </div>
              )}

              {/* ══════════════ APPEARANCE TAB ══════════════ */}
              {activeTab === "appearance" && (
                <div>
                  <SectionTitle icon={Palette} title="Appearance" subtitle="Customise how the app looks" />
                  <div className="space-y-3">
                    {/* Light / Dark toggle row */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${darkMode ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}>
                          {darkMode
                            ? <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            : <Sun  className="w-5 h-5 text-amber-500" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {darkMode ? "Dark Mode" : "Light Mode"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {darkMode ? "Using dark color scheme" : "Using light color scheme"}
                          </p>
                        </div>
                      </div>
                      <Toggle checked={darkMode} onChange={() => setDarkMode((d) => !d)} />
                    </div>

                    {/* Theme preview chips */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          !darkMode ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">Light</p>
                          <p className="text-xs text-gray-400">Clean & bright</p>
                        </div>
                        {!darkMode && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto flex-shrink-0" />}
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          darkMode ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 shadow-sm flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">Dark</p>
                          <p className="text-xs text-gray-400">Easy on eyes</p>
                        </div>
                        {darkMode && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto flex-shrink-0" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════ NOTIFICATIONS TAB ══════════════ */}
              {activeTab === "notifications" && (
                <div>
                  <SectionTitle icon={Bell} title="Notification Preferences" subtitle="Choose what you want to be notified about" />
                  <div className="space-y-2.5">
                    {Object.entries(notifications).map(([key, value]) => {
                      const { label, desc } = notifLabels[key] || { label: key, desc: "" };
                      return (
                        <div key={key}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                          <div className="min-w-0 pr-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                          </div>
                          <Toggle
                            checked={value}
                            onChange={() => setNotifications((p) => ({ ...p, [key]: !p[key] }))}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════ ACCOUNT / SECURITY TAB ══════════════ */}
              {activeTab === "account" && (
                <div>
                  <SectionTitle icon={Shield} title="Account Security" subtitle="Update your password" />

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Field label="Current Password">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={accountSettings.currentPassword}
                          onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className={`${inputCls} pr-11`}
                        />
                        <button type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="New Password">
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={accountSettings.newPassword}
                            onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                            placeholder="New password"
                            className={`${inputCls} pr-11`}
                          />
                          <button type="button"
                            onClick={() => setShowNewPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>
                      <Field label="Confirm New Password">
                        <input
                          type="password"
                          value={accountSettings.confirmPassword}
                          onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    {/* Password strength hint */}
                    {accountSettings.newPassword && (
                      <div className="flex items-center gap-2 text-xs">
                        {(() => {
                          const p = accountSettings.newPassword;
                          const strong = p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);
                          const medium = p.length >= 6;
                          return strong
                            ? <><span className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-8 h-1.5 rounded-full bg-green-500"/>)}</span><span className="text-green-600 font-semibold">Strong</span></>
                            : medium
                            ? <><span className="flex gap-1">{[0,1].map(i=><span key={i} className="w-8 h-1.5 rounded-full bg-amber-400"/>)}<span className="w-8 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"/></span><span className="text-amber-500 font-semibold">Medium</span></>
                            : <><span className="flex gap-1"><span className="w-8 h-1.5 rounded-full bg-red-400"/>{[0,1].map(i=><span key={i} className="w-8 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"/>)}</span><span className="text-red-500 font-semibold">Weak</span></>;
                        })()}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      {passwordSaved && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-semibold">
                          <CheckCircle className="w-4 h-4" /> Password changed!
                        </span>
                      )}
                      <div className="ml-auto">
                        <SaveBtn label="Change Password" icon={Shield} success={passwordSaved} />
                      </div>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}