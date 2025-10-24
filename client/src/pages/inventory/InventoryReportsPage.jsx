import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Barcode,
  Download, Printer, RefreshCw, Archive, AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const InventoryReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    overstockItems: 0,
    stockMovement: 0,
    turnoverRatio: 0,
    obsoleteItems: 0,
    fastMovingItems: 0
  });

  const [categoryReport, setCategoryReport] = useState([]);
  const [lowStockReport, setLowStockReport] = useState([]);
  const [movementReport, setMovementReport] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, customDateFrom, customDateTo]);

  const getDateRange = () => {
    const today = new Date();
    let date_from, date_to;

    switch (dateRange) {
      case 'today':
        date_from = today.toISOString().split('T')[0];
        date_to = today.toISOString().split('T')[0];
        break;
      case 'thisWeek':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        date_from = weekStart.toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'thisMonth':
        date_from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        date_from = lastMonth.toISOString().split('T')[0];
        date_to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        date_from = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'thisYear':
        date_from = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'custom':
        date_from = customDateFrom;
        date_to = customDateTo;
        break;
      default:
        date_from = null;
        date_to = null;
    }

    return { date_from, date_to };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { date_from, date_to } = getDateRange();

      const params = {};
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;

      // Fetch inventory data with error handling
      const [statsRes, inventoryRes, movementRes] = await Promise.all([
        api.get('/inventory/stats', { params }).catch(() => ({ data: {} })),
        api.get('/inventory/stock', { params: { ...params, limit: 1000 } }).catch(() => ({ data: { inventory: [] } })),
        api.get('/inventory/movement', { params: { ...params, limit: 1000 } }).catch(() => ({ data: { movement: [] } }))
      ]);

      const allInventory = inventoryRes.data.inventory || [];
      const movements = movementRes.data.movement || [];

      // Calculate stock health
      const lowStockCount = allInventory.filter(item => {
        const currentStock = parseFloat(item.current_stock) || 0;
        const reorderLevel = parseFloat(item.reorder_level) || 0;
        return reorderLevel > 0 && currentStock <= reorderLevel;
      }).length;

      const overstockCount = allInventory.filter(item => {
        const currentStock = parseFloat(item.current_stock) || 0;
        const maxStock = parseFloat(item.maximum_level) || 0;
        return maxStock > 0 && currentStock >= maxStock;
      }).length;

      const totalValue = allInventory.reduce((sum, item) => {
        return sum + ((parseFloat(item.current_stock) || 0) * (parseFloat(item.unit_cost) || 0));
      }, 0);

      const totalItems = allInventory.length;
      const obsoleteItems = allInventory.filter(item => parseFloat(item.current_stock) === 0).length;
      const outboundMovements = movements.filter(m => m.type === 'outward').length;
      const turnoverRatio = allInventory.length > 0 ? (outboundMovements / allInventory.length * 100) : 0;

      setMetrics({
        totalItems,
        totalValue,
        lowStockItems: lowStockCount,
        overstockItems: overstockCount,
        stockMovement: movements.length,
        turnoverRatio: Math.round(turnoverRatio * 10) / 10,
        obsoleteItems,
        fastMovingItems: outboundMovements
      });

      // Category analysis
      const categoryMap = {};
      allInventory.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = {
            category,
            totalItems: 0,
            totalValue: 0,
            lowStockCount: 0
          };
        }
        categoryMap[category].totalItems += 1;
        categoryMap[category].totalValue += (parseFloat(item.current_stock) || 0) * (parseFloat(item.unit_cost) || 0);
        
        if (parseFloat(item.reorder_level) > 0 && parseFloat(item.current_stock) <= parseFloat(item.reorder_level)) {
          categoryMap[category].lowStockCount += 1;
        }
      });
      
      setCategoryReport(Object.values(categoryMap).sort((a, b) => b.totalValue - a.totalValue));

      // Low stock items
      const lowStockItems = allInventory
        .filter(item => {
          const current = parseFloat(item.current_stock) || 0;
          const reorder = parseFloat(item.reorder_level) || 0;
          return reorder > 0 && current <= reorder;
        })
        .map(item => ({
          sku: item.sku || 'N/A',
          name: item.product_name || item.name || 'Unknown',
          currentStock: parseFloat(item.current_stock) || 0,
          reorderLevel: parseFloat(item.reorder_level) || 0,
          category: item.category || 'Uncategorized'
        }))
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 20);

      setLowStockReport(lowStockItems);

      // Movement analysis
      const movementData = movements
        .map(m => ({
          date: m.createdAt || m.created_at || new Date().toISOString(),
          type: m.type,
          quantity: parseFloat(m.quantity) || 0,
          reference: m.reference_number || 'N/A'
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);

      setMovementReport(movementData);

    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
    toast.success('Report data refreshed');
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'summary':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Items,${metrics.totalItems}\n`;
        csvContent += `Total Value,₹${metrics.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n`;
        csvContent += `Low Stock Items,${metrics.lowStockItems}\n`;
        csvContent += `Overstock Items,${metrics.overstockItems}\n`;
        csvContent += `Stock Turnover Ratio,${metrics.turnoverRatio}%\n`;
        csvContent += `Obsolete Items,${metrics.obsoleteItems}\n`;
        csvContent += `Stock Movements,${metrics.stockMovement}\n`;
        csvContent += `Fast Moving Items,${metrics.fastMovingItems}\n`;
        filename = 'inventory-summary-report.csv';
        break;

      case 'category':
        csvContent = 'Category,Total Items,Total Value,Low Stock Count\n';
        categoryReport.forEach(cat => {
          csvContent += `${cat.category},${cat.totalItems},₹${cat.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })},${cat.lowStockCount}\n`;
        });
        filename = 'inventory-category-report.csv';
        break;

      case 'alert':
        csvContent = 'SKU,Product Name,Current Stock,Reorder Level,Category\n';
        lowStockReport.forEach(item => {
          csvContent += `${item.sku},${item.name},${item.currentStock},${item.reorderLevel},${item.category}\n`;
        });
        filename = 'inventory-low-stock-report.csv';
        break;

      case 'movement':
        csvContent = 'Date,Type,Quantity,Reference\n';
        movementReport.forEach(item => {
          csvContent += `${new Date(item.date).toLocaleDateString('en-IN')},${item.type},${item.quantity},${item.reference}\n`;
        });
        filename = 'inventory-movement-report.csv';
        break;

      default:
        toast.error('Invalid report type');
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const MetricCard = ({ title, value, icon, color = 'primary' }) => (
    <div className="bg-white rounded shadow p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  );

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded shadow p-12">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading report data...</p>
          </div>
        </div>
      );
    }

    switch (reportType) {
      case 'summary':
        return (
          <div className="space-y-6">
            {/* Extended Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="bg-white rounded shadow p-4 border-l-4 border-blue-500">
                <div className="text-sm text-gray-600 mb-1">Low Stock Items</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.lowStockItems}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-yellow-500">
                <div className="text-sm text-gray-600 mb-1">Overstock Items</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.overstockItems}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">Obsolete Items</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.obsoleteItems}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-green-500">
                <div className="text-sm text-gray-600 mb-1">Turnover Ratio</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.turnoverRatio.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-cyan-500">
                <div className="text-sm text-gray-600 mb-1">Stock Movements</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.stockMovement}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-purple-500">
                <div className="text-sm text-gray-600 mb-1">Fast Moving Items</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.fastMovingItems}</div>
              </div>
            </div>

            {/* Stock Health & Inventory Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-blue-500" />
                  Inventory Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-gray-700">Total Items</span>
                    <span className="font-semibold text-blue-700">{metrics.totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-700">Total Value</span>
                    <span className="font-semibold text-green-700">₹{metrics.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Stock Alerts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="text-gray-700">Requires Reorder</span>
                    <span className="font-semibold text-yellow-700">{metrics.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-gray-700">Excess Stock</span>
                    <span className="font-semibold text-red-700">{metrics.overstockItems}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock Count</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryReport.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No category data found
                      </td>
                    </tr>
                  ) : (
                    categoryReport.map((category, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-gray-900">{category.category}</td>
                        <td className="px-2 py-2 text-sm text-right text-gray-900">{category.totalItems}</td>
                        <td className="px-2 py-2 text-sm text-right font-medium text-gray-900">₹{category.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-2 py-2 text-sm text-right text-orange-600">{category.lowStockCount}</td>
                        <td className="px-2 py-2 text-sm text-right text-blue-600">{metrics.totalValue > 0 ? ((category.totalValue / metrics.totalValue) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'alert':
        return (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockReport.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No low stock items found
                      </td>
                    </tr>
                  ) : (
                    lowStockReport.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-blue-600">{item.sku}</td>
                        <td className="px-2 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-2 py-2 text-sm text-right text-red-600 font-medium">{item.currentStock}</td>
                        <td className="px-2 py-2 text-sm text-right text-gray-900">{item.reorderLevel}</td>
                        <td className="px-2 py-2 text-sm text-gray-600">{item.category}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'movement':
        return (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movementReport.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        No stock movements found
                      </td>
                    </tr>
                  ) : (
                    movementReport.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm text-gray-600">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-2 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.type === 'inward' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-sm text-right font-medium text-gray-900">{item.quantity}</td>
                        <td className="px-2 py-2 text-sm text-blue-600">{item.reference}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded shadow p-12">
            <div className="text-center text-gray-500">
              <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a report type to view data</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Reports</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive inventory reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-sm text-white rounded hover:bg-green-600"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-sm text-white rounded hover:bg-blue-600"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded shadow p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
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
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
            >
              <option value="summary">Summary Report</option>
              <option value="category">By Category</option>
              <option value="alert">Low Stock Alerts</option>
              <option value="movement">Stock Movements</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded w-full">
              <div className="font-semibold text-blue-700">
                {reportType === 'summary' ? 'Summary View' :
                 reportType === 'category' ? `${categoryReport.length} Categories` :
                 reportType === 'alert' ? `${lowStockReport.length} Alerts` :
                 reportType === 'movement' ? `${movementReport.length} Movements` : 'View'}
              </div>
            </div>
          </div>
        </div>
        
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input 
                type="date" 
                value={customDateFrom}
                onChange={e => setCustomDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input 
                type="date" 
                value={customDateTo}
                onChange={e => setCustomDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems}
          icon={<Package className="w-8 h-8 text-blue-500" />}
          color="success"
        />
        <MetricCard
          title="Total Value"
          value={`₹${(metrics.totalValue / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}L`}
          icon={<BarChart3 className="w-8 h-8 text-green-500" />}
          color="primary"
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          icon={<AlertTriangle className="w-8 h-8 text-orange-500" />}
          color="info"
        />
        <MetricCard
          title="Turnover Ratio"
          value={`${metrics.turnoverRatio.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`}
          icon={<TrendingUp className="w-8 h-8 text-cyan-500" />}
          color="warning"
        />
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default InventoryReportsPage;