import React, { useState, useEffect } from 'react';
import { FaBoxes, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const InventoryReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [inventoryMetrics, setInventoryMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    overstockItems: 0
  });

  useEffect(() => {
    fetchInventoryMetrics();
  }, []);

  const fetchInventoryMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory stats
      const statsRes = await api.get('/inventory/stats');
      const stats = statsRes.data;
      
      // Fetch all inventory to calculate overstock
      const inventoryRes = await api.get('/inventory/stock');
      const allInventory = inventoryRes.data.inventory || [];
      
      // Calculate overstock items
      const overstockCount = allInventory.filter(item => {
        const currentStock = item.current_stock || 0;
        const maxStock = item.maximum_level || (item.reorder_level * 3) || 0;
        return maxStock > 0 && currentStock >= maxStock;
      }).length;
      
      setInventoryMetrics({
        totalItems: stats.totalItems || 0,
        totalValue: stats.totalValue || 0,
        lowStockItems: stats.lowStockItems || 0,
        overstockItems: overstockCount
      });
    } catch (error) {
      console.error('Error fetching inventory metrics:', error);
      toast.error('Failed to load inventory metrics');
    } finally {
      setLoading(false);
    }
  };

  const colorMap = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-500',
  };

  const MetricCard = ({ title, value, icon, color = 'primary' }) => (
    <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
      <div>
        <div className="text-gray-500 text-sm mb-1">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className={colorMap[color] + ' text-3xl'}>{icon}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading inventory reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Reports</h1>
        <button
          onClick={fetchInventoryMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Refresh Data
        </button>
      </div>

      <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="category">By Category</option>
              <option value="location">By Location</option>
              <option value="valuation">Stock Valuation</option>
              <option value="movement">Stock Movement</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>
            </>
          )}
          <div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Generate Report</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Items"
          value={inventoryMetrics.totalItems.toLocaleString()}
          icon={<FaBoxes />}
          color="primary"
        />
        <MetricCard
          title="Total Value"
          value={`₹${inventoryMetrics.totalValue.toLocaleString()}`}
          icon={<FaChartLine />}
          color="success"
        />
        <MetricCard
          title="Low Stock Items"
          value={inventoryMetrics.lowStockItems}
          icon={<FaArrowDown />}
          color="error"
        />
        <MetricCard
          title="Overstock Items"
          value={inventoryMetrics.overstockItems}
          icon={<FaArrowUp />}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stock by Category</h2>
          <div className="h-72 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
            <span className="text-gray-500">Pie Chart will be implemented here</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Movement Trend</h2>
          <div className="h-72 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
            <span className="text-gray-500">Line Chart will be implemented here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsPage;