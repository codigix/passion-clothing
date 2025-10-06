import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Search,
  Eye,
  Edit,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  GraduationCap,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SELF_REGISTER_ALLOWED_DEPARTMENTS, DEPARTMENT_DISPLAY_MAP } from '../../config/rolePolicies';

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Real data
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStores: 0,
    totalStock: 0,
    totalSales: 0,
    totalReturns: 0,
    profitMargin: 0,
    stockTurnover: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);

  const handleExportData = () => {
    const data = [
      ['Metric', 'Value'],
      ['Total Products', stats.totalProducts],
      ['Total Stock', stats.totalStock],
      ['Total Sales', `₹${(stats.totalSales / 1000).toFixed(0)}K`],
      ['Returns', `₹${(stats.totalReturns / 1000).toFixed(0)}K`],
      ['Profit Margin', `${stats.profitMargin}%`],
      ['Stock Turnover', `${stats.stockTurnover}x`],
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-dashboard-stats.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await import('../../utils/api').then(m => m.default.get('/store/dashboard/stats'));
      setStats(res.data);
    } catch (error) {
      // Optionally show error toast
      setStats({ totalProducts: 0, totalStock: 0, lastUpdated: null });
    } finally {
      setLoading(false);
    }
  };

  const storeLocations = [
    {
      id: 1,
      storeName: 'ABC School Store',
      location: 'Mumbai, Maharashtra',
      manager: 'Rajesh Kumar',
      contact: '+91 9876543210',
      stockIssued: 2500,
      stockSold: 2200,
      stockReturned: 150,
      revenue: 45000,
      profitMargin: 38.2,
      lastStockUpdate: '2024-12-01',
      status: 'active'
    },
    {
      id: 2,
      storeName: 'XYZ College Store',
      location: 'Delhi, NCR',
      manager: 'Priya Singh',
      contact: '+91 9876543211',
      stockIssued: 1800,
      stockSold: 1650,
      stockReturned: 80,
      revenue: 32000,
      profitMargin: 35.8,
      lastStockUpdate: '2024-11-30',
      status: 'active'
    },
    {
      id: 3,
      storeName: 'PQR Academy Store',
      location: 'Bangalore, Karnataka',
      manager: 'Amit Sharma',
      contact: '+91 9876543212',
      stockIssued: 3200,
      stockSold: 2800,
      stockReturned: 200,
      revenue: 58000,
      profitMargin: 42.1,
      lastStockUpdate: '2024-12-01',
      status: 'active'
    },
    {
      id: 4,
      storeName: 'LMN School Store',
      location: 'Chennai, Tamil Nadu',
      manager: 'Sunita Devi',
      contact: '+91 9876543213',
      stockIssued: 1500,
      stockSold: 1200,
      stockReturned: 120,
      revenue: 28000,
      profitMargin: 32.5,
      lastStockUpdate: '2024-11-29',
      status: 'low_stock'
    }
  ];

  const stockMovements = [
    {
      id: 1,
      challanNo: 'CHN-20241201-0001',
      type: 'outward',
      storeName: 'ABC School Store',
      items: 'School Uniforms, Sports Wear',
      quantity: 250,
      value: 45000,
      date: '2024-12-01',
      status: 'delivered'
    },
    {
      id: 2,
      challanNo: 'CHN-20241201-0002',
      type: 'inward',
      storeName: 'XYZ College Store',
      items: 'Returned Uniforms',
      quantity: 15,
      value: 2800,
      date: '2024-12-01',
      status: 'received'
    },
    {
      id: 3,
      challanNo: 'CHN-20241130-0001',
      type: 'outward',
      storeName: 'PQR Academy Store',
      items: 'Winter Jackets, Accessories',
      quantity: 180,
      value: 32000,
      date: '2024-11-30',
      status: 'in_transit'
    }
  ];

  const salesData = [
    {
      id: 1,
      storeName: 'ABC School Store',
      productCategory: 'School Uniforms',
      quantitySold: 450,
      revenue: 85000,
      profit: 32000,
      profitMargin: 37.6,
      period: 'This Month'
    },
    {
      id: 2,
      storeName: 'XYZ College Store',
      productCategory: 'Sports Wear',
      quantitySold: 280,
      revenue: 52000,
      profit: 18500,
      profitMargin: 35.6,
      period: 'This Month'
    },
    {
      id: 3,
      storeName: 'PQR Academy Store',
      productCategory: 'Accessories',
      quantitySold: 320,
      revenue: 28000,
      profit: 12000,
      profitMargin: 42.9,
      period: 'This Month'
    }
  ];



  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700',
      low_stock: 'bg-amber-100 text-amber-700',
      inactive: 'bg-rose-100 text-rose-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      in_transit: 'bg-blue-100 text-blue-700',
      received: 'bg-sky-100 text-sky-700',
      pending: 'bg-amber-100 text-amber-700'
    };

    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getMovementColor = (type) => (type === 'outward' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700');

  const StatCard = ({ title, value, icon, colorClasses = 'bg-blue-100 text-blue-600', subtitle, unit, trend }) => (
    <div className="bg-white  shadow-sm border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-sm font-semibold text-gray-600">{unit}</span>}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
          {typeof trend === 'number' && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="text-emerald-500 w-4 h-4" />
              ) : (
                <TrendingDown className="text-rose-500 w-4 h-4" />
              )}
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Math.abs(trend)}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 flex items-center justify-center ${colorClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabPanel = ({ children, value, index }) => {
    if (value !== index) {
      return null;
    }
    return <div className="pt-6">{children}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          School Store Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/store/stock-request')}
          >
            <Package size={18} />
            Request Stock
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/store/add-location')}
          >
            <Plus size={18} />
            Add Store Location
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Store className="w-6 h-6" />}
          colorClasses="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Stock"
          value={stats.totalStock}
          icon={<Package className="w-6 h-6" />}
          subtitle="Items across all stores"
          colorClasses="bg-sky-100 text-sky-600"
        />
        <StatCard
          title="Total Sales"
          value={`₹${(stats.totalSales / 1000).toFixed(0)}K`}
          icon={<DollarSign className="w-6 h-6" />}
          subtitle="This month"
          colorClasses="bg-emerald-100 text-emerald-600"
          trend={12.5}
        />
        <StatCard
          title="Returns"
          value={`₹${(stats.totalReturns / 1000).toFixed(0)}K`}
          icon={<RotateCcw className="w-6 h-6" />}
          subtitle="This month"
          colorClasses="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Profit Margin"
          value={stats.profitMargin}
          unit="%"
          icon={<TrendingUp className="w-6 h-6" />}
          colorClasses="bg-emerald-100 text-emerald-600"
          trend={2.3}
        />
        <StatCard
          title="Stock Turnover"
          value={stats.stockTurnover}
          unit="x"
          icon={<FileText className="w-6 h-6" />}
          subtitle="Times per year"
          colorClasses="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-xl font-semibold">
          Quick Search &amp; Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by store name, location, manager..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/store/stock-management')}
            >
              Stock Management
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/store/sales-reports')}
            >
              Sales Reports
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/store/profitability')}
            >
              Profitability
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleExportData}
            >
              <Download size={18} />
              Export Data
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/store/stock-management')}
            >
              Stock Management
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex flex-wrap">
            {['Store Locations', 'Stock Movements', 'Sales Performance', 'Returns & Exchanges'].map((label, index) => (
              <button
                key={label}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  tabValue === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTabValue(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Store Locations Overview
              </h2>
              <button
                className="self-start md:self-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/store/locations')}
              >
                View All Locations
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Issued</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {storeLocations.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{store.storeName}</td>
                      <td className="px-4 py-3 text-gray-600">{store.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col text-sm text-gray-600">
                          <span>{store.manager}</span>
                          <span className="text-xs text-gray-400">{store.contact}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{store.stockIssued}</td>
                      <td className="px-4 py-3">{store.stockSold}</td>
                      <td className="px-4 py-3">{store.stockReturned}</td>
                      <td className="px-4 py-3">₹{store.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3">{store.profitMargin}%</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                          {store.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="View store"
                            onClick={() => navigate(`/store/locations/${store.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Edit store"
                            onClick={() => navigate(`/store/locations/edit/${store.id}`)}
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Recent Stock Movements
              </h2>
              <button
                className="self-start md:self-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/store/stock-movements')}
              >
                View All Movements
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{movement.challanNo}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getMovementColor(movement.type)}`}>
                          {movement.type === 'outward' ? <Truck size={14} /> : <ShoppingCart size={14} />}
                          {movement.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">{movement.storeName}</td>
                      <td className="px-4 py-3 text-gray-600">{movement.items}</td>
                      <td className="px-4 py-3 text-right">{movement.quantity}</td>
                      <td className="px-4 py-3">₹{movement.value.toLocaleString()}</td>
                      <td className="px-4 py-3">{movement.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                          {movement.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="View movement"
                          onClick={() => navigate(`/store/stock-movements/${movement.id}`)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Sales Performance
              </h2>
              <button
                className="self-start md:self-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/store/sales')}
              >
                View Detailed Sales
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesData.map((record) => (
                <div key={record.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-10 h-10 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{record.storeName}</h3>
                      <p className="text-xs text-gray-500">{record.productCategory}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Quantity Sold</p>
                      <p className="text-lg font-semibold text-gray-900">{record.quantitySold}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">₹{record.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Profit</p>
                      <p className="text-lg font-semibold text-emerald-600">₹{record.profit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Profit Margin</p>
                      <p className="text-lg font-semibold text-emerald-600">{record.profitMargin}%</p>
                    </div>
                  </div>
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/store/sales-reports/${record.id}`)}
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold">
                Returns &amp; Exchanges
              </h2>
              <button
                className="self-start md:self-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/store/returns')}
              >
                Manage Returns
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-semibold uppercase tracking-wide">Monthly Returns</p>
                  <p className="text-2xl font-bold text-amber-700">₹{(stats.totalReturns / 1000).toFixed(0)}K</p>
                </div>
                <button
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  onClick={() => navigate('/store/exchange-order')}
                >
                  Create Exchange Order
                </button>
              </div>
              <p className="mt-4 text-sm text-amber-700">
                Track returns and exchanges across all school stores to ensure timely resolutions and improved customer satisfaction.
              </p>
            </div>
          </div>
        </TabPanel>
      </div>


    </div>
  );
};

export default StoreDashboard;