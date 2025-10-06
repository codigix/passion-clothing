
import React from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

const stats = {
  totalRevenue: 4250000,
  totalExpenses: 2850000,
  netProfit: 1400000,
  outstandingReceivables: 850000,
  outstandingPayables: 650000,
  cashFlow: 750000
};

const FinanceReportsPage = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Financial Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
          icon={<TrendingUp className="w-6 h-6" />}
          colorClasses="bg-emerald-100 text-emerald-600"
          subtitle="This month"
          trend={12.5}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${(stats.totalExpenses / 100000).toFixed(1)}L`}
          icon={<TrendingDown className="w-6 h-6" />}
          colorClasses="bg-rose-100 text-rose-600"
          subtitle="This month"
          trend={-8.2}
        />
        <StatCard
          title="Net Profit"
          value={`₹${(stats.netProfit / 100000).toFixed(1)}L`}
          icon={<DollarSign className="w-6 h-6" />}
          colorClasses="bg-primary-100 text-primary-600"
          subtitle="This month"
          trend={15.3}
        />
        <StatCard
          title="Cash Flow"
          value={`₹${(stats.cashFlow / 100000).toFixed(1)}L`}
          icon={<FileText className="w-6 h-6" />}
          colorClasses="bg-sky-100 text-sky-600"
          subtitle="Operating cash flow"
          trend={6.1}
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Export Financial Data</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
          <Download size={18} /> Export as CSV
        </button>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon, colorClasses = 'bg-blue-100 text-blue-600', subtitle, trend }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          {typeof trend === 'number' && (
            <div className="flex items-center gap-1 mt-2 text-sm">
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
        <div className={`rounded-full p-3 flex items-center justify-center ${colorClasses}`}>{icon}</div>
      </div>
    </div>
  );
}

export default FinanceReportsPage;
