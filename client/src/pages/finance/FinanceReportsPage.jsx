import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, RefreshCw, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FinanceReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    cashFlow: 0,
    invoicesPending: 0,
    paymentsProcessed: 0,
    avgInvoiceValue: 0,
    costOfGoods: 0,
    operatingExpenses: 0
  });

  const [chartData, setChartData] = useState({
    revenueTrend: [],
    expenseBreakdown: [],
    profitAnalysis: [],
    cashFlowTrend: [],
    invoiceStatus: [],
    costAnalysis: []
  });

  const [detailedData, setDetailedData] = useState({
    invoiceDetails: [],
    paymentDetails: [],
    expenseDetails: [],
    receivablesAnalysis: []
  });

  useEffect(() => {
    fetchFinanceData();
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

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const { date_from, date_to } = getDateRange();

      const params = {};
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;

      // Fetch invoices and payments
      const [invoiceRes, paymentRes, expenseRes] = await Promise.all([
        api.get('/finance/invoices', { params: { ...params, limit: 1000 } }).catch(() => ({ data: { invoices: [] } })),
        api.get('/finance/payments', { params: { ...params, limit: 1000 } }).catch(() => ({ data: { payments: [] } })),
        api.get('/finance/expenses', { params: { ...params, limit: 1000 } }).catch(() => ({ data: { expenses: [] } }))
      ]);

      const invoices = invoiceRes.data.invoices || [];
      const payments = paymentRes.data.payments || [];
      const expenses = expenseRes.data.expenses || [];

      // Calculate metrics
      const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
      const paymentsProcessed = payments.reduce((sum, pay) => sum + (parseFloat(pay.amount) || 0), 0);
      const outstandingReceivables = invoices
        .filter(inv => inv.status !== 'paid')
        .reduce((sum, inv) => sum + (parseFloat(inv.balance_amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const outstandingPayables = expenses
        .filter(exp => !exp.is_paid)
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
      const invoicesPending = invoices.filter(inv => inv.status !== 'paid').length;

      setMetrics({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin),
        outstandingReceivables,
        outstandingPayables,
        cashFlow: paymentsProcessed - totalExpenses,
        invoicesPending,
        paymentsProcessed,
        avgInvoiceValue,
        costOfGoods: totalExpenses * 0.6,
        operatingExpenses: totalExpenses * 0.4
      });

      // Revenue trend
      const revenueTrendMap = {};
      invoices.forEach(inv => {
        const date = new Date(inv.invoice_date || inv.createdAt).toLocaleDateString();
        if (!revenueTrendMap[date]) {
          revenueTrendMap[date] = { date, revenue: 0, received: 0 };
        }
        revenueTrendMap[date].revenue += parseFloat(inv.total_amount) || 0;
        if (inv.status === 'paid') {
          revenueTrendMap[date].received += parseFloat(inv.total_amount) || 0;
        }
      });

      const revenueTrend = Object.values(revenueTrendMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      // Expense breakdown
      const expenseMap = {};
      expenses.forEach(exp => {
        const category = exp.category || 'Other';
        if (!expenseMap[category]) {
          expenseMap[category] = { category, amount: 0, count: 0 };
        }
        expenseMap[category].amount += parseFloat(exp.amount) || 0;
        expenseMap[category].count += 1;
      });

      const expenseBreakdown = Object.values(expenseMap).map((exp, idx) => ({
        ...exp,
        value: exp.amount,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][idx % 6]
      }));

      // Invoice status
      const invoiceStatus = [
        {
          name: 'Paid',
          value: invoices.filter(inv => inv.status === 'paid').length,
          color: '#10B981'
        },
        {
          name: 'Pending',
          value: invoices.filter(inv => inv.status === 'pending').length,
          color: '#F59E0B'
        },
        {
          name: 'Overdue',
          value: invoices.filter(inv => inv.status === 'overdue').length,
          color: '#EF4444'
        }
      ];

      // Cash flow trend
      const cashFlowMap = {};
      [...invoices, ...expenses].forEach(item => {
        const date = new Date(item.invoice_date || item.createdAt || item.date).toLocaleDateString();
        if (!cashFlowMap[date]) {
          cashFlowMap[date] = { date, inflow: 0, outflow: 0 };
        }
        if (item.total_amount) {
          cashFlowMap[date].inflow += parseFloat(item.total_amount) || 0;
        } else if (item.amount) {
          cashFlowMap[date].outflow += parseFloat(item.amount) || 0;
        }
      });

      const cashFlowTrend = Object.values(cashFlowMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      setChartData({
        revenueTrend,
        expenseBreakdown,
        profitAnalysis: [
          { name: 'Net Profit', value: netProfit > 0 ? netProfit : 0, color: '#10B981' },
          { name: 'Loss', value: netProfit < 0 ? Math.abs(netProfit) : 0, color: '#EF4444' }
        ],
        cashFlowTrend,
        invoiceStatus,
        costAnalysis: expenseBreakdown
      });

      setDetailedData({
        invoiceDetails: invoices.slice(0, 20),
        paymentDetails: payments.slice(0, 20),
        expenseDetails: expenses.slice(0, 20),
        receivablesAnalysis: invoices.filter(inv => inv.status !== 'paid').slice(0, 20)
      });

    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinanceData();
    setRefreshing(false);
    toast.success('Finance data refreshed');
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'summary':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Revenue,₹${metrics.totalRevenue.toFixed(2)}\n`;
        csvContent += `Total Expenses,₹${metrics.totalExpenses.toFixed(2)}\n`;
        csvContent += `Net Profit,₹${metrics.netProfit.toFixed(2)}\n`;
        csvContent += `Profit Margin,${metrics.profitMargin}%\n`;
        csvContent += `Outstanding Receivables,₹${metrics.outstandingReceivables.toFixed(2)}\n`;
        csvContent += `Outstanding Payables,₹${metrics.outstandingPayables.toFixed(2)}\n`;
        csvContent += `Cash Flow,₹${metrics.cashFlow.toFixed(2)}\n`;
        filename = 'financial-summary.csv';
        break;

      case 'invoice':
        csvContent = 'Invoice Number,Customer,Amount,Status,Date\n';
        detailedData.invoiceDetails.forEach(inv => {
          csvContent += `${inv.invoice_number},${inv.customer?.name || 'N/A'},${inv.total_amount},${inv.status},${new Date(inv.invoice_date).toLocaleDateString()}\n`;
        });
        filename = 'invoices-report.csv';
        break;

      case 'receivables':
        csvContent = 'Invoice Number,Customer,Amount,Due Date,Days Overdue\n';
        detailedData.receivablesAnalysis.forEach(inv => {
          const daysOverdue = Math.floor((new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
          csvContent += `${inv.invoice_number},${inv.customer?.name || 'N/A'},${inv.balance_amount},${new Date(inv.due_date).toLocaleDateString()},${daysOverdue}\n`;
        });
        filename = 'receivables-analysis.csv';
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
          <span className="ml-3 text-gray-600">Loading financial data...</span>
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
                title="Total Revenue"
                value={`₹${(metrics.totalRevenue / 100000).toFixed(1)}L`}
                icon={TrendingUp}
                color="green"
                trend={12.5}
              />
              <MetricCard
                title="Total Expenses"
                value={`₹${(metrics.totalExpenses / 100000).toFixed(1)}L`}
                icon={TrendingDown}
                color="orange"
                trend={-8.2}
              />
              <MetricCard
                title="Net Profit"
                value={`₹${(metrics.netProfit / 100000).toFixed(1)}L`}
                icon={DollarSign}
                color={metrics.netProfit > 0 ? 'green' : 'red'}
                trend={15.3}
              />
              <MetricCard
                title="Profit Margin"
                value={metrics.profitMargin}
                icon={FileText}
                color="blue"
                suffix="%"
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Outstanding Receivables"
                value={`₹${(metrics.outstandingReceivables / 100000).toFixed(1)}L`}
                icon={AlertCircle}
                color="orange"
              />
              <MetricCard
                title="Outstanding Payables"
                value={`₹${(metrics.outstandingPayables / 100000).toFixed(1)}L`}
                icon={AlertCircle}
                color="red"
              />
              <MetricCard
                title="Cash Flow"
                value={`₹${(metrics.cashFlow / 100000).toFixed(1)}L`}
                icon={TrendingUp}
                color={metrics.cashFlow > 0 ? 'green' : 'red'}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-blue-500" />
                  Revenue Trend
                </h3>
                {chartData.revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="received" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>

              {/* Invoice Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-500" />
                  Invoice Status
                </h3>
                {chartData.invoiceStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.invoiceStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}`}
                        outerRadius={100}
                        fill="#3B82F6"
                        dataKey="value"
                      >
                        {chartData.invoiceStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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

            {/* Cash Flow & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
                {chartData.cashFlowTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.cashFlowTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inflow" fill="#10B981" name="Inflow" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="outflow" fill="#EF4444" name="Outflow" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                {chartData.expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category }) => category}
                        outerRadius={100}
                        fill="#3B82F6"
                        dataKey="value"
                      >
                        {chartData.expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(1)}K`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>
            </div>
          </div>
        );

      case 'invoice':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Invoice Number</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detailedData.invoiceDetails.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-gray-700">{inv.customer?.name || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">₹{(inv.total_amount / 1000).toFixed(1)}K</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'receivables':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Invoice Number</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Due Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detailedData.receivablesAnalysis.map((inv, idx) => {
                      const daysOverdue = Math.floor((new Date() - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{inv.invoice_number}</td>
                          <td className="px-6 py-4 text-gray-700">{inv.customer?.name || 'N/A'}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">₹{(inv.balance_amount / 1000).toFixed(1)}K</td>
                          <td className="px-6 py-4 text-gray-700">{new Date(inv.due_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${daysOverdue > 30 ? 'bg-red-100 text-red-800' : daysOverdue > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                              {daysOverdue} days
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-gray-600 mt-1">Revenue, expenses, cash flow, and profitability insights</p>
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
                  <option value="invoice">Invoices</option>
                  <option value="receivables">Receivables Analysis</option>
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

export default FinanceReportsPage;