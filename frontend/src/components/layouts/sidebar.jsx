import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, X, Menu, LogOut } from "lucide-react";
import Logo from "./Logo";
import menuItems from "./sideBarMenu";

/* ─────────────────────────────────────────────────────────────
   SIDEBAR INNER — shared between mobile drawer & desktop panel
───────────────────────────────────────────────────────────── */
function SidebarContent({ collapsed, onNavigate, onClose }) {
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || "dashboard";

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const role = user?.role;

  const [expandedItems, setExpandedItems] = useState(() => {
    // Auto-expand the group that contains the current page
    const active = menuItems.find(
      (item) => item.subMenu?.some((si) => si.id === currentPage)
    );
    return new Set(active ? [active.id] : ["analytics"]);
  });

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleNav = (path) => {
    onNavigate("/" + path);
    onClose?.(); // close mobile drawer on navigation
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onNavigate("/login");
    onClose?.();
  };

  /* Avatar initials */
  const displayName = user?.name || user?.username || user?.fullName || "Guest";
  const initials = displayName
    .trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "G";

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className={`flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 ${collapsed ? "px-4 py-5" : "px-5 py-5"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                Constructify
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all lg:hidden flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {menuItems
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => {
            const isParentActive =
              currentPage === item.id ||
              (item.subMenu?.some((si) => si.id === currentPage));

            return (
              <div key={item.id}>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                    isParentActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  }`}
                  onClick={() => {
                    if (item.subMenu) toggleExpanded(item.id);
                    else handleNav(item.id);
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isParentActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"}`} />
                    {!collapsed && (
                      <span className="text-sm font-semibold leading-none">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${isParentActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                        {item.badge}
                      </span>
                    )}
                    {!collapsed && item.count && (
                      <span className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${isParentActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                  {!collapsed && item.subMenu && (
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${expandedItems.has(item.id) ? "rotate-180" : ""} ${isParentActive ? "text-white" : "text-gray-400"}`} />
                  )}
                </button>

                {/* Submenu */}
                {!collapsed && item.subMenu && expandedItems.has(item.id) && (
                  <div className="ml-4 mt-0.5 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-0.5 py-1">
                    {item.subMenu.map((subitem) => {
                      const isActiveSub = currentPage === subitem.id;
                      return (
                        <button
                          key={subitem.id}
                          onClick={() => handleNav(subitem.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                            isActiveSub
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 font-medium"
                          }`}
                        >
                          {subitem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      {/* ── User profile footer ── */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700/60">
        <div className={`flex items-center rounded-xl bg-gray-50 dark:bg-gray-800/60 ${collapsed ? "justify-center p-2.5" : "gap-3 p-3"}`}>
          {/* Avatar — initials with fallback */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white dark:ring-gray-900 shadow-sm">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate capitalize">
                {role || "No Role"}
              </p>
            </div>
          )}
        </div>

        {collapsed ? (
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/35 text-red-600 dark:text-red-400 text-sm font-semibold transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/35 text-red-600 dark:text-red-400 text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT — handles desktop collapsed + mobile drawer
───────────────────────────────────────────────────────────── */
function AppSidebar({ collapsed }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close drawer when viewport grows past lg
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => { if (e.matches) setMobileOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════
          MOBILE HAMBURGER BUTTON
          Renders in a fixed top-left corner.
          Your main layout's top navbar should leave
          ~48 px of left padding so this doesn't overlap.
      ════════════════════════════════════════════ */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`
          lg:hidden fixed top-3 left-3 z-40
          p-2.5 bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-md
          text-gray-600 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-all active:scale-95
          ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ════════════════════════════════════════════
          MOBILE OVERLAY BACKDROP
      ════════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ════════════════════════════════════════════
          MOBILE DRAWER (slides in from left)
      ════════════════════════════════════════════ */}
      <div
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent
          collapsed={false}
          onNavigate={navigate}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP SIDEBAR (static, collapsible)
      ════════════════════════════════════════════ */}
      <div
        className={`
          hidden lg:flex flex-col flex-shrink-0
          ${collapsed ? "w-20" : "w-64"}
          transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          relative z-10
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          onNavigate={navigate}
          onClose={null}
        />
      </div>
    </>
  );
}

export default AppSidebar;