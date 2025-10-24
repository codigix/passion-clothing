import React, { useState } from "react";
import {
  Palette,
  Plus,
  Search,
  Eye,
  Pencil,
  CheckCircle,
  TrendingUp,
  IndianRupee,
  ClipboardList,
  CalendarClock,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  tabs,
  statusStyles,
  feedbackStyles,
  conversionStyles,
  sampleTypeStyles,
  defaultBadgeStyles,
} from "../samples/samplesConstants";

import {
  sampleOrders,
  sampleTracking,
  conversionInsights,
  costMetrics,
  costDistribution,
} from "../samples/samplesData";
import {
  formatLabel,
  getInitials,
  formatCurrency,
  getBadgeClass,
} from "../samples/samplesUtilities";

const SamplesDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    approvedSamples: 0
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await import('../../utils/api').then(m => m.default.get('/samples/dashboard/stats'));
      setStats(res.data);
    } catch (error) {
      setStats({ totalSamples: 0, pendingSamples: 0, approvedSamples: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Samples Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track sample orders, monitor production progress, and analyse conversions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/samples/create-request")}
          className="inline-flex items-center justify-center rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Create Sample Request
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
        <MinimalStatCard
          title="Total Samples"
          value={stats.totalSamples}
          icon={Palette}
        />
        <MinimalStatCard
          title="Pending Samples"
          value={stats.pendingSamples}
          icon={CalendarClock}
        />
        <MinimalStatCard
          title="Approved Samples"
          value={stats.approvedSamples}
          icon={CheckCircle}
        />
        <MinimalStatCard
          title="Rejected Samples"
          value={stats.rejectedSamples}
          icon={ClipboardList}
        />
        <MinimalStatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
        />
        <MinimalStatCard
          title="Sample Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K`}
          icon={IndianRupee}
          subtitle="This month"
        />
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick Search & Actions</h2>
        <div className="mt-4 grid gap-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="text"
                placeholder="Search by sample no, customer name..."
                className="w-full rounded border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/samples/tracking")}
            className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Tracking Overview
          </button>
          <button
            type="button"
            onClick={() => navigate("/samples/conversion")}
            className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Conversion Analysis
          </button>
          <button
            type="button"
            onClick={() => navigate("/samples/reports")}
            className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Sample Reports
          </button>
          <button
            type="button"
            onClick={() => navigate("/samples/orders/export")}
            className="inline-flex items-center justify-center rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden /> Export Data
          </button>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sample Orders ({sampleOrders.length})
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/samples/orders")}
                  className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  View All Orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Sample No.
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Customer
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Product
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Qty
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Cost
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Feedback
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Conversion
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sampleOrders.map((sample) => (
                      <tr key={sample.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-gray-900">
                          {sample.sampleNo}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-700">{sample.customerName}</td>
                        <td className="px-2 py-2 text-sm text-gray-700">{sample.productName}</td>
                        <td className="px-2 py-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              getBadgeClass(sampleTypeStyles, sample.sampleType)
                            }`}
                          >
                            {sample.sampleType.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right text-sm text-gray-700">{sample.quantity}</td>
                        <td className="px-2 py-2 text-right text-sm text-gray-700">
                          {formatCurrency(sample.cost)}
                        </td>
                        <td className="px-2 py-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              getBadgeClass(statusStyles, sample.status)
                            }`}
                          >
                            {formatLabel(sample.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-sm">
                          {sample.feedback ? (
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                                getBadgeClass(feedbackStyles, sample.feedback)
                              }`}
                            >
                              {formatLabel(sample.feedback)}
                            </span>
                          ) : (
                            <span className="text-xs font-medium uppercase text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              getBadgeClass(conversionStyles, sample.conversionStatus)
                            }`}
                          >
                            {formatLabel(sample.conversionStatus)}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full p-2 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" aria-hidden />
                              <span className="sr-only">View sample</span>
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                              <span className="sr-only">Edit sample</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sample Production Tracking</h3>
                <button
                  type="button"
                  onClick={() => navigate("/samples/tracking")}
                  className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  View Detailed Tracking
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Sample No.
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Current Stage
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Start Date
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        End Date
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Duration (Days)
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Assigned To
                      </th>
                      <th className="whitespace-nowrap px-2 py-2 text-xs text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sampleTracking.map((track) => (
                      <tr key={track.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-gray-900">
                          {track.sampleNo}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-700">{track.stage}</td>
                        <td className="px-2 py-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              getBadgeClass(statusStyles, track.status)
                            }`}
                          >
                            {formatLabel(track.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-700">{track.startDate}</td>
                        <td className="px-2 py-2 text-sm text-gray-500">
                          {track.endDate || "In Progress"}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-700">
                          {track.duration ? `${track.duration} days` : "Ongoing"}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold uppercase text-blue-600">
                              {getInitials(track.assignedTo)}
                            </div>
                            <span>{track.assignedTo}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center text-sm">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" aria-hidden />
                            <span className="sr-only">View tracking</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "conversion" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sample to Order Conversion Analysis</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Understand how samples are translating into confirmed production orders.
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.conversionRate}%</p>
                  <p className="mt-1 text-sm text-gray-500">Overall Conversion Rate</p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <TrendingUp className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">67</p>
                  <p className="mt-1 text-sm text-gray-500">Converted Orders</p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <IndianRupee className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">₹42.5L</p>
                  <p className="mt-1 text-sm text-gray-500">Revenue from Conversions</p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <CalendarClock className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">7.5</p>
                  <p className="mt-1 text-sm text-gray-500">Avg Days to Convert</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cost" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sample Cost Analysis</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor investment in sample creation against realised revenue.
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <IndianRupee className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="mt-1 text-sm text-gray-500">Total Sample Revenue</p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Palette className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">₹1,825</p>
                  <p className="mt-1 text-sm text-gray-500">Average Sample Cost</p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">15.2x</p>
                  <p className="mt-1 text-sm text-gray-500">ROI on Paid Samples</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SamplesDashboard;