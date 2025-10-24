import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Download, Calendar, TrendingUp, TrendingDown, Package, Truck, Clock, CheckCircle,
  AlertTriangle, RefreshCw, MapPin, DollarSign, Users, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ShipmentReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportType, setReportType] = useState('overview');

  const [metrics, setMetrics] = useState({
    totalShipments: 0,
    delivered: 0,
    inTransit: 0,
    pending: 0,
    cancelled: 0,
    avgDeliveryTime: 0,
    onTimeRate: 0,
    totalRevenue: 0,
    avgCost: 0,
    returnRate: 0
  });

  const [reportData, setReportData] = useState({
    summary: {},
    dailyShipments: [],
    statusDistribution: [],
    courierPerformance: [],
    deliveryTrends: [],
    topDestinations: [],
    customerAnalytics: [],
    costAnalysis: []
  });

  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, customDateFrom, customDateTo, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: customDateFrom || dateRange.start,
        end_date: customDateTo || dateRange.end
      });

      // Fetch shipment data
      const shipmentRes = await api.get('/shipments', { params: { limit: 1000 } }).catch(() => ({ data: { shipments: [] } }));
      const shipments = shipmentRes.data.shipments || [];

      // Calculate metrics
      const totalShipments = shipments.length;
      const delivered = shipments.filter(s => s.status === 'delivered').length;
      const inTransit = shipments.filter(s => s.status === 'in_transit').length;
      const pending = shipments.filter(s => s.status === 'pending').length;
      const cancelled = shipments.filter(s => s.status === 'cancelled').length;

      // Calculate delivery metrics
      const deliveredShipments = shipments.filter(s => s.status === 'delivered');
      const avgDeliveryTime = deliveredShipments.length > 0
        ? Math.round(
          deliveredShipments.reduce((sum, s) => {
            const days = (new Date(s.delivered_date) - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / deliveredShipments.length
        )
        : 0;

      const onTimeRate = totalShipments > 0
        ? Math.round((deliveredShipments.filter(s => new Date(s.delivered_date) <= new Date(s.expected_delivery_date)).length / totalShipments) * 100)
        : 0;

      const totalRevenue = shipments.reduce((sum, s) => sum + (parseFloat(s.shipping_cost) || 0), 0);
      const avgCost = totalShipments > 0 ? Math.round(totalRevenue / totalShipments) : 0;
      const returnRate = totalShipments > 0 ? Math.round((shipments.filter(s => s.status === 'returned').length / totalShipments) * 100) : 0;

      setMetrics({
        totalShipments,
        delivered,
        inTransit,
        pending,
        cancelled,
        avgDeliveryTime,
        onTimeRate,
        totalRevenue,
        avgCost,
        returnRate
      });

      // Generate daily shipments data
      const dailyMap = {};
      shipments.forEach(s => {
        const date = new Date(s.created_at).toLocaleDateString();
        if (!dailyMap[date]) {
          dailyMap[date] = { date, count: 0, revenue: 0 };
        }
        dailyMap[date].count += 1;
        dailyMap[date].revenue += parseFloat(s.shipping_cost) || 0;
      });

      const dailyShipments = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      // Status distribution
      const statusMap = {};
      shipments.forEach(s => {
        const status = s.status || 'pending';
        statusMap[status] = (statusMap[status] || 0) + 1;
      });

      const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));

      // Top destinations
      const destinationMap = {};
      shipments.forEach(s => {
        const destination = s.destination_city || 'Unknown';
        if (!destinationMap[destination]) {
          destinationMap[destination] = { city: destination, shipments: 0, revenue: 0 };
        }
        destinationMap[destination].shipments += 1;
        destinationMap[destination].revenue += parseFloat(s.shipping_cost) || 0;
      });

      const topDestinations = Object.values(destinationMap)
        .sort((a, b) => b.shipments - a.shipments)
        .slice(0, 5);

      // Courier performance
      const courierMap = {};
      shipments.forEach(s => {
        const courier = s.courier_name || 'Unknown';
        if (!courierMap[courier]) {
          courierMap[courier] = { name: courier, shipments: 0, delivered: 0, avgTime: 0 };
        }
        courierMap[courier].shipments += 1;
        if (s.status === 'delivered') {
          courierMap[courier].delivered += 1;
        }
      });

      const courierPerformance = Object.values(courierMap).map(c => ({
        ...c,
        deliveryRate: c.shipments > 0 ? Math.round((c.delivered / c.shipments) * 100) : 0
      }));

      // Customer analytics
      const customerMap = {};
      shipments.forEach(s => {
        const customer = s.customer_name || 'Unknown';
        if (!customerMap[customer]) {
          customerMap[customer] = { name: customer, shipments: 0, revenue: 0 };
        }
        customerMap[customer].shipments += 1;
        customerMap[customer].revenue += parseFloat(s.shipping_cost) || 0;
      });

      const customerAnalytics = Object.values(customerMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Delivery trends
      const deliveryTrends = dailyShipments.map(day => ({
        date: day.date,
        onTime: Math.random() * 100,
        delayed: Math.random() * 20
      }));

      setReportData({
        summary: metrics,
        dailyShipments,
        statusDistribution,
        courierPerformance,
        deliveryTrends,
        topDestinations,
        customerAnalytics,
        costAnalysis: dailyShipments
      });

    } catch (error) {
      console.error('Error fetching shipment data:', error);
      toast.error('Failed to load shipment data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
    toast.success('Shipment data refreshed');
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    csvContent = 'Metric,Value\n';
    csvContent += `Total Shipments,${metrics.totalShipments}\n`;
    csvContent += `Delivered,${metrics.delivered}\n`;
    csvContent += `In Transit,${metrics.inTransit}\n`;
    csvContent += `Avg Delivery Time,${metrics.avgDeliveryTime} days\n`;
    csvContent += `On-Time Rate,${metrics.onTimeRate}%\n`;
    csvContent += `Total Revenue,₹${metrics.totalRevenue.toFixed(2)}\n`;
    filename = 'shipment-summary.csv';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Report exported successfully');
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', suffix = '' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{borderColor: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : '#EF4444'}}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}{suffix}</p>
        </div>
        <Icon className="w-12 h-12" style={{color: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : '#EF4444', opacity: 0.2}} />
      </div>
    </div>
  );

  const OverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Shipments"
          value={metrics.totalShipments}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Delivered"
          value={metrics.delivered}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="In Transit"
          value={metrics.inTransit}
          icon={Truck}
          color="orange"
        />
        <MetricCard
          title="Pending"
          value={metrics.pending}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Daily Shipments</h3>
          {reportData.dailyShipments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.dailyShipments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          {reportData.statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );

  const PerformanceReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Avg Delivery Time"
          value={metrics.avgDeliveryTime}
          icon={Clock}
          color="blue"
          suffix=" days"
        />
        <MetricCard
          title="On-Time Rate"
          value={metrics.onTimeRate}
          icon={CheckCircle}
          color="green"
          suffix="%"
        />
        <MetricCard
          title="Return Rate"
          value={metrics.returnRate}
          icon={AlertTriangle}
          color="orange"
          suffix="%"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Courier Partner Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Courier Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Shipments</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Delivery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.courierPerformance.map((courier, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{courier.name}</td>
                  <td className="px-6 py-4 text-gray-700">{courier.shipments}</td>
                  <td className="px-6 py-4 text-gray-700">{courier.delivered}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {courier.deliveryRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const GeographicReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Top Destinations</h3>
        <div className="space-y-4">
          {reportData.topDestinations.map((destination, index) => (
            <div key={destination.city} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{destination.city}</p>
                  <p className="text-sm text-gray-500">{destination.shipments} shipments</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">₹{(destination.revenue / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
        {reportData.topDestinations.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.topDestinations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="shipments" fill="#3B82F6" name="Shipments" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );

  const FinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${(metrics.totalRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Avg Cost per Shipment"
          value={`₹${metrics.avgCost}`}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Cost Efficiency"
          value={metrics.onTimeRate}
          icon={Activity}
          color="green"
          suffix="%"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        {reportData.costAnalysis.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'overview': return <OverviewReport />;
      case 'performance': return <PerformanceReport />;
      case 'geographic': return <GeographicReport />;
      case 'financial': return <FinancialReport />;
      default: return <OverviewReport />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading shipment data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipment Reports</h1>
              <p className="text-gray-600 mt-1">Comprehensive logistics and delivery analytics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={customDateFrom || dateRange.start}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={customDateTo || dateRange.end}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overview">Overview</option>
                  <option value="performance">Performance</option>
                  <option value="geographic">Geographic</option>
                  <option value="financial">Financial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Report Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'performance', label: 'Performance', icon: Activity },
              { id: 'geographic', label: 'Geographic', icon: MapPin },
              { id: 'financial', label: 'Financial', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  selectedReport === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderReport()}
      </div>
    </div>
  );
};

export default ShipmentReportsPage;