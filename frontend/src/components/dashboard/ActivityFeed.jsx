import { AlertTriangle, FileText, Package, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const formatTimeAgo = (input) => {
    if (!input) return 'just now';
    const value = new Date(input);
    if (Number.isNaN(value.getTime())) return 'just now';

    const diffMs = Date.now() - value.getTime();
    if (diffMs < 60 * 1000) return 'just now';
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hr ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);

        const [materialsRes, ordersRes, invoicesRes] = await Promise.all([
          axios.get('/api/materials'),
          axios.get('/api/orders'),
          axios.get('/api/invoices'),
        ]);

        const materials = Array.isArray(materialsRes.data) ? materialsRes.data : [];
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

        const items = [];

        const lowStockItems = materials
          .filter((m) => Number(m.quantity || 0) <= Number(m.minStock || 0))
          .sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0));

        if (lowStockItems.length > 0) {
          const first = lowStockItems[0];
          items.push({
            id: `low-stock-${first._id || first.name}`,
            icon: AlertTriangle,
            title: 'Low Inventory Alert',
            description: `${lowStockItems.length} item(s) low. ${first.name}: ${first.quantity} left (min ${first.minStock}).`,
            time: formatTimeAgo(first.updatedAt || first.createdAt),
            timestamp: new Date(first.updatedAt || first.createdAt || Date.now()).getTime(),
            color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
          });
        }

        const latestOrder = [...orders].sort(
          (a, b) => new Date(b.createdAt || b.orderDate || 0) - new Date(a.createdAt || a.orderDate || 0)
        )[0];

        if (latestOrder) {
          const orderTime = latestOrder.createdAt || latestOrder.orderDate;
          items.push({
            id: `order-${latestOrder._id || latestOrder.id}`,
            icon: ShoppingCart,
            title: 'Last Order Placed',
            description: `${latestOrder.id || latestOrder._id}: ${latestOrder.client || 'Customer'} ordered ${latestOrder.quantity || 0} ${latestOrder.materialName || ''}.`,
            time: formatTimeAgo(orderTime),
            timestamp: new Date(orderTime || Date.now()).getTime(),
            color: 'bg-green-100 text-green-700 dark:bg-green-900/30',
          });
        }

        const recentInvoices = [...invoices]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
          .slice(0, 2);

        recentInvoices.forEach((invoice) => {
          const invoiceTime = invoice.updatedAt || invoice.createdAt;
          const invoiceLabel = invoice.invoiceNumber || invoice._id;
          const customerName = invoice?.customer?.name || 'Customer';
          items.push({
            id: `invoice-${invoice._id}`,
            icon: FileText,
            title: 'Invoice Updated',
            description: `${invoiceLabel} for ${customerName} is ${invoice.status || 'pending'}.`,
            time: formatTimeAgo(invoiceTime),
            timestamp: new Date(invoiceTime || Date.now()).getTime(),
            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
          });
        });

        const latestMaterialUpdate = [...materials].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
        )[0];

        if (latestMaterialUpdate) {
          const materialTime = latestMaterialUpdate.updatedAt || latestMaterialUpdate.createdAt;
          items.push({
            id: `material-${latestMaterialUpdate._id}`,
            icon: Package,
            title: 'Inventory Updated',
            description: `${latestMaterialUpdate.name}: ${latestMaterialUpdate.quantity} ${latestMaterialUpdate.unit || ''} in stock.`,
            time: formatTimeAgo(materialTime),
            timestamp: new Date(materialTime || Date.now()).getTime(),
            color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30',
          });
        }

        const sorted = items
          .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
          .slice(0, 8);

        setActivities(sorted);
      } catch (err) {
        console.error('Failed to load activity feed:', err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();

    const refresh = () => loadActivities();
    window.addEventListener('dashboard:refresh', refresh);
    window.addEventListener('inventory:updated', refresh);
    return () => {
      window.removeEventListener('dashboard:refresh', refresh);
      window.removeEventListener('inventory:updated', refresh);
    };
  }, []);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-3xl mx-auto shadow-md">
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Activity Feed
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live updates from orders, invoices and inventory
          </p>
        </div>
        {/* <button className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button> */}
      </div>

      {/* Activity List */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading activities...</p>
        )}

        {!loading && activities.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent activities found.</p>
        )}

        {activities.map((activity) => {
          const { id, icon: Icon, title, description, time, color } = activity;
          return (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
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
