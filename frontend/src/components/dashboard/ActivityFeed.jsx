import { User, ShoppingCart, Bell, Settings, IndianRupee } from 'lucide-react';
import React, { useState } from 'react';

const activities = [
  {
    id: 1,
    type: "users",
    icon: User,
    title: "New User Registered",
    description: "Aarav Patel created an account",
    time: "2 minutes ago",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
    action: "View user details"
  },
  {
    id: 2,
    type: "orders",
    icon: ShoppingCart,
    title: "New Order Placed",
    description: "Order #IND3847 confirmed from Mumbai",
    time: "10 minutes ago",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30",
    action: "Check order status"
  },
  // {
  //   id: 3,
  //   type: "payment",
  //   icon: IndianRupee,
  //   title: "UPI Payment Received",
  //   description: "₹12,450 received from Priya Sharma (GPay)",
  //   time: "30 minutes ago",
  //   color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  //   action: "View transaction details"
  // },
  {
    id: 4,
    type: "notification",
    icon: Bell,
    title: "New Notification",
    description: "3 new supplier messages in inbox",
    time: "1 hour ago",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
    action: "Open notifications"
  },
  {
    id: 5,
    type: "system updates",
    icon: Settings,
    title: "System Update Available",
    description: "Version 2.1.0 with GST support ready",
    time: "2 hours ago",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30",
    action: "Install update"
  }
];

const ActivityFeed = () => {
  const [selectedId, setSelectedId] = useState(null);

  const handleActivityClick = (activity) => {
    setSelectedId(activity.id);
    alert(`✅ ${activity.title}\nAction: ${activity.action}`);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-3xl mx-auto shadow-md">
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Activity Feed
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recent System Activities
          </p>
        </div>
        {/* <button className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button> */}
      </div>

      {/* Activity List */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {activities.map((activity) => {
          const { id, icon: Icon, title, description, time, color } = activity;
          return (
            <button
              key={id}
              onClick={() => handleActivityClick(activity)}
              className={`w-full flex items-start sm:items-center space-x-4 p-3 rounded-xl transition-colors text-left
                ${selectedId === id
                  ? "bg-blue-50 dark:bg-blue-900/40 ring-2 ring-blue-400"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
              `}
            >
              <div className={`p-2 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {description}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {time}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
