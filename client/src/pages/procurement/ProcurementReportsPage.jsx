import React, { useState } from 'react';
import { ShoppingCart, IndianRupee, Building, TrendingDown } from 'lucide-react';

const ProcurementReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('summary');

  // Mock data
  const procurementMetrics = {
    totalPurchases: 1850000,
    totalOrders: 89,
    activeVendors: 25,
    avgOrderValue: 20787
  };

  const MetricCard = ({ title, value, icon, color = 'primary' }) => (
    <div className={`rounded-lg shadow bg-white p-4 flex items-center justify-between border-t-4 ${
      color === 'success' ? 'border-green-500' :
      color === 'primary' ? 'border-blue-500' :
      color === 'info' ? 'border-cyan-500' :
      color === 'warning' ? 'border-yellow-500' :
      'border-gray-300'
    }`}>
      <div>
        <div className="text-xs text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Procurement Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <form className="flex flex-col md:flex-row md:items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="vendor">By Vendor</option>
              <option value="category">By Category</option>
              <option value="cost">Cost Analysis</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}
          <div className="flex-1 min-w-[120px] flex items-end">
            <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition">
              Generate Report
            </button>
          </div>
        </form>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Purchases"
          value={`₹${procurementMetrics.totalPurchases.toLocaleString()}`}
          icon={<IndianRupee className="w-8 h-8 text-green-500" />}
          color="success"
        />
        <MetricCard
          title="Purchase Orders"
          value={procurementMetrics.totalOrders}
          icon={<ShoppingCart className="w-8 h-8 text-blue-500" />}
          color="primary"
        />
        <MetricCard
          title="Active Vendors"
          value={procurementMetrics.activeVendors}
          icon={<Building className="w-8 h-8 text-cyan-500" />}
          color="info"
        />
        <MetricCard
          title="Avg Order Value"
          value={`₹${procurementMetrics.avgOrderValue.toLocaleString()}`}
          icon={<TrendingDown className="w-8 h-8 text-yellow-500" />}
          color="warning"
        />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Procurement Trend Chart</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
          <span className="text-gray-400">Chart will be implemented here</span>
        </div>
      </div>
    </div>
  );
};

export default ProcurementReportsPage;