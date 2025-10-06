import React, { useState } from 'react';
import { FaIndustry, FaTachometerAlt, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const ManufacturingReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('summary');
  const [metrics, setMetrics] = useState({
    totalProduction: 2850,
    productionEfficiency: 87,
    qualityRate: 94,
    onTimeDelivery: 91
  });
  const [chartData, setChartData] = useState({
    productionTrend: [
      { date: '2024-01-01', production: 200 },
      { date: '2024-01-02', production: 250 },
      { date: '2024-01-03', production: 300 },
      { date: '2024-01-04', production: 280 },
      { date: '2024-01-05', production: 320 }
    ],
    qualityAnalysis: [
      { name: 'Passed', value: 94, color: '#4caf50' },
      { name: 'Failed', value: 6, color: '#f44336' }
    ],
    efficiencyVsTarget: [
      { month: 'Jan', efficiency: 85, target: 90 },
      { month: 'Feb', efficiency: 87, target: 90 },
      { month: 'Mar', efficiency: 89, target: 90 }
    ]
  });
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/manufacturing/reports?type=${reportType}&dateRange=${dateRange}`);
      setMetrics(response.data.metrics);
      setChartData(response.data.charts);
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback to mock data
      setMetrics({
        totalProduction: 2850,
        productionEfficiency: 87,
        qualityRate: 94,
        onTimeDelivery: 91
      });
      setChartData({
        productionTrend: [
          { date: '2024-01-01', production: 200 },
          { date: '2024-01-02', production: 250 },
          { date: '2024-01-03', production: 300 },
          { date: '2024-01-04', production: 280 },
          { date: '2024-01-05', production: 320 }
        ],
        qualityAnalysis: [
          { name: 'Passed', value: 94, color: '#4caf50' },
          { name: 'Failed', value: 6, color: '#f44336' }
        ],
        efficiencyVsTarget: [
          { month: 'Jan', efficiency: 85, target: 90 },
          { month: 'Feb', efficiency: 87, target: 90 },
          { month: 'Mar', efficiency: 89, target: 90 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon, color = 'primary', suffix = '' }) => (
    <div className="p-6 bg-white text-gray-800 rounded shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 flex justify-between items-center ">
      <div>
        <div className="text-gray-500 text-sm mb-1">{title}</div>
        <div className={`text-2xl font-bold ${color === 'success' ? 'text-green-500' : color === 'info' ? 'text-blue-500' : color === 'warning' ? 'text-yellow-500' : 'text-primary'}`}>{value}{suffix}</div>
      </div>
      <div className={`text-3xl ${color === 'success' ? 'text-green-500' : color === 'info' ? 'text-blue-500' : color === 'warning' ? 'text-yellow-500' : 'text-primary'}`}>{icon}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Manufacturing Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="summary">Summary</option>
              <option value="production">Production Analysis</option>
              <option value="efficiency">Efficiency Report</option>
              <option value="quality">Quality Report</option>
              <option value="capacity">Capacity Utilization</option>
              <option value="downtime">Downtime Analysis</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </>
          )}
          <div>
            <button
              className="w-full py-2 rounded bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-50"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Production"
          value={metrics.totalProduction.toLocaleString()}
          icon={<FaIndustry />}
          color="primary"
          suffix=" units"
        />
        <MetricCard
          title="Production Efficiency"
          value={metrics.productionEfficiency}
          icon={<FaTachometerAlt />}
          color="info"
          suffix="%"
        />
        <MetricCard
          title="Quality Rate"
          value={metrics.qualityRate}
          icon={<FaCheckCircle />}
          color="success"
          suffix="%"
        />
        <MetricCard
          title="On-Time Delivery"
          value={metrics.onTimeDelivery}
          icon={<FaChartLine />}
          color="warning"
          suffix="%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Production Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.productionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="production" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quality Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.qualityAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.qualityAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Efficiency vs Target</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.efficiencyVsTarget}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="efficiency" fill="#8884d8" />
            <Bar dataKey="target" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ManufacturingReportsPage;