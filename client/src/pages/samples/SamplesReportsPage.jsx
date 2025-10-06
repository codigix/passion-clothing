import React from "react";
import { Download, FileText, PieChart, Table } from "lucide-react";

import {
  stats,
  costMetrics,
  costDistribution,
  sampleOrders,
} from "./samplesData";
import { formatCurrency, formatLabel } from "./samplesUtilities";

const reportSections = [
  {
    title: "Monthly Summary",
    description:
      "Overview of key sample KPIs including approvals, conversions, and financial impact.",
  },
  {
    title: "Cost Breakdown",
    description:
      "Detailed analysis of expenses associated with producing and delivering samples.",
  },
  {
    title: "Conversion Funnel",
    description:
      "Track the stages from sample request to order conversion using funnel metrics.",
  },
  {
    title: "Feedback Trends",
    description:
      "Identify customer feedback patterns to improve sample quality and close rates.",
  },
];

const SamplesReportsPage = () => {
  const totalPaidOrders = sampleOrders
    .filter((order) => order.sampleType === "paid")
    .reduce((accumulator, order) => accumulator + order.cost, 0);

  const totalFreeOrders = sampleOrders
    .filter((order) => order.sampleType === "free")
    .reduce((accumulator, order) => accumulator + order.quantity, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sample Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Export ready-to-present insights covering conversion, cost, and performance.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden />
            Download PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Samples
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.totalSamples}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Conversion Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.conversionRate}%
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Revenue Generated
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Paid Sample Spend
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(totalPaidOrders)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Report Sections</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportSections.map((section) => (
            <div
              key={section.title}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900">
                {section.title}
              </h3>
              <p className="mt-2 text-xs text-gray-500">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <PieChart className="h-5 w-5 text-indigo-600" aria-hidden />
          Cost Analysis
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {costMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-sm font-semibold text-gray-900">Sample Type Mix</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {costDistribution.sampleType.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold text-blue-600">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-sm font-semibold text-gray-900">
              Expense Breakdown
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {costDistribution.costBreakdown.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold text-gray-700">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Table className="h-5 w-5 text-blue-600" aria-hidden />
          Feedback & Conversion Summary
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">
                  Sample No.
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">
                  Feedback
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">
                  Conversion Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">
                  Order Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.sampleNo}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.productName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.feedback ? formatLabel(order.feedback) : "Awaiting"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatLabel(order.conversionStatus)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {order.orderValue ? `₹${order.orderValue.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recommended Actions</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>
            • Prioritize follow-up with customers in "Pending" or "In Discussion" to increase conversion rate.
          </li>
          <li>
            • Review high-cost samples to identify opportunities for production or logistics savings.
          </li>
          <li>
            • Leverage positive feedback cases as reference stories in sales pitches.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SamplesReportsPage;