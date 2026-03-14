import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Logo from "./Logo";
import menuItems from "./sideBarMenu";

function AppSidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || "dashboard";

  // Safe parsing (prevents crash if no user in localStorage)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  const [expandedItems, setExpandedItems] = useState(new Set(["analytics"]));

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }

    setExpandedItems(newExpanded);
  };

  return (
    <div
      className={`${collapsed ? "w-20" : "w-72"} transition duration-300 ease-in-out 
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
      border-r border-slate-200/50 dark:border-slate-700/50 
      flex flex-col relative z-10`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Logo />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Constructify
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin Panel
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems
          .filter((item) => {
            if (!item.roles) return true;
            return item.roles.includes(role);
          })
          .map((item) => {
            const isParentActive =
              currentPage === item.id ||
              (item.subMenu &&
                item.subMenu.some((si) => si.id === currentPage));

            return (
              <div key={item.id}>
                <button
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${
                    isParentActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => {
                    if (item.subMenu) {
                      toggleExpanded(item.id);
                    } else {
                      navigate("/" + item.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-5 h-5" />

                    {!collapsed && (
                      <>
                        <span className="font-medium ml-2">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                            {item.badge}
                          </span>
                        )}

                        {item.count && (
                          <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {!collapsed && item.subMenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.has(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {!collapsed &&
                  item.subMenu &&
                  expandedItems.has(item.id) && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.subMenu.map((subitem) => {
                        const isActiveSub =
                          currentPage === subitem.id;

                        return (
                          <button
                            key={subitem.id}
                            onClick={() =>
                              navigate("/" + subitem.id)
                            }
                            className={`w-full text-left p-2 text-sm rounded-lg transition-all ${
                              isActiveSub
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
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

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <img
            src="https://images.pexels.com/photos/33718010/pexels-photo-33718010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2"
            alt="user"
            className="w-10 h-10 rounded-full ring-2 ring-blue-500"
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.role || "No Role"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppSidebar;