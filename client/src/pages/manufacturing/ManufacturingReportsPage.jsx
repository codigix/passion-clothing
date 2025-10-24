import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Factory, Gauge, CheckCircle, AlertCircle,
  Download, Printer, RefreshCw, Clock, Activity, Zap
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ManufacturingReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalProduction: 0,
    totalOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0,
    qualityRate: 0,
    productionEfficiency: 0,
    delayedOrders: 0,
    onTimeDelivery: 0,
    defectRate: 0,
    rejectedBatches: 0
  });

  const [detailedReport, setDetailedReport] = useState([]);
  const [stageReport, setStageReport] = useState([]);
  const [qualityReport, setQualityReport] = useState([]);

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

      // Fetch production orders and stages with error handling
      const [ordersResponse, stagesResponse] = await Promise.all([
        api.get('/manufacturing/orders', { params: { ...params, limit: 1000 } })
          .catch(() => ({ data: { orders: [] } })),
        api.get('/manufacturing/stages', { params: { ...params, limit: 1000 } })
          .catch(() => ({ data: { stages: [] } }))
      ]);

      const orders = ordersResponse.data.orders || [];
      const stages = stagesResponse.data.stages || [];

      // Calculate metrics
      const totalProduction = orders.reduce((sum, o) => sum + (parseFloat(o.quantity) || 0), 0);
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const inProgressOrders = orders.filter(o => o.status === 'in_progress' || o.status === 'in_production').length;
      const delayedOrders = orders.filter(o => o.deadline && new Date(o.deadline) < new Date() && o.status !== 'completed').length;
      const rejectedBatches = stages.filter(s => s.status === 'rejected').length;

      // Calculate quality metrics
      const totalStages = stages.length;
      const passedStages = stages.filter(s => s.status === 'completed').length;
      const qualityRate = totalStages > 0 ? (passedStages / totalStages) * 100 : 0;
      const defectRate = 100 - qualityRate;

      // On-time delivery
      const completedOnTime = orders.filter(o => 
        o.status === 'completed' && o.deadline && new Date(o.completed_date) <= new Date(o.deadline)
      ).length;
      const onTimeDelivery = completedOrders > 0 ? (completedOnTime / completedOrders) * 100 : 0;

      // Production efficiency (70-100%)
      const productionEfficiency = Math.min(100, qualityRate * 1.1);

      setMetrics({
        totalProduction,
        totalOrders: orders.length,
        completedOrders,
        inProgressOrders,
        qualityRate: Math.round(qualityRate * 10) / 10,
        productionEfficiency: Math.round(productionEfficiency * 10) / 10,
        delayedOrders,
        onTimeDelivery: Math.round(onTimeDelivery * 10) / 10,
        defectRate: Math.round(defectRate * 10) / 10,
        rejectedBatches
      });

      // Detailed report - all orders
      setDetailedReport(orders);

      // Stage report
      const stageMap = {};
      stages.forEach(stage => {
        const stageName = stage.stage_name || 'Unknown';
        if (!stageMap[stageName]) {
          stageMap[stageName] = {
            stage: stageName,
            totalCount: 0,
            completedCount: 0,
            rejectedCount: 0,
            avgTime: 0
          };
        }
        stageMap[stageName].totalCount += 1;
        if (stage.status === 'completed') stageMap[stageName].completedCount += 1;
        if (stage.status === 'rejected') stageMap[stageName].rejectedCount += 1;
      });
      
      setStageReport(Object.values(stageMap));

      // Quality report - rejections
      const qualityData = stages
        .filter(s => s.status === 'rejected')
        .map(s => ({
          stage: s.stage_name || 'Unknown',
          reason: s.rejection_reason || 'Not specified',
          date: s.createdAt || s.created_at,
          orderId: s.production_order_id
        }));

      setQualityReport(qualityData);

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
        csvContent += `Total Production,${metrics.totalProduction} units\n`;
        csvContent += `Total Orders,${metrics.totalOrders}\n`;
        csvContent += `Completed Orders,${metrics.completedOrders}\n`;
        csvContent += `In Progress,${metrics.inProgressOrders}\n`;
        csvContent += `Quality Rate,${metrics.qualityRate}%\n`;
        csvContent += `Production Efficiency,${metrics.productionEfficiency}%\n`;
        csvContent += `On-Time Delivery,${metrics.onTimeDelivery}%\n`;
        csvContent += `Defect Rate,${metrics.defectRate}%\n`;
        csvContent += `Delayed Orders,${metrics.delayedOrders}\n`;
        csvContent += `Rejected Batches,${metrics.rejectedBatches}\n`;
        filename = 'manufacturing-summary-report.csv';
        break;

      case 'detailed':
        csvContent = 'Order ID,Product,Quantity,Status,Started,Deadline,Quality Rate\n';
        detailedReport.forEach(order => {
          const startedDate = order.started_date || order.createdAt || '';
          const deadlineDate = order.deadline || '';
          csvContent += `${order.id},${order.product_name || 'N/A'},${order.quantity || 0},${order.status},${new Date(startedDate).toLocaleDateString()},${new Date(deadlineDate).toLocaleDateString()},${order.quality_rate || 'N/A'}\n`;
        });
        filename = 'manufacturing-detailed-report.csv';
        break;

      case 'stage':
        csvContent = 'Stage,Total,Completed,Rejected,Success Rate\n';
        stageReport.forEach(stage => {
          const successRate = stage.totalCount > 0 ? ((stage.completedCount / stage.totalCount) * 100).toFixed(1) : 0;
          csvContent += `${stage.stage},${stage.totalCount},${stage.completedCount},${stage.rejectedCount},${successRate}%\n`;
        });
        filename = 'manufacturing-stage-report.csv';
        break;

      case 'quality':
        csvContent = 'Stage,Rejection Reason,Date,Order ID\n';
        qualityReport.forEach(item => {
          csvContent += `${item.stage},${item.reason},${new Date(item.date).toLocaleDateString()},${item.orderId}\n`;
        });
        filename = 'manufacturing-quality-report.csv';
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
                <div className="text-sm text-gray-600 mb-1">In Progress</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.inProgressOrders}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-yellow-500">
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.completedOrders}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">Delayed Orders</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.delayedOrders}</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-green-500">
                <div className="text-sm text-gray-600 mb-1">Quality Rate</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.qualityRate.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-cyan-500">
                <div className="text-sm text-gray-600 mb-1">Production Efficiency</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.productionEfficiency.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%</div>
              </div>
              <div className="bg-white rounded shadow p-4 border-l-4 border-purple-500">
                <div className="text-sm text-gray-600 mb-1">On-Time Delivery</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.onTimeDelivery.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%</div>
              </div>
            </div>

            {/* Production & Quality Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Production Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-gray-700">Total Units</span>
                    <span className="font-semibold text-blue-700">{metrics.totalProduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="text-gray-700">Total Orders</span>
                    <span className="font-semibold text-yellow-700">{metrics.totalOrders}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Quality Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-700">Defect Rate</span>
                    <span className="font-semibold text-red-600">{metrics.defectRate.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-gray-700">Rejected Batches</span>
                    <span className="font-semibold text-red-700">{metrics.rejectedBatches}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started Date</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedReport.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No production orders found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    detailedReport.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-blue-600">{order.id}</td>
                        <td className="px-2 py-2 text-sm text-gray-900">{order.product_name || 'N/A'}</td>
                        <td className="px-2 py-2 text-sm text-right text-gray-900">{order.quantity || 0}</td>
                        <td className="px-2 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'in_progress' || order.status === 'in_production' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-600">{order.started_date ? new Date(order.started_date).toLocaleDateString('en-IN') : '-'}</td>
                        <td className="px-2 py-2 text-sm text-gray-600">{order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'stage':
        return (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                    <th className="px-2 py-2 text-xs text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stageReport.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No stage data found
                      </td>
                    </tr>
                  ) : (
                    stageReport.map((stage, index) => {
                      const successRate = stage.totalCount > 0 ? ((stage.completedCount / stage.totalCount) * 100).toFixed(1) : 0;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-2 py-2 text-sm font-medium text-gray-900">{stage.stage}</td>
                          <td className="px-2 py-2 text-sm text-right text-gray-900">{stage.totalCount}</td>
                          <td className="px-2 py-2 text-sm text-right text-green-600">{stage.completedCount}</td>
                          <td className="px-2 py-2 text-sm text-right text-red-600">{stage.rejectedCount}</td>
                          <td className="px-2 py-2 text-sm text-right font-medium text-blue-600">{successRate}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'quality':
        return (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Reason</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-2 py-2 text-xs text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {qualityReport.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        No quality issues found
                      </td>
                    </tr>
                  ) : (
                    qualityReport.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-gray-900">{item.stage}</td>
                        <td className="px-2 py-2 text-sm text-red-600">{item.reason}</td>
                        <td className="px-2 py-2 text-sm text-gray-600">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-2 py-2 text-sm text-blue-600">{item.orderId}</td>
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
              <Factory className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
          <h1 className="text-2xl font-bold text-gray-800">Manufacturing Reports</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive manufacturing reports and analytics</p>
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
              <option value="detailed">Detailed Orders</option>
              <option value="stage">By Stage</option>
              <option value="quality">Quality Issues</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded w-full">
              <div className="font-semibold text-blue-700">
                {reportType === 'summary' ? 'Summary View' :
                 reportType === 'detailed' ? `${detailedReport.length} Orders` :
                 reportType === 'stage' ? `${stageReport.length} Stages` :
                 reportType === 'quality' ? `${qualityReport.length} Issues` : 'View'}
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
          title="Total Production"
          value={metrics.totalProduction.toLocaleString('en-IN')}
          icon={<Factory className="w-8 h-8 text-blue-500" />}
          color="success"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={<Activity className="w-8 h-8 text-cyan-500" />}
          color="primary"
        />
        <MetricCard
          title="Quality Rate"
          value={`${metrics.qualityRate.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`}
          icon={<CheckCircle className="w-8 h-8 text-green-500" />}
          color="info"
        />
        <MetricCard
          title="On-Time Delivery"
          value={`${metrics.onTimeDelivery.toLocaleString('en-IN', { maximumFractionDigits: 1 })}%`}
          icon={<Clock className="w-8 h-8 text-yellow-500" />}
          color="warning"
        />
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default ManufacturingReportsPage;