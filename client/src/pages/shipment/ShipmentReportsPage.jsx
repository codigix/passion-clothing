import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Target,
  Users,
  MapPin,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ShipmentReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState({
    summary: {},
    dailyShipments: [],
    statusDistribution: [],
    courierPerformance: [],
    deliveryTrends: [],
    topDestinations: [],
    customerAnalytics: []
  });
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      });

      const [summaryRes, dailyRes, statusRes, courierRes] = await Promise.all([
        fetch(`/api/shipments/dashboard/stats?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/shipments/reports/daily?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/shipments/reports/status-distribution?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/courier-partners/performance?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const [summary, daily, status, courier] = await Promise.all([
        summaryRes.json(),
        dailyRes.json(),
        statusRes.json(),
        courierRes.json()
      ]);

      setReportData({
        summary: summary || {},
        dailyShipments: daily.data || [],
        statusDistribution: status.data || [],
        courierPerformance: courier.data || [],
        deliveryTrends: generateDeliveryTrends(daily.data || []),
        topDestinations: generateTopDestinations(),
        customerAnalytics: generateCustomerAnalytics()
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateDeliveryTrends = (dailyData) => {
    return dailyData.map(day => ({
      date: day.date,
      onTime: Math.floor(Math.random() * 50) + 20,
      delayed: Math.floor(Math.random() * 20) + 5,
      avgDeliveryTime: Math.floor(Math.random() * 5) + 2
    }));
  };

  const generateTopDestinations = () => {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
    return cities.map(city => ({
      city,
      shipments: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 50000) + 10000
    })).sort((a, b) => b.shipments - a.shipments).slice(0, 5);
  };

  const generateCustomerAnalytics = () => {
    return [
      { segment: 'Premium', shipments: 45, revenue: 125000 },
      { segment: 'Regular', shipments: 120, revenue: 85000 },
      { segment: 'New', shipments: 35, revenue: 25000 }
    ];
  };

  const exportReport = async (format = 'csv') => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
        format
      });

      const response = await fetch(`/api/shipments/export/data?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shipment-report-${dateRange.start}-to-${dateRange.end}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Report exported as ${format.toUpperCase()}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const OverviewReport = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shipments"
          value={reportData.summary.total || 0}
          change={12}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Delivered"
          value={reportData.summary.delivered || 0}
          change={8}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="In Transit"
          value={reportData.summary.inTransit || 0}
          change={-3}
          icon={Truck}
          color="purple"
        />
        <StatCard
          title="Pending"
          value={reportData.summary.pending || 0}
          change={15}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Shipments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Shipments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.dailyShipments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {reportData.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const PerformanceReport = () => (
    <div className="space-y-6">
      {/* Delivery Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Delivery Performance Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={reportData.deliveryTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="onTime" stroke="#10B981" strokeWidth={2} name="On Time" />
            <Line type="monotone" dataKey="delayed" stroke="#EF4444" strokeWidth={2} name="Delayed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Courier Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Courier Partner Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.courierPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="deliveryRate" fill="#3B82F6" name="Delivery Rate %" />
            <Bar dataKey="avgDeliveryTime" fill="#10B981" name="Avg Delivery Time (days)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const GeographicReport = () => (
    <div className="space-y-6">
      {/* Top Destinations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Destinations</h3>
        <div className="space-y-4">
          {reportData.topDestinations.map((destination, index) => (
            <div key={destination.city} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{destination.city}</p>
                  <p className="text-sm text-gray-500">{destination.shipments} shipments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">₹{destination.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Shipment Distribution by Region</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.topDestinations} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="city" type="category" />
            <Tooltip />
            <Bar dataKey="shipments" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const CustomerReport = () => (
    <div className="space-y-6">
      {/* Customer Segments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Customer Segment Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.customerAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="shipments" fill="#3B82F6" name="Shipments" />
            <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value="1,234"
          change={5}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Avg Order Value"
          value="₹2,450"
          change={12}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Customer Satisfaction"
          value="94%"
          change={3}
          icon={Target}
          color="purple"
        />
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'overview': return <OverviewReport />;
      case 'performance': return <PerformanceReport />;
      case 'geographic': return <GeographicReport />;
      case 'customer': return <CustomerReport />;
      default: return <OverviewReport />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipment Reports</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportReport('csv')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={fetchReportData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'performance', name: 'Performance', icon: Activity },
              { id: 'geographic', name: 'Geographic', icon: MapPin },
              { id: 'customer', name: 'Customer', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedReport === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            renderReport()
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentReportsPage;
