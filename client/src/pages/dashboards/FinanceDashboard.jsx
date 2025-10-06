import React, { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  financeTabs,
  invoiceStatusStyles,
  invoiceTypeStyles,
  paymentStatusStyles,
  paymentTypeStyles,
  paymentModeStyles,
  cashFlowCategoryStyles,
  defaultBadgeStyles,
} from "../finance/financeConstants";
import {
  financeStats,
  financeKPIs,
  invoiceSummary,
  financeInvoices,
  financePayments,
  cashFlowEvents,
  financialHighlights,
  expenseBreakdown,
  complianceChecklist,
  budgetAlerts,
} from "../finance/financeData";
import {
  getIcon,
  formatCurrency,
  formatShortCurrency,
  formatPercentage,
  getBadgeClass,
  getTrendIndicator,
} from "../finance/financeUtilities";


const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("invoices");
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalPayments: 0,
    totalRevenue: 0,
    outstanding: 0
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await import('../../utils/api').then(m => m.default.get('/finance/dashboard/stats'));
      setStats(res.data);
    } catch (error) {
      setStats({ totalInvoices: 0, totalPayments: 0, totalRevenue: 0, outstanding: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            onClick={() => navigate("/finance/payments")}
          >
            <CreditCard className="h-4 w-4" /> Record Payment
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            onClick={() => navigate("/finance/create-invoice")}
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financeKPIs.map((kpi) => {
          const IconComponent = getIcon(kpi.icon);
          const trendDirection = getTrendIndicator(kpi.trend);
          const trendColor =
            trendDirection === "up"
              ? "text-emerald-600"
              : trendDirection === "down"
              ? "text-rose-600"
              : "text-gray-500";
          const trendIcon =
            trendDirection === "up" ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : trendDirection === "down" ? (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            ) : (
              <Clock className="h-4 w-4 text-gray-400" />
            );

          const colorClasses =
            kpi.color === "emerald"
              ? "bg-emerald-100 text-emerald-600"
              : kpi.color === "rose"
              ? "bg-rose-100 text-rose-600"
              : kpi.color === "primary"
              ? "bg-primary-100 text-primary-600"
              : kpi.color === "sky"
              ? "bg-sky-100 text-sky-600"
              : "bg-blue-100 text-blue-600";

          return (
            <div
              key={kpi.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {kpi.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {formatShortCurrency(kpi.value)}
                  </p>
                  {kpi.subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{kpi.subtitle}</p>
                  )}
                  {kpi.trend !== undefined && (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm">
                      {trendIcon}
                      <span className={trendColor}>{formatPercentage(kpi.trend)}</span>
                      <span className="text-gray-400">vs last month</span>
                    </div>
                  )}
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClasses}`}
                >
                  {IconComponent ? (
                    <IconComponent className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Outstanding Receivables</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-4 w-4" /> 4.2%
            </span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {formatShortCurrency(financeStats.outstandingReceivables)}
          </p>
          <p className="text-sm text-gray-600">
            Amount to be received from customers
          </p>
          <div className="space-y-2">
            {invoiceSummary.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  <span
                    className={`text-xs font-medium ${
                      item.trend >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatPercentage(item.trend)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Outstanding Payables</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
              <TrendingDown className="h-4 w-4" /> 2.1%
            </span>
          </div>
          <p className="text-3xl font-bold text-rose-600">
            {formatShortCurrency(financeStats.outstandingPayables)}
          </p>
          <p className="text-sm text-gray-600">Amount to be paid to vendors</p>
          <div className="space-y-3">
            {budgetAlerts.map((alert) => (
              <div key={alert.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{alert.title}</span>
                  <span
                    className={`text-xs font-medium ${
                      alert.status === "danger"
                        ? "text-rose-600"
                        : alert.status === "warning"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {alert.percentage}% used
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${
                      alert.status === "danger"
                        ? "bg-rose-500"
                        : alert.status === "warning"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${alert.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Compliance Checklist</h2>
            <span className="text-xs text-gray-500">This month</span>
          </div>
          <ul className="space-y-3">
            {complianceChecklist.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">Owner: {item.owner}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.status === "completed"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : item.status === "pending"
                      ? "border-amber-200 bg-amber-50 text-amber-600"
                      : "border-sky-200 bg-sky-50 text-sky-600"
                  }`}
                >
                  {item.status.replace("_", " ").toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Expense Breakdown</h2>
            <span className="text-xs text-gray-500">Current month</span>
          </div>
          <div className="space-y-3">
            {expenseBreakdown.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>{item.category}</span>
                  <span className="font-semibold">
                    {formatShortCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {item.percentage}% of total expenses
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Quick Search &amp; Filters</h3>
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice no, customer, vendor..."
                className="w-full rounded-md border border-gray-200 px-4 py-2.5 pl-9 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <select
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              <option value="all">All Invoices</option>
              <option value="sales">Sales Invoices</option>
              <option value="purchase">Purchase Invoices</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
              onClick={() => navigate("/finance/reports")}
            >
              Financial Reports
            </button>
          </div>
          <div className="md:col-span-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <Download className="h-4 w-4" /> Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex flex-wrap">
            {financeTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "invoices" && (
          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Invoices ({filteredInvoices.length})
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => navigate("/finance/invoices")}
                >
                  View All Invoices
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  onClick={() => navigate("/finance/create-invoice")}
                >
                  <Plus className="h-4 w-4" /> New Invoice
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Invoice No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer / Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {invoice.invoiceNo}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(invoiceTypeStyles, invoice.type, defaultBadgeStyles)
                          }`}
                        >
                          {invoice.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {invoice.customerVendor}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{invoice.dueDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                            getBadgeClass(invoiceStatusStyles, invoice.status, defaultBadgeStyles)
                          }`}
                        >
                          <span className="inline-flex h-2 w-2 rounded-full bg-current" />
                          {invoice.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-transparent p-2 text-primary-600 transition hover:border-primary-200 hover:bg-primary-50"
                            aria-label="View invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-transparent p-2 text-gray-500 transition hover:border-gray-200 hover:bg-gray-50"
                            aria-label="Edit invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Invoices
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {invoiceTotals.count}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Value
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {formatShortCurrency(invoiceTotals.value)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Collection Rate
                </div>
                <div className="mt-2 flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-5 w-5" /> 92%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Payments ({financePayments.length})
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => navigate("/finance/payments")}
                >
                  View All Payments
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  onClick={() => navigate("/finance/payments")}
                >
                  <CreditCard className="h-4 w-4" /> Record Payment
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Party
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment Mode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {financePayments.map((payment) => (
                    <tr key={payment.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {payment.paymentNo}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(paymentTypeStyles, payment.type, defaultBadgeStyles)
                          }`}
                        >
                          {payment.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{payment.party}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(paymentModeStyles, payment.paymentMode, defaultBadgeStyles)
                          }`}
                        >
                          {payment.paymentMode.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{payment.paymentDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                            getBadgeClass(paymentStatusStyles, payment.status, defaultBadgeStyles)
                          }`}
                        >
                          <span className="inline-flex h-2 w-2 rounded-full bg-current" />
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {payment.reference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Payments
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {paymentTotals.count}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Value
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {formatShortCurrency(paymentTotals.value)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cleared Ratio
                </div>
                <div className="mt-2 flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-5 w-5" /> 78%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cashFlow" && (
          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Cash Flow Insights
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                >
                  View Cash Flow Statement
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" /> Export Summary
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {cashFlowEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                        getBadgeClass(cashFlowCategoryStyles, event.category, defaultBadgeStyles)
                      }`}
                    >
                      {event.category.toUpperCase()}
                    </span>
                  </div>
                  <p
                    className={`mt-3 text-lg font-semibold ${
                      event.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {event.amount >= 0 ? "+" : "-"}
                    {formatShortCurrency(Math.abs(event.amount))}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">Ref: {event.reference}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {financialHighlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {highlight.label}
                    </p>
                    <p className="text-xs text-gray-500">{highlight.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {highlight.value}
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        highlight.direction === "up"
                          ? "text-emerald-600"
                          : highlight.direction === "down"
                          ? "text-rose-600"
                          : "text-gray-500"
                      }`}
                    >
                      {highlight.direction === "up" ? "+" : ""}
                      {highlight.change}% vs last month
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Financial Reports
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => navigate("/finance/reports")}
                >
                  View Detailed Reports
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" /> Export Reports
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {financeKPIs.map((kpi) => (
                <div
                  key={`${kpi.id}-report`}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {kpi.title}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {formatShortCurrency(kpi.value)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{kpi.subtitle}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                    {formatPercentage(kpi.trend)} vs last month
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">
                Integrate your accounting software (Tally, Zoho Books, QuickBooks) to sync live finance data.
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
              >
                <FileText className="h-4 w-4" /> Connect Integration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;