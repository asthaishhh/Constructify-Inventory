import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  X,
  Save,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadCompanyProfile, saveCompanyProfile } from "../utils/companyProfile";

/* ── Password strength ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-green-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

/* ── Defined OUTSIDE the component so React never treats it as a new type on re-render ── */
const InputWrapper = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Icon size={17} />
      </div>
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = (errors, key) =>
  `w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
   bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors
   ${errors[key] ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-600"}`;

const INITIAL_STATE = {
  companyName: "",
  companyTagline: "",
  logo: "",
  ownerName: "",
  gstIn: "",
  address: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterCompany() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_STATE);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Load existing profile on mount */
  useEffect(() => {
    const existing = loadCompanyProfile();
    const hasData = Object.values(existing).some((v) => v && v.length > 0);
    if (hasData) {
      setForm(existing);
      if (existing.logo) {
        setLogoPreview(existing.logo);
        setLogoFileName("Current logo");
      }
    }
  }, []);

  /* ── helpers ── */
  const field = (key) => ({
    value: form[key] ?? "",
    onChange: (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
      setSaved(false);
    },
  });

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        logo: "Please upload a valid image file (JPG, PNG, GIF, WebP or SVG).",
      }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Image must be smaller than 2 MB.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setLogoPreview(dataUrl);
      setForm((prev) => ({ ...prev, logo: dataUrl }));
      setLogoFileName(file.name);
      setErrors((prev) => ({ ...prev, logo: "" }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview("");
    setLogoFileName("");
    setForm((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaved(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = "Company name is required.";
    if (!form.ownerName.trim()) newErrors.ownerName = "Owner name is required.";
    if (!form.gstIn.trim()) {
      newErrors.gstIn = "GST IN is required.";
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(form.gstIn.trim())) {
      newErrors.gstIn = "Enter a valid GST IN.";
    }
    if (!form.address.trim()) newErrors.address = "Address is required.";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[+\d\s\-()]{7,20}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.password || String(form.password).length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Attempt signup on backend to create admin user (password will be hashed server-side)
    (async () => {
      setIsSubmitting(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
        const resp = await fetch(`${apiBase}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.ownerName,
            email: form.email,
            password: form.password,
            role: "admin",
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          // server-side validation error
          const message = data?.message || (data?.errors ? data.errors.join(", ") : "Signup failed");
          setErrors((prev) => ({ ...prev, form: message }));
          setIsSubmitting(false);
          return;
        }

        // Do NOT auto-login. Save company profile locally (without password)
        const { password: _p, confirmPassword: _c, ...profileToSave } = form;
        saveCompanyProfile(profileToSave);

        setSaved(true);
        setIsSubmitting(false);
        // Redirect to login so the user can sign in with the registered email/password
        setTimeout(() => {
          navigate("/login", { state: { email: form.email } });
        }, 800);
      } catch (err) {
        console.error(err);
        setErrors((prev) => ({ ...prev, form: "Network or server error during signup" }));
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Register Company
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-13">
            Fill in your company details. They will appear in Settings → Profile.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-md">
                {errors.form}
              </div>
            )}
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company Logo <span className="text-slate-400 font-normal">(optional)</span>
              </label>

              <div className="flex items-start gap-4">
                {/* Preview box */}
                <div className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 size={28} className="text-slate-300 dark:text-slate-500" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Upload size={15} />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </button>

                  {logoFileName && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {logoFileName}
                      </span>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Remove logo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    JPG, PNG, GIF, WebP or SVG · max 2 MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleLogoChange}
                className="hidden"
              />
              {errors.logo && (
                <p className="mt-1 text-xs text-red-500">{errors.logo}</p>
              )}
            </div>

            {/* Company Name */}
            <InputWrapper
              label="Company Name"
              icon={Building2}
              error={errors.companyName}
            >
              <input
                type="text"
                placeholder="e.g. Constructify Pvt. Ltd."
                autoComplete="organization"
                className={inputClass(errors, "companyName")}
                {...field("companyName")}
              />
            </InputWrapper>

            {/* Company Tagline */}
            <InputWrapper
              label="Company Tagline"
              icon={Building2}
              error={errors.companyTagline}
            >
              <input
                type="text"
                placeholder="Wholesale and Distribution"
                className={inputClass(errors, "companyTagline")}
                {...field("companyTagline")}
              />
            </InputWrapper>

            {/* Owner Name */}
            <InputWrapper
              label="Name of Owner"
              icon={User}
              error={errors.ownerName}
            >
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                autoComplete="name"
                className={inputClass(errors, "ownerName")}
                {...field("ownerName")}
              />
            </InputWrapper>

            {/* GST IN */}
            <InputWrapper
              label="GST IN"
              icon={Building2}
              error={errors.gstIn}
            >
              <input
                type="text"
                placeholder="e.g. 22AAAAA0000A1Z5"
                className={inputClass(errors, "gstIn")}
                value={form.gstIn}
                onChange={(e) => {
                  const nextValue = e.target.value.toUpperCase();
                  setForm((prev) => ({ ...prev, gstIn: nextValue }));
                  setErrors((prev) => ({ ...prev, gstIn: "" }));
                  setSaved(false);
                }}
              />
            </InputWrapper>

            {/* Address — kept as textarea since it's genuinely multi-line */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                  <MapPin size={17} />
                </div>
                <textarea
                  rows={3}
                  placeholder="Street, City, State, PIN / ZIP"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, address: e.target.value }));
                    setErrors((prev) => ({ ...prev, address: "" }));
                    setSaved(false);
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors resize-none
                    ${errors.address ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-600"}`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputWrapper
                label="Phone Number"
                icon={Phone}
                error={errors.phone}
              >
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  autoComplete="tel"
                  className={inputClass(errors, "phone")}
                  {...field("phone")}
                />
              </InputWrapper>

              <InputWrapper
                label="Email Address"
                icon={Mail}
                error={errors.email}
              >
                <input
                  type="email"
                  placeholder="company@example.com"
                  autoComplete="email"
                  className={inputClass(errors, "email")}
                  {...field("email")}
                />
              </InputWrapper>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className={`${inputClass(errors, "password")} pr-10`}
                    {...field("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Strength meter — only shown when user starts typing */}
                {form.password && (() => {
                  const { score, label, color } = getStrength(form.password);
                  return (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= score ? color : "bg-slate-200 dark:bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        score <= 1 ? "text-red-500"
                        : score <= 2 ? "text-orange-400"
                        : score <= 3 ? "text-yellow-500"
                        : "text-green-500"
                      }`}>
                        {label}
                      </p>
                    </div>
                  );
                })()}

                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className={`${inputClass(errors, "confirmPassword")} pr-10`}
                    {...field("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Match indicator */}
                {form.confirmPassword && (
                  <p className={`mt-2 text-xs font-medium flex items-center gap-1 ${
                    form.password === form.confirmPassword
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                    {form.password === form.confirmPassword ? (
                      <><CheckCircle size={13} /> Passwords match</>
                    ) : (
                      <><X size={13} /> Passwords do not match</>
                    )}
                  </p>
                )}

                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium"
                >
                  <CheckCircle size={18} />
                  Saved! Redirecting to Settings…
                </motion.div>
              )}
              {!saved && <div />}

              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                  text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
              >
                <Save size={18} />
                Save &amp; Continue
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}