import React, { useMemo, useState } from "react";
import { Search, Filter, Eye, Pencil, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  sampleOrders,
  stats,
  conversionInsights,
} from "./samplesData";
import {
  statusStyles,
  sampleTypeStyles,
  feedbackStyles,
  conversionStyles,
} from "./samplesConstants";
import {
  formatLabel,
  formatCurrency,
  getBadgeClass,
  getInitials,
} from "./samplesUtilities";

const statusFilters = [
  { value: "all", label: "All Orders" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "in_production", label: "In Production" },
  { value: "delivered", label: "Delivered" },
];

const SamplesOrdersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return sampleOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSearch = [
        order.sampleNo,
        order.customerName,
        order.productName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, statusFilter]);

  const totalPaid = sampleOrders.filter((order) => order.sampleType === "paid").length;
  const totalFree = sampleOrders.length - totalPaid;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sample Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage incoming requests, monitor their status, and take actions quickly.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/samples/create-request")}
            className="inline-flex items-center justify-center rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
          >
            Create Sample Request
          </button>
          <button
            type="button"
            onClick={() => navigate("/samples/orders/export")}
            className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden /> Export Orders
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Requests
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {sampleOrders.length}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pending Approvals
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.pendingSamples}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Conversion Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.conversionRate}%
          </p>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by sample no, customer, product..."
                className="w-full rounded border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              >
                {statusFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 text-sm text-gray-500">
            <span>Paid Samples: {totalPaid}</span>
            <span>|</span>
            <span>Free Samples: {totalFree}</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Sample No.
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Sample Type
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Cost
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Feedback
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Conversion
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="text-sm">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {order.sampleNo}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                        {getInitials(order.customerName)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">Requested: {order.requestDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {order.productName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClass(
                        sampleTypeStyles,
                        order.sampleType
                      )}`}
                    >
                      {formatLabel(order.sampleType)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-700">
                    {order.quantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-700">
                    {formatCurrency(order.cost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClass(
                        statusStyles,
                        order.status
                      )}`}
                    >
                      {formatLabel(order.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClass(
                        feedbackStyles,
                        order.feedback
                      )}`}
                    >
                      {order.feedback ? formatLabel(order.feedback) : "Awaiting"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClass(
                        conversionStyles,
                        order.conversionStatus
                      )}`}
                    >
                      {formatLabel(order.conversionStatus)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                        aria-label="Edit order"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              No sample orders match your current filters.
            </div>
          )}
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Conversion Insights
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {conversionInsights.map((insight) => (
            <div
              key={insight.id}
              className="flex flex-col gap-3 rounded border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sample No.</span>
                <span className="font-medium text-gray-900">{insight.sampleNo}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">
                  {insight.customerName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClass(
                    conversionStyles,
                    insight.conversionStatus
                  )}`}
                >
                  {formatLabel(insight.conversionStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Quote Value</span>
                <span className="font-medium text-gray-900">
                  {insight.orderValue
                    ? `₹${insight.orderValue.toLocaleString()}`
                    : "Awaiting"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SamplesOrdersPage;