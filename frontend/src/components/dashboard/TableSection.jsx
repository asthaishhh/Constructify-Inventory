import { MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from "../../utils/axiosConfig";

function TableSection() {
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchRecentCustomerOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await axios.get('/api/orders');
        const data = Array.isArray(res.data) ? res.data : [];

        const customerOrders = data
          .filter((o) => {
            const type = String(o.type || '').toLowerCase();
            return type === 'customers' || type === 'customer';
          })
          .map((o) => {
            const qty = Number(o.quantity || 0);
            const unitPrice = Number(o.sellingPrice || o.price || o.costPrice || 0);
            const fallbackTotal = Number(o.totalAmount || 0);
            const amountValue = qty > 0 && unitPrice > 0 ? qty * unitPrice : fallbackTotal;
            return {
              id: o.id || o.orderId || '—',
              customer: o.client || o.customer || '—',
              product: o.materialName || (o.material && o.material.name) || '—',
              amount: formatIndianPrice(amountValue),
              status: o.status || 'unknown',
              createdAt: o.createdAt || o.orderDate || null,
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '',
            };
          })
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setOrders(customerOrders);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchTopProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await axios.get('/api/dashboard/analytics');
        const categories = Array.isArray(res?.data?.salesByCategory)
          ? res.data.salesByCategory
          : [];

        setTopProducts(
          categories.map((item, index) => ({
            rank: index + 1,
            name: item.name || 'Other',
            share: Number(item.value || 0),
            revenue: Number(item.amount || 0),
            color: item.color || '#64748b',
          }))
        );
      } catch (err) {
        console.error('Error fetching top products:', err);
        setTopProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchRecentCustomerOrders();
    fetchTopProducts();

    const refresh = () => {
      fetchRecentCustomerOrders();
      fetchTopProducts();
    };

    window.addEventListener('dashboard:refresh', refresh);
    window.addEventListener('inventory:updated', refresh);

    return () => {
      window.removeEventListener('dashboard:refresh', refresh);
      window.removeEventListener('inventory:updated', refresh);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const visibleOrders = showAll ? orders : orders.slice(0, 5);

  function formatIndianPrice(value) {
    const v = Number(value) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  }

  return (
    <div className="space-y-6">
      {/* Recent Orders */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Recent
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Latest customer orders
              </p>
            </div>

            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Order ID
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Customer
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Product
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Amount
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Date
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {!loadingOrders && visibleOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No recent customer orders found.
                  </td>
                </tr>
              )}

              {visibleOrders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-blue-600">{order.id}</td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.customer}</td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.product}</td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.amount}</td>
                  <td className="p-4">
                    <span
                      className={`${getStatusColor(order.status)} font-medium text-xs px-3 py-1 rounded-full`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-800 dark:text-white">{order.date}</td>
                  <td className="p-4">
                    <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Top Products
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {loadingProducts && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading top products...</p>
            )}

            {!loadingProducts && topProducts.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No product sales data available.</p>
            )}

            {!loadingProducts && topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: product.color }}
                    />
                    #{product.rank}
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Share: {product.share.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {formatIndianPrice(product.revenue)}
                  </p>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default TableSection;
// ...existing code...
