import React, { useState, useEffect } from "react";

const alertTabs = [
  { label: "All Alerts", key: "all" },
  { label: "Out of Stock", key: "out_of_stock" },
  { label: "Low Stock", key: "low_stock" },
  { label: "Overstock", key: "overstock" },
];

const alertIcon = {
  out_of_stock: "⛔",
  low_stock: "⚠️",
  overstock: "ℹ️",
};

const alertTypeStyles = {
  out_of_stock: "bg-red-100 text-red-700 border-red-200",
  low_stock: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overstock: "bg-blue-100 text-blue-700 border-blue-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

const severityStyles = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

const summaryConfigs = [
  {
    key: "critical",
    title: "Critical Alerts",
    description: "Items that require immediate attention",
    bgClass: "bg-red-50 border border-red-100",
    textClass: "text-red-700",
  },
  {
    key: "high",
    title: "High Priority Alerts",
    description: "Items that need restocking soon",
    bgClass: "bg-orange-50 border border-orange-100",
    textClass: "text-orange-700",
  },
  {
    key: "medium",
    title: "Medium Priority Alerts",
    description: "Items with stock level issues",
    bgClass: "bg-blue-50 border border-blue-100",
    textClass: "text-blue-700",
  },
];

const formatAlertType = (type) =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const StockAlertsPage = () => {
  const [tabValue, setTabValue] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const api = (await import('../../utils/api')).default;
      
      // Fetch low stock items from the API
      const lowStockRes = await api.get('/inventory/alerts/low-stock');
      const lowStockItems = lowStockRes.data.lowStockItems || [];
      
      // Fetch all inventory to check for overstock
      const inventoryRes = await api.get('/inventory/stock');
      const allInventory = inventoryRes.data.inventory || [];
      
      const processedAlerts = [];
      
      // Process low stock and out of stock items
      lowStockItems.forEach(item => {
        const currentStock = item.current_stock || 0;
        const minStock = item.reorder_level || item.minimum_level || 0;
        
        let alertType = 'low_stock';
        let severity = 'medium';
        
        if (currentStock === 0) {
          alertType = 'out_of_stock';
          severity = 'critical';
        } else if (currentStock <= minStock * 0.25) {
          severity = 'critical';
        } else if (currentStock <= minStock * 0.5) {
          severity = 'high';
        }
        
        processedAlerts.push({
          id: item.id,
          itemName: item.product?.name || 'Unknown Product',
          category: item.product?.category || 'Unknown',
          currentStock: currentStock,
          minStock: minStock,
          alertType: alertType,
          severity: severity,
          lastUpdated: new Date(item.updated_at).toLocaleDateString(),
          location: item.location || 'Unknown Location',
        });
      });
      
      // Check for overstock items
      allInventory.forEach(item => {
        const currentStock = item.current_stock || 0;
        const maxStock = item.maximum_level || (item.reorder_level * 3) || 0;
        
        if (maxStock > 0 && currentStock >= maxStock) {
          processedAlerts.push({
            id: `overstock_${item.id}`,
            itemName: item.product?.name || 'Unknown Product',
            category: item.product?.category || 'Unknown',
            currentStock: currentStock,
            minStock: item.reorder_level || item.minimum_level || 0,
            maxStock: maxStock,
            alertType: 'overstock',
            severity: currentStock >= maxStock * 1.5 ? 'high' : 'medium',
            lastUpdated: new Date(item.updated_at).toLocaleDateString(),
            location: item.location || 'Unknown Location',
          });
        }
      });
      
      setAlerts(processedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Fallback to empty array on error
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAlerts = () => {
    if (tabValue === "all") return alerts;
    return alerts.filter((alert) => alert.alertType === tabValue);
  };

  const counts = {
    all: alerts.length,
    out_of_stock: alerts.filter((alert) => alert.alertType === "out_of_stock").length,
    low_stock: alerts.filter((alert) => alert.alertType === "low_stock").length,
    overstock: alerts.filter((alert) => alert.alertType === "overstock").length,
    critical: alerts.filter((alert) => alert.severity === "critical").length,
    high: alerts.filter((alert) => alert.severity === "high").length,
    medium: alerts.filter((alert) => alert.severity === "medium").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock Alerts</h1>
          <p className="text-sm text-gray-500">
            Monitor inventory levels and take action to avoid shortages.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAlerts}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <span className="mr-2 text-lg" aria-hidden>🔄</span>
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryConfigs.map(({ key, title, description, bgClass, textClass }) =>
          counts[key] ? (
            <div key={key} className={`rounded-lg p-4 ${bgClass}`}>
              <h2 className={`text-sm font-semibold uppercase ${textClass}`}>
                {title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">{counts[key]}</p>
            </div>
          ) : null,
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap border-b border-gray-200">
          {alertTabs.map((tab) => {
            const isActive = tabValue === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTabValue(tab.key)}
                className={`relative px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs font-semibold text-gray-400">
                  ({counts[tab.key] || 0})
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Alert
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Item Name
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Current Stock
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Min/Max Stock
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Location
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Severity
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Last Updated
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {getFilteredAlerts().map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        {alertIcon[alert.alertType] || "⚠️"}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                          alertTypeStyles[alert.alertType] || alertTypeStyles.default
                        }`}
                      >
                        {formatAlertType(alert.alertType)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {alert.itemName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{alert.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span
                      className={
                        alert.currentStock === 0
                          ? "font-semibold text-red-600"
                          : "text-gray-900"
                      }
                    >
                      {alert.currentStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {alert.minStock}
                    {alert.maxStock ? ` / ${alert.maxStock}` : ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{alert.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                        severityStyles[alert.severity] || severityStyles.default
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{alert.lastUpdated}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                    >
                      <span className="mr-2 text-base" aria-hidden>
                        🛒
                      </span>
                      Create PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {getFilteredAlerts().length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No alerts found</h2>
          <p className="mt-2 text-sm text-gray-500">
            All stock levels are currently within normal ranges.
          </p>
        </div>
      )}
    </div>
  );
};

export default StockAlertsPage;