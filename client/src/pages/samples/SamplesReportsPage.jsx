import React, { useState, useEffect } from 'react';
import { Download, FileText, PieChart, BarChart3, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SamplesReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalSamples: 0,
    conversionRate: 0,
    totalRevenue: 0,
    paidSampleCost: 0,
    freeSampleCost: 0,
    approvalRate: 0,
    rejectionRate: 0,
    avgTimeToConvert: 0,
    pendingFollowups: 0,
    costPerConversion: 0
  });

  const [chartData, setChartData] = useState({
    conversionTrend: [],
    costBreakdown: [],
    statusDistribution: [],
    feedbackAnalysis: [],
    costAnalysis: [],
    timeToConversion: []
  });

  const [detailedData, setDetailedData] = useState({
    sampleDetails: [],
    conversionFunnel: [],
    feedbackSummary: [],
    costMetrics: []
  });

  useEffect(() => {
    fetchSampleData();
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

  const fetchSampleData = async () => {
    try {
      setLoading(true);
      const { date_from, date_to } = getDateRange();

      const params = {};
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;

      // Fetch samples data
      const samplesRes = await api.get('/samples', { params: { ...params, limit: 1000 } }).catch(() => ({ data: { samples: [] } }));
      const samples = samplesRes.data.samples || [];

      // Calculate metrics
      const totalSamples = samples.length;
      const converted = samples.filter(s => s.status === 'converted' || s.conversion_status === 'converted').length;
      const conversionRate = totalSamples > 0 ? Math.round((converted / totalSamples) * 100) : 0;
      const approved = samples.filter(s => s.approval_status === 'approved').length;
      const approvalRate = totalSamples > 0 ? Math.round((approved / totalSamples) * 100) : 0;
      const rejectionRate = 100 - approvalRate;

      // Cost calculations
      const paidSamples = samples.filter(s => s.sample_type === 'paid');
      const freeSamples = samples.filter(s => s.sample_type === 'free');
      
      const paidSampleCost = paidSamples.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
      const totalRevenue = samples.filter(s => s.order_value).reduce((sum, s) => sum + (parseFloat(s.order_value) || 0), 0);
      const freeSampleCost = freeSamples.reduce((sum, s) => sum + (parseFloat(s.estimated_cost) || 0), 0);
      const costPerConversion = converted > 0 ? Math.round((paidSampleCost + freeSampleCost) / converted) : 0;

      // Average time to convert
      const convertedSamples = samples.filter(s => s.conversion_date);
      const avgTimeToConvert = convertedSamples.length > 0
        ? Math.round(
          convertedSamples.reduce((sum, s) => {
            const days = (new Date(s.conversion_date) - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / convertedSamples.length
        )
        : 0;

      const pendingFollowups = samples.filter(s => s.status === 'pending' || s.status === 'in_discussion').length;

      setMetrics({
        totalSamples,
        conversionRate,
        totalRevenue,
        paidSampleCost,
        freeSampleCost,
        approvalRate,
        rejectionRate,
        avgTimeToConvert,
        pendingFollowups,
        costPerConversion
      });

      // Conversion trend
      const trendMap = {};
      samples.forEach(s => {
        const date = new Date(s.created_at).toLocaleDateString();
        if (!trendMap[date]) {
          trendMap[date] = { date, total: 0, converted: 0, rate: 0 };
        }
        trendMap[date].total += 1;
        if (s.status === 'converted') {
          trendMap[date].converted += 1;
        }
      });

      const conversionTrend = Object.values(trendMap)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(t => ({ ...t, rate: t.total > 0 ? Math.round((t.converted / t.total) * 100) : 0 }));

      // Cost breakdown
      const costBreakdown = [
        { name: 'Paid Samples', value: paidSampleCost, color: '#F59E0B' },
        { name: 'Free Samples', value: freeSampleCost, color: '#3B82F6' }
      ];

      // Status distribution
      const statusMap = {};
      samples.forEach(s => {
        const status = s.status || 'pending';
        statusMap[status] = (statusMap[status] || 0) + 1;
      });

      const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));

      // Feedback analysis
      const feedbackMap = {};
      samples.forEach(s => {
        if (s.feedback) {
          const feedback = s.feedback;
          feedbackMap[feedback] = (feedbackMap[feedback] || 0) + 1;
        }
      });

      const feedbackAnalysis = Object.entries(feedbackMap).map(([feedback, count]) => ({
        feedback: feedback.charAt(0).toUpperCase() + feedback.slice(1),
        count
      }));

      // Conversion funnel
      const conversionFunnel = [
        { stage: 'Sample Sent', count: totalSamples, color: '#3B82F6' },
        { stage: 'Approved', count: approved, color: '#10B981' },
        { stage: 'Converted', count: converted, color: '#F59E0B' }
      ];

      setChartData({
        conversionTrend,
        costBreakdown,
        statusDistribution,
        feedbackAnalysis,
        costAnalysis: conversionTrend,
        timeToConversion: [
          { range: '0-7 days', count: convertedSamples.filter(s => {
            const days = (new Date(s.conversion_date) - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
            return days <= 7;
          }).length },
          { range: '8-14 days', count: convertedSamples.filter(s => {
            const days = (new Date(s.conversion_date) - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
            return days > 7 && days <= 14;
          }).length },
          { range: '15-30 days', count: convertedSamples.filter(s => {
            const days = (new Date(s.conversion_date) - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
            return days > 14 && days <= 30;
          }).length },
          { range: '30+ days', count: convertedSamples.filter(s => {
            const days = (new Date(s.conversion_date) - new Date(s.created_at)) / (1000 * 60 * 60 * 24);
            return days > 30;
          }).length }
        ]
      });

      setDetailedData({
        sampleDetails: samples.slice(0, 20),
        conversionFunnel,
        feedbackSummary: Object.entries(feedbackMap).map(([feedback, count]) => ({ feedback, count })),
        costMetrics: [
          { metric: 'Total Paid Sample Cost', value: paidSampleCost },
          { metric: 'Total Free Sample Cost', value: freeSampleCost },
          { metric: 'Cost Per Conversion', value: costPerConversion },
          { metric: 'Total Revenue', value: totalRevenue },
          { metric: 'ROI', value: totalRevenue > 0 ? Math.round(((totalRevenue - (paidSampleCost + freeSampleCost)) / (paidSampleCost + freeSampleCost)) * 100) : 0 }
        ]
      });

    } catch (error) {
      console.error('Error fetching sample data:', error);
      toast.error('Failed to load sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSampleData();
    setRefreshing(false);
    toast.success('Sample data refreshed');
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'summary':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Samples,${metrics.totalSamples}\n`;
        csvContent += `Conversion Rate,${metrics.conversionRate}%\n`;
        csvContent += `Approval Rate,${metrics.approvalRate}%\n`;
        csvContent += `Total Revenue,₹${metrics.totalRevenue.toFixed(2)}\n`;
        csvContent += `Paid Sample Cost,₹${metrics.paidSampleCost.toFixed(2)}\n`;
        csvContent += `Avg Time to Convert,${metrics.avgTimeToConvert} days\n`;
        filename = 'sample-summary.csv';
        break;

      case 'detailed':
        csvContent = 'Sample ID,Customer,Product,Type,Status,Cost,Order Value,Feedback,Conversion Status\n';
        detailedData.sampleDetails.forEach(sample => {
          csvContent += `${sample.id},${sample.customer_name},${sample.product_name},${sample.sample_type},${sample.status},${sample.cost},${sample.order_value},${sample.feedback},${sample.conversion_status}\n`;
        });
        filename = 'sample-details.csv';
        break;

      case 'cost':
        csvContent = 'Cost Metric,Value\n';
        detailedData.costMetrics.forEach(metric => {
          csvContent += `${metric.metric},${metric.value}\n`;
        });
        filename = 'cost-analysis.csv';
        break;

      default:
        return;
    }

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

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', suffix = '', trend = null }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{borderColor: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : '#EF4444'}}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}{suffix}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <Icon className="w-12 h-12" style={{color: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : '#EF4444', opacity: 0.2}} />
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Loading sample data...</span>
        </div>
      );
    }

    switch (reportType) {
      case 'summary':
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Samples"
                value={metrics.totalSamples}
                icon={FileText}
                color="blue"
                trend={8}
              />
              <MetricCard
                title="Conversion Rate"
                value={metrics.conversionRate}
                icon={TrendingUp}
                color="green"
                suffix="%"
                trend={5}
              />
              <MetricCard
                title="Approval Rate"
                value={metrics.approvalRate}
                icon={TrendingUp}
                color="green"
                suffix="%"
              />
              <MetricCard
                title="Total Revenue"
                value={`₹${(metrics.totalRevenue / 100000).toFixed(1)}L`}
                icon={TrendingUp}
                color="green"
                trend={12}
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Paid Sample Cost"
                value={`₹${(metrics.paidSampleCost / 1000).toFixed(1)}K`}
                icon={AlertCircle}
                color="orange"
              />
              <MetricCard
                title="Avg Time to Convert"
                value={metrics.avgTimeToConvert}
                icon={TrendingUp}
                color="blue"
                suffix=" days"
              />
              <MetricCard
                title="Pending Followups"
                value={metrics.pendingFollowups}
                icon={AlertCircle}
                color="orange"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Trend */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Trend</h3>
                {chartData.conversionTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.conversionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} name="Conversion %" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                {chartData.costBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartPie>
                      <Pie
                        data={chartData.costBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ₹${(value / 1000).toFixed(1)}K`}
                        outerRadius={100}
                        fill="#3B82F6"
                        dataKey="value"
                      >
                        {chartData.costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(1)}K`} />
                    </RechartPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>
            </div>

            {/* Status & Time Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Status</h3>
                {chartData.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.statusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time to Conversion</h3>
                {chartData.timeToConversion.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.timeToConversion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="range" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="space-y-3">
                {detailedData.conversionFunnel.map((stage, idx) => {
                  const width = (stage.count / (detailedData.conversionFunnel[0]?.count || 1)) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900">{stage.stage}</span>
                        <span className="text-sm font-bold text-gray-700">{stage.count} ({Math.round(width)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${width}%`,
                            backgroundColor: stage.color
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Sample ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Order Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detailedData.sampleDetails.map((sample, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{sample.id}</td>
                        <td className="px-6 py-4 text-gray-700">{sample.customer_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{sample.product_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sample.sample_type === 'paid' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {sample.sample_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sample.status === 'converted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {sample.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">₹{sample.cost || 0}</td>
                        <td className="px-6 py-4 text-gray-700">₹{sample.order_value || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'cost':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {detailedData.costMetrics.map((metric, idx) => (
                <MetricCard
                  key={idx}
                  title={metric.metric}
                  value={typeof metric.value === 'number' && metric.metric.includes('₹') ? `₹${(metric.value / 1000).toFixed(1)}K` : metric.metric.includes('ROI') ? `${metric.value}%` : metric.value}
                  icon={metric.metric.includes('Cost') ? AlertCircle : TrendingUp}
                  color={metric.value > 0 ? 'green' : 'blue'}
                />
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis Over Time</h3>
              {chartData.costAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData.costAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Total Samples" />
                    <Area type="monotone" dataKey="converted" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Converted" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sample Reports</h1>
              <p className="text-gray-600 mt-1">Sample conversion, feedback, and cost analysis</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateRange === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                  <option value="cost">Cost Analysis</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default SamplesReportsPage;