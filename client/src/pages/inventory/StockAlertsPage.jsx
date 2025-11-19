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
  const [activeTab, setActiveTab] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const api = (await import('../../utils/api')).default;
      
      const lowStockRes = await api.get('/inventory/alerts/low-stock');
      const lowStockItems = lowStockRes.data.lowStockItems || [];
      
      const inventoryRes = await api.get('/inventory/stock');
      const allInventory = inventoryRes.data.inventory || [];
      
      const processedAlerts = [];
      
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
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getTabFilteredAlerts = () => {
    if (activeTab === "all") return alerts;
    return alerts.filter((alert) => alert.alertType === activeTab);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-3">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📦 Stock Alerts</h1>
          <p className="text-xs text-gray-500">Monitor inventory levels and take action</p>
        </div>
        <button
          type="button"
          onClick={fetchAlerts}
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md transition"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">⛔</div>
          <p className="text-xs font-semibold text-red-700 uppercase">Critical</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{counts.critical}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">⚠️</div>
          <p className="text-xs font-semibold text-yellow-700 uppercase">High</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{counts.high}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-20">ℹ️</div>
          <p className="text-xs font-semibold text-blue-700 uppercase">Medium</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{counts.medium}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden">
        <div className="flex gap-1 border-b border-gray-200 p-2">
          {alertTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.key === "all" && "📦"}
                {tab.key === "out_of_stock" && "⛔"}
                {tab.key === "low_stock" && "⚠️"}
                {tab.key === "overstock" && "ℹ️"}
                {tab.label.split(" ")[0]}
                <span className="text-xs opacity-75">({counts[tab.key] || 0})</span>
              </button>
            );
          })}
        </div>

        <div className="p-3">
          {getTabFilteredAlerts().length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-500">No alerts found</p>
            </div>
          ) : (
            <div className="grid gap-2 max-h-[600px] overflow-y-auto">
              {getTabFilteredAlerts().map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-3 ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : alert.severity === "high"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg">
                        {alertIcon[alert.alertType] || "⚠️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {alert.itemName}
                        </p>
                        <p className="text-xs text-gray-600">{alert.category}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                        severityStyles[alert.severity] || severityStyles.default
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    <div className="bg-white bg-opacity-50 rounded p-1.5">
                      <p className="text-gray-600">Stock: <span className={alert.currentStock === 0 ? "font-bold text-red-600" : "font-bold text-gray-900"}>{alert.currentStock}</span></p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-1.5">
                      <p className="text-gray-600">Min: <span className="font-bold text-gray-900">{alert.minStock}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-600">📍 {alert.location}</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-500 hover:bg-blue-600 px-2 py-1 text-xs font-semibold text-white transition"
                    >
                      🛒 PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAlertsPage;