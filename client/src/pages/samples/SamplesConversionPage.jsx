import React, { useMemo, useState } from "react";
import { TrendingUp, Filter, BarChart3, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  sampleOrders,
  conversionInsights,
  stats,
} from "./samplesData";
import { conversionStyles } from "./samplesConstants";
import { formatLabel, getBadgeClass } from "./samplesUtilities";

const conversionFilters = [
  { value: "all", label: "All" },
  { value: "converted", label: "Converted" },
  { value: "pending", label: "Pending" },
  { value: "in_discussion", label: "In Discussion" },
  { value: "rejected", label: "Rejected" },
];

const SamplesConversionPage = () => {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState("all");

  const filteredInsights = useMemo(() => {
    if (filterValue === "all") {
      return conversionInsights;
    }
    return conversionInsights.filter(
      (insight) => insight.conversionStatus === filterValue
    );
  }, [filterValue]);

  const convertedOrders = sampleOrders.filter(
    (order) => order.conversionStatus === "converted"
  );
  const conversionValue = convertedOrders.reduce(
    (accumulator, order) => accumulator + (order.orderValue || 0),
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Conversion Analysis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Identify high-performing samples, track revenue conversion, and improve funnel flow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/samples/reports")}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
        >
          View Reports
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Conversion Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.conversionRate}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Based on approved sample orders this month.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Converted Deals
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {convertedOrders.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Out of {sampleOrders.length} total sample orders.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Conversion Value
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{(conversionValue / 100000).toFixed(1)}L
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Closed revenue linked to samples.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pending Deals
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {sampleOrders.filter((order) => order.conversionStatus === "pending").length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Follow-up required to move forward.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <TrendingUp className="h-5 w-5 text-indigo-600" aria-hidden />
            Conversion Funnel
          </h2>
          <div className="relative w-full sm:w-56">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <select
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
              className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {conversionFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {insight.sampleNo}
                  </p>
                  <p className="text-xs text-gray-500">
                    {insight.customerName}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClass(
                    conversionStyles,
                    insight.conversionStatus
                  )}`}
                >
                  {formatLabel(insight.conversionStatus)}
                </span>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-3 text-sm">
                <p className="text-xs text-gray-500">Product</p>
                <p className="font-medium text-gray-900">
                  {insight.productName}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-3 text-sm">
                <p className="text-xs text-gray-500">Quote Value</p>
                <p className="font-medium text-gray-900">
                  {insight.orderValue
                    ? `₹${insight.orderValue.toLocaleString()}`
                    : "Awaiting Quote"}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                View Customer Journey
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <BarChart3 className="h-5 w-5 text-blue-600" aria-hidden />
          Funnel Opportunities
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Follow-up Priorities",
              description: "Focus on samples pending customer feedback to unlock conversions.",
              icon: Users,
            },
            {
              title: "Pricing Strategy",
              description: "Analyze high-value quotes to ensure they are aligned with win-levers.",
              icon: Target,
            },
            {
              title: "Engagement",
              description: "Set reminders for customer check-ins during quality and delivery stages.",
              icon: TrendingUp,
            },
            {
              title: "Content Playbooks",
              description: "Use success stories to support sales teams during negotiations.",
              icon: BarChart3,
            },
          ].map((opportunity) => (
            <div
              key={opportunity.title}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <opportunity.icon className="h-5 w-5 text-indigo-600" aria-hidden />
              <p className="text-sm font-semibold text-gray-900">
                {opportunity.title}
              </p>
              <p className="text-xs text-gray-500">
                {opportunity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SamplesConversionPage;