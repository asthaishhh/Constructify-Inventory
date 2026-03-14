import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Save, Eye, EyeOff, Building2, Upload, X, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadCompanyProfile, saveCompanyProfile } from '../utils/companyProfile';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile state (personal)
  const [profile, setProfile] = useState({
    name: 'Yashvi',
    email: 'yashvi@example.com',
    phone: '+91 9876543210',
    role: 'Administrator'
  });

  // Company profile state
  const [company, setCompany] = useState(() => loadCompanyProfile());
  const [companyLogoPreview, setCompanyLogoPreview] = useState(() => loadCompanyProfile().logo || '');
  const [companyLogoFileName, setCompanyLogoFileName] = useState('');
  const [companySaved, setCompanySaved] = useState(false);
  const companyFileRef = useRef(null);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    inventoryAlerts: true,
    weeklyReports: false
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    alert('Profile updated successfully!');
  };

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/svg+xml'];
    if (!allowed.includes(file.type)) { alert('Please upload a valid image (JPG, PNG, GIF, WebP or SVG).'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Image must be smaller than 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCompanyLogoPreview(dataUrl);
      setCompanyLogoFileName(file.name);
      setCompany((prev) => ({ ...prev, logo: dataUrl }));
      setCompanySaved(false);
    };
    reader.readAsDataURL(file);
  };

  const removeCompanyLogo = () => {
    setCompanyLogoPreview('');
    setCompanyLogoFileName('');
    setCompany((prev) => ({ ...prev, logo: '' }));
    if (companyFileRef.current) companyFileRef.current.value = '';
  };

  const handleCompanySave = (e) => {
    e.preventDefault();
    saveCompanyProfile(company);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  };

  const handleNotificationUpdate = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Here you would typically send the data to your backend
    alert('Password changed successfully!');
    setAccountSettings({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-10"
                >
                  {/* ── Personal profile ── */}
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                          <input
                            type="text"
                            value={profile.role}
                            disabled
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                          <Save size={20} />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* ── Company Profile ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Building2 size={20} className="text-blue-500" />
                      <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Company Profile</h2>
                    </div>

                    <form onSubmit={handleCompanySave} className="space-y-6">
                      {/* Logo */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Company Logo <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700">
                            {companyLogoPreview ? (
                              <img src={companyLogoPreview} alt="Company logo" className="w-full h-full object-contain" />
                            ) : (
                              <Building2 size={28} className="text-slate-300 dark:text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <button
                              type="button"
                              onClick={() => companyFileRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Upload size={15} />
                              {companyLogoPreview ? 'Change Logo' : 'Upload Logo'}
                            </button>
                            {companyLogoFileName && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{companyLogoFileName}</span>
                                <button type="button" onClick={removeCompanyLogo} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Remove logo">
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                            {companyLogoPreview && !companyLogoFileName && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Current logo</span>
                                <button type="button" onClick={removeCompanyLogo} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Remove logo">
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG, GIF, WebP or SVG · max 2 MB</p>
                          </div>
                        </div>
                        <input
                          ref={companyFileRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                          onChange={handleCompanyLogoChange}
                          className="hidden"
                        />
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Constructify Pvt. Ltd."
                            value={company.companyName}
                            onChange={(e) => { setCompany((p) => ({ ...p, companyName: e.target.value })); setCompanySaved(false); }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name of Owner</label>
                          <input
                            type="text"
                            placeholder="e.g. Rajesh Sharma"
                            value={company.ownerName}
                            onChange={(e) => { setCompany((p) => ({ ...p, ownerName: e.target.value })); setCompanySaved(false); }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GST IN</label>
                          <input
                            type="text"
                            placeholder="e.g. 22AAAAA0000A1Z5"
                            value={company.gstIn || ''}
                            onChange={(e) => { setCompany((p) => ({ ...p, gstIn: e.target.value.toUpperCase() })); setCompanySaved(false); }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="+91 9876543210"
                            value={company.phone}
                            onChange={(e) => { setCompany((p) => ({ ...p, phone: e.target.value })); setCompanySaved(false); }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                          <input
                            type="email"
                            placeholder="company@example.com"
                            value={company.email}
                            onChange={(e) => { setCompany((p) => ({ ...p, email: e.target.value })); setCompanySaved(false); }}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                        <textarea
                          rows={3}
                          placeholder="Street, City, State, PIN / ZIP"
                          value={company.address}
                          onChange={(e) => { setCompany((p) => ({ ...p, address: e.target.value })); setCompanySaved(false); }}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        {companySaved && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-green-600 dark:text-green-400 font-medium"
                          >
                            Company profile saved!
                          </motion.span>
                        )}
                        {!companySaved && <div />}
                        <button
                          type="submit"
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          <Save size={20} />
                          Save Company
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* ── Create New User ── */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                    <div className="flex items-center gap-2 mb-3">
                      <UserPlus size={20} className="text-purple-500" />
                      <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">User Management</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                      Create a new user account that can access this website.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md shadow-purple-500/20"
                    >
                      <UserPlus size={20} />
                      Create New User
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">Appearance Settings</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <h3 className="text-lg font-medium text-slate-800 dark:text-white">Dark Mode</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Toggle between light and dark themes</p>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            darkMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              darkMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">Notification Preferences</h2>
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div>
                            <h3 className="text-lg font-medium text-slate-800 dark:text-white capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationUpdate(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">Account Security</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={accountSettings.currentPassword}
                            onChange={(e) => setAccountSettings({...accountSettings, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={accountSettings.newPassword}
                            onChange={(e) => setAccountSettings({...accountSettings, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={accountSettings.confirmPassword}
                            onChange={(e) => setAccountSettings({...accountSettings, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          <Shield size={20} />
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
