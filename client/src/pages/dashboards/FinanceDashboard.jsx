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
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
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
  const [kpis, setKpis] = useState([]);
  const [invoiceSummary, setInvoiceSummary] = useState([]);
  const [financeInvoices, setFinanceInvoices] = useState([]);
  const [financePayments, setFinancePayments] = useState([]);
  const [receivablesData, setReceivablesData] = useState([]);
  const [payablesData, setPayablesData] = useState({ totalPayables: 0, budgetAlerts: [] });
  const [expenseData, setExpenseData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [highlightsData, setHighlightsData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceViewModal, setShowInvoiceViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const api = (await import("../../utils/api")).default;
      
      const [kpisRes, summaryRes, invoicesRes, paymentsRes, receivablesRes, payablesRes, expenseRes, cashFlowRes, highlightsRes, complianceRes] = await Promise.all([
        api.get("/finance/dashboard/kpis"),
        api.get("/finance/dashboard/invoice-summary"),
        api.get("/finance/dashboard/recent-invoices"),
        api.get("/finance/dashboard/recent-payments"),
        api.get("/finance/dashboard/outstanding-receivables"),
        api.get("/finance/dashboard/outstanding-payables"),
        api.get("/finance/dashboard/expense-breakdown"),
        api.get("/finance/dashboard/cash-flow"),
        api.get("/finance/dashboard/financial-highlights"),
        api.get("/finance/dashboard/compliance"),
      ]);

      setKpis(kpisRes.data.kpis || []);
      setInvoiceSummary(summaryRes.data.summary || []);
      setFinanceInvoices(invoicesRes.data.invoices || []);
      setFinancePayments(paymentsRes.data.payments || []);
      setReceivablesData(receivablesRes.data.data || []);
      setPayablesData(payablesRes.data || { totalPayables: 0, budgetAlerts: [] });
      setExpenseData(expenseRes.data.expenses || []);
      setCashFlowData(cashFlowRes.data.cashFlowEvents || []);
      setHighlightsData(highlightsRes.data.highlights || []);
      setComplianceData(complianceRes.data.complianceChecklist || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setKpis([]);
      setInvoiceSummary([]);
      setFinanceInvoices([]);
      setFinancePayments([]);
      setReceivablesData([]);
      setPayablesData({ totalPayables: 0, budgetAlerts: [] });
      setExpenseData([]);
      setCashFlowData([]);
      setHighlightsData([]);
      setComplianceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceViewModal(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      toast.loading("Deleting invoice...");
      const api = (await import("../../utils/api")).default;
      await api.delete(`/finance/invoices/${invoiceId}`);
      toast.dismiss();
      toast.success("Invoice deleted successfully");
      fetchDashboardData();
    } catch (error) {
      toast.dismiss();
      console.error("Delete invoice error:", error);
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      toast.loading("Deleting payment...");
      const api = (await import("../../utils/api")).default;
      await api.delete(`/finance/payments/${paymentId}`);
      toast.dismiss();
      toast.success("Payment deleted successfully");
      fetchDashboardData();
    } catch (error) {
      toast.dismiss();
      console.error("Delete payment error:", error);
      toast.error(error.response?.data?.message || "Failed to delete payment");
    }
  };

  // Filter invoices based on filterType
  const filteredInvoices = React.useMemo(() => {
    if (filterType === "all") return financeInvoices;
    return financeInvoices.filter((inv) => inv.type === filterType);
  }, [filterType, financeInvoices]);

  // Invoice totals for summary cards
  const invoiceTotals = React.useMemo(
    () => ({
      count: filteredInvoices.length,
      value: filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    }),
    [filteredInvoices]
  );

  // Payment totals for summary cards
  const paymentTotals = React.useMemo(
    () => ({
      count: financePayments.length,
      value: financePayments.reduce((sum, p) => sum + p.amount, 0),
    }),
    [financePayments]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 space-y-3 p-3 md:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="mt-0.5 text-xs text-gray-600">Real-time financial overview and management</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            onClick={() => navigate("/finance/create-invoice")}
          >
            <Plus className="h-3 w-3" /> Create Invoice
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md"
            onClick={() => navigate("/finance/payments")}
          >
            <CreditCard className="h-3 w-3" /> Record Payment
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
            onClick={() => navigate("/finance/invoices")}
          >
            <FileText className="h-3 w-3" /> Process Invoices
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
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
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : trendDirection === "down" ? (
              <TrendingDown className="h-3 w-3 text-rose-500" />
            ) : (
              <Clock className="h-3 w-3 text-gray-400" />
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
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {kpi.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatShortCurrency(kpi.value)}
                  </p>
                  {kpi.subtitle && (
                    <p className="mt-1 text-xs text-gray-500">{kpi.subtitle}</p>
                  )}
                  {kpi.trend !== undefined && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-xs">
                      {trendIcon}
                      <span className={`font-semibold ${trendColor}`}>{formatPercentage(kpi.trend)}</span>
                      <span className="text-gray-400">vs last month</span>
                    </div>
                  )}
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${colorClasses}`}
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

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Outstanding Receivables
            </h2>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-2.5 w-2.5" /> 4.2%
            </span>
          </div>
          <p className="text-lg font-bold text-emerald-600 mb-0.5">
            {formatShortCurrency(receivablesData.reduce((sum, item) => sum + (item.value || 0), 0))}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            Amount to be received from customers
          </p>
          <div className="space-y-1">
            {receivablesData.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{item.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {typeof item.value === 'number' && item.value > 100 ? formatShortCurrency(item.value) : item.value}
                  </span>
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

        <div className="rounded-lg border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Outstanding Payables
            </h2>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
              <TrendingDown className="h-2.5 w-2.5" /> 2.1%
            </span>
          </div>
          <p className="text-lg font-bold text-rose-600 mb-0.5">
            {formatShortCurrency(payablesData.totalPayables || 0)}
          </p>
          <p className="text-xs text-gray-600 mb-2">Amount to be paid to vendors</p>
          <div className="space-y-1.5">
            {payablesData.budgetAlerts?.map((alert) => (
              <div key={alert.id} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs text-gray-600">
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
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full ${
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

        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Compliance Checklist
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">This month</span>
          </div>
          <ul className="space-y-1.5">
            {complianceData.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">Owner: {item.owner}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
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

        <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Expense Breakdown
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Current month</span>
          </div>
          <div className="space-y-1.5">
            {expenseData.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span>{item.category}</span>
                  <span className="font-semibold">
                    {formatShortCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-primary-500"
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

      {/* Search & Filters Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Quick Search &amp; Filters
        </h3>
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice no, customer, vendor..."
                className="w-full rounded border border-gray-200 px-3 py-2 pl-8 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <select
              className="w-full rounded border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
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
              className="w-full rounded border border-gray-200 px-3 py-2 text-xs text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
              onClick={() => navigate("/finance/reports")}
            >
              Financial Reports
            </button>
          </div>
          <div className="md:col-span-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1 rounded bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
            >
              <Download className="h-3.5 w-3.5" /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-3">
          <div className="flex flex-wrap -mb-px">
            {financeTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`px-3 py-2 text-xs font-semibold transition ${
                  activeTab === tab.key
                    ? "border-b-3 border-primary-600 text-primary-600 bg-white"
                    : "border-b-3 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "invoices" && (
          <div className="space-y-2 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Invoices ({filteredInvoices.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => navigate("/finance/invoices")}
                >
                  View All Invoices
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
                  onClick={() => navigate("/finance/create-invoice")}
                >
                  <Plus className="h-3 w-3" /> New Invoice
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Invoice No.
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Customer / Vendor
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Due Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredInvoices.map((invoice, idx) => (
                    <tr key={invoice.id} className={`transition hover:bg-primary-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        {invoice.invoiceNo}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(
                              invoiceTypeStyles,
                              invoice.type,
                              defaultBadgeStyles
                            )
                          }`}
                        >
                          {invoice.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-700 font-medium text-xs">
                        {invoice.customerVendor}
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-900 text-xs">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{invoice.dueDate}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(
                              invoiceStatusStyles,
                              invoice.status,
                              defaultBadgeStyles
                            )
                          }`}
                        >
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                          {invoice.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            className="rounded-lg border border-transparent p-1.5 text-primary-600 transition hover:border-primary-200 hover:bg-primary-50"
                            aria-label="View invoice"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-transparent p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                            aria-label="Delete invoice"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Total Invoices
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {invoiceTotals.count}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Total Value
                </div>
                <div className="text-lg font-bold text-emerald-600">
                  {formatShortCurrency(invoiceTotals.value)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-rose-50 to-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Collection Rate
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-600">92%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-2 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Payments ({financePayments.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => navigate("/finance/payments")}
                >
                  View All Payments
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
                  onClick={() => navigate("/finance/payments")}
                >
                  <CreditCard className="h-3 w-3" /> Record Payment
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Payment No.
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Party
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Payment Mode
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Payment Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                      Reference
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {financePayments.map((payment, idx) => (
                    <tr key={payment.id} className={`transition hover:bg-primary-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        {payment.paymentNo}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(
                              paymentTypeStyles,
                              payment.type,
                              defaultBadgeStyles
                            )
                          }`}
                        >
                          {payment.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-700 font-medium text-xs">{payment.party}</td>
                      <td className="px-3 py-2 font-semibold text-gray-900 text-xs">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(
                              paymentModeStyles,
                              payment.paymentMode,
                              defaultBadgeStyles
                            )
                          }`}
                        >
                          {payment.paymentMode.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{payment.paymentDate}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                            getBadgeClass(
                              paymentStatusStyles,
                              payment.status,
                              defaultBadgeStyles
                            )
                          }`}
                        >
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">
                        {payment.reference || "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          className="rounded-lg border border-transparent p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          aria-label="Delete payment"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded border border-gray-200 bg-gray-50 p-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Payments
                </div>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {paymentTotals.count}
                </div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Value
                </div>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {formatShortCurrency(paymentTotals.value)}
                </div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cleared Ratio
                </div>
                <div className="mt-1 flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4" /> 78%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cashFlow" && (
          <div className="space-y-2 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Cash Flow Insights
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                >
                  View Cash Flow Statement
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
                >
                  <Download className="h-3.5 w-3.5" /> Export Summary
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {cashFlowData.map((event) => (
                <div
                  key={event.id}
                  className="rounded border border-gray-200 bg-white p-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase whitespace-nowrap flex-shrink-0 ${
                        getBadgeClass(
                          cashFlowCategoryStyles,
                          event.category,
                          defaultBadgeStyles
                        )
                      }`}
                    >
                      {event.category.toUpperCase()}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      event.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {event.amount >= 0 ? "+" : "-"}
                    {formatShortCurrency(Math.abs(event.amount))}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Ref: {event.reference}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {highlightsData.map((highlight) => (
                <div
                  key={highlight.id}
                  className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      {highlight.label}
                    </p>
                    <p className="text-xs text-gray-500">{highlight.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
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
          <div className="space-y-2 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Financial Reports
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
                  onClick={() => navigate("/finance/reports")}
                >
                  View Detailed Reports
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
                >
                  <Download className="h-3.5 w-3.5" /> Export Reports
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {kpis.map((kpi) => (
                <div
                  key={`${kpi.id}-report`}
                  className="rounded border border-gray-200 bg-white p-2 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {kpi.title}
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    {formatShortCurrency(kpi.value)}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">{kpi.subtitle}</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-600">
                    {formatPercentage(kpi.trend)} vs last month
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-600">
                Integrate your accounting software (Tally, Zoho Books, QuickBooks) to sync live finance data.
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
              >
                <FileText className="h-3.5 w-3.5" /> Connect Integration
              </button>
            </div>
          </div>
        )}

      {/* Invoice View Modal */}
      {showInvoiceViewModal && selectedInvoice && (
        <InvoiceViewModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceViewModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}
      </div>
    </div>
  );
};

function InvoiceViewModal({ invoice, onClose }) {
  const getStatusColor = (status) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const po = invoice.purchaseOrder || invoice.po || {};
  const vendor = po.vendor || {};
  const customer = invoice.customer || {};
  const items = invoice.items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto py-2">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-sm font-semibold text-gray-900">Invoice Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2 space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded">
            <h3 className="text-xs font-semibold text-purple-900 mb-1.5">PO & Invoice Details</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Invoice #</p>
                <p className="font-semibold text-purple-900 text-xs">{invoice.invoiceNo || invoice.invoice_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">PO #</p>
                <p className="font-semibold text-purple-900 text-xs">{po.po_number || po.poNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Status</p>
                <p className={`text-xs font-semibold inline-block px-1.5 py-0.5 rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Invoice Date</p>
                <p className="font-semibold text-purple-900 text-xs">
                  {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-IN') : invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Priority</p>
                <p className="font-semibold text-purple-900 text-xs">{po.priority?.toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Due Date</p>
                <p className="font-semibold text-purple-900 text-xs">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded">
            <h3 className="text-xs font-semibold text-orange-900 mb-1.5">Vendor & Client Information</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-xs text-orange-600 font-medium uppercase">Vendor Name</p>
                <p className="font-semibold text-orange-900 text-xs">{vendor.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium uppercase">Vendor Email</p>
                <p className="font-semibold text-orange-900 text-xs">{vendor.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium uppercase">Vendor Phone</p>
                <p className="font-semibold text-orange-900 text-xs">{vendor.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium uppercase">Customer/Project</p>
                <p className="font-semibold text-orange-900 text-xs">{customer.name || invoice.customerVendor || po.project_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
              <h3 className="text-xs font-semibold text-blue-900 mb-1">Items & Quantities</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-1 px-1 font-semibold text-blue-900">Material</th>
                      <th className="text-right py-1 px-1 font-semibold text-blue-900">Qty</th>
                      <th className="text-right py-1 px-1 font-semibold text-blue-900">Rate</th>
                      <th className="text-right py-1 px-1 font-semibold text-blue-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-blue-100">
                        <td className="py-1 px-1 text-blue-900 text-xs">{item.product_name || item.fabric_name || item.name || 'N/A'}</td>
                        <td className="text-right py-1 px-1 text-blue-900 text-xs">{item.quantity || item.qty || 0}</td>
                        <td className="text-right py-1 px-1 text-blue-900 text-xs">₹{parseFloat(item.rate || item.price || 0).toLocaleString('en-IN')}</td>
                        <td className="text-right py-1 px-1 font-semibold text-blue-900 text-xs">₹{parseFloat((item.quantity || item.qty || 0) * (item.rate || item.price || 0)).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
            <h3 className="text-xs font-semibold text-green-900 mb-1.5">Financial Details</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-xs text-green-600 font-medium uppercase">Subtotal</p>
                <p className="font-semibold text-green-900 text-xs">₹{(invoice.subtotal || 0).toLocaleString('en-IN')}</p>
              </div>
              {(invoice.discount_amount || po.discount_amount) > 0 && (
                <div>
                  <p className="text-xs text-green-600 font-medium uppercase">Discount</p>
                  <p className="font-semibold text-green-900 text-xs">₹{(invoice.discount_amount || po.discount_amount || 0).toLocaleString('en-IN')}</p>
                </div>
              )}
              {(invoice.total_tax_amount || invoice.tax_amount) > 0 && (
                <div>
                  <p className="text-xs text-green-600 font-medium uppercase">Tax</p>
                  <p className="font-semibold text-green-900 text-xs">₹{(invoice.total_tax_amount || invoice.tax_amount || 0).toLocaleString('en-IN')}</p>
                </div>
              )}
              {(invoice.shipping_charges) > 0 && (
                <div>
                  <p className="text-xs text-green-600 font-medium uppercase">Shipping</p>
                  <p className="font-semibold text-green-900 text-xs">₹{(invoice.shipping_charges || 0).toLocaleString('en-IN')}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-green-600 font-medium uppercase">Total Amount</p>
                <p className="font-semibold text-sm text-green-900">₹{(invoice.total_amount || invoice.amount || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {po.delivery_address && (
            <div className="bg-cyan-50 border-l-4 border-cyan-500 p-2 rounded">
              <h3 className="text-xs font-semibold text-cyan-900 mb-1">Delivery Address</h3>
              <p className="text-xs text-cyan-900 whitespace-pre-wrap">{po.delivery_address}</p>
            </div>
          )}

          {(po.payment_terms || invoice.payment_terms || po.expected_delivery_date) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded">
              <h3 className="text-xs font-semibold text-yellow-900 mb-1.5">Payment Terms & Delivery</h3>
              <div className="space-y-1.5 text-xs">
                {(po.payment_terms || invoice.payment_terms) && (
                  <div>
                    <p className="text-xs text-yellow-600 font-medium uppercase">Payment Terms</p>
                    <p className="font-semibold text-yellow-900 text-xs">{po.payment_terms || invoice.payment_terms || 'N/A'}</p>
                  </div>
                )}
                {po.expected_delivery_date && (
                  <div>
                    <p className="text-xs text-yellow-600 font-medium uppercase">Expected Delivery</p>
                    <p className="font-semibold text-yellow-900 text-xs">{new Date(po.expected_delivery_date).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(po.special_instructions || po.terms_conditions) && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded">
              <h3 className="text-xs font-semibold text-indigo-900 mb-1">Special Instructions & Terms</h3>
              <div className="space-y-1 text-xs">
                {po.special_instructions && (
                  <div>
                    <p className="text-xs text-indigo-600 font-medium uppercase">Instructions</p>
                    <p className="text-indigo-900 whitespace-pre-wrap text-xs">{po.special_instructions}</p>
                  </div>
                )}
                {po.terms_conditions && (
                  <div>
                    <p className="text-xs text-indigo-600 font-medium uppercase">T&Cs</p>
                    <p className="text-indigo-900 whitespace-pre-wrap text-xs">{po.terms_conditions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(invoice.paid_amount !== undefined || invoice.outstanding_amount !== undefined) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
              <h3 className="text-xs font-semibold text-red-900 mb-1.5">Payment Status</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-xs text-red-600 font-medium uppercase">Total</p>
                  <p className="font-semibold text-red-900 text-xs">₹{(invoice.total_amount || invoice.amount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600 font-medium uppercase">Paid</p>
                  <p className="font-semibold text-red-900 text-xs">₹{(invoice.paid_amount || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600 font-medium uppercase">Outstanding</p>
                  <p className="font-semibold text-red-900 text-xs">₹{(invoice.outstanding_amount || (invoice.total_amount || invoice.amount || 0) - (invoice.paid_amount || 0)).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-200 sticky bottom-0 bg-white flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;