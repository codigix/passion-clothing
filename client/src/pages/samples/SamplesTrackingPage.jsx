import React from "react";
import { CalendarClock, ChevronRight, Circle, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { sampleTracking, sampleOrders } from "./samplesData";
import { formatLabel } from "./samplesUtilities";

const trackingStages = [
  { key: "requested", label: "Request Submitted" },
  { key: "approved", label: "Approval" },
  { key: "in_production", label: "Production" },
  { key: "quality", label: "Quality Check" },
  { key: "dispatched", label: "Dispatch" },
  { key: "delivered", label: "Delivered" },
];

const SamplesTrackingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sample Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor manufacturing stages, ownership, and delivery progress for each sample.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/samples")}
          className="inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Active Tracking</h2>
        <p className="mt-1 text-sm text-gray-500">
          Keep stakeholders aligned with real-time progress across production stages.
        </p>

        <div className="mt-6 space-y-4">
          {sampleTracking.map((item) => (
            <div
              key={item.id}
              className="rounded border border-gray-200 bg-gray-50 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.sampleNo} — {item.stage}
                  </p>
                  <p className="text-xs text-gray-500">
                    Owner: {item.assignedTo}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-400" aria-hidden />
                  <span className="text-xs text-gray-500">
                    {item.startDate} – {item.endDate || "In Progress"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded border border-gray-200 bg-white p-3 text-sm">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">
                    {formatLabel(item.status)}
                  </p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-3 text-sm">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">
                    {item.duration ? `${item.duration} days` : "Ongoing"}
                  </p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-3 text-sm">
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="font-medium text-gray-900">{item.assignedTo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Stage Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Each sample moves through a consistent lifecycle from request to delivery.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-6">
          {trackingStages.map((stage, index) => (
            <div
              key={stage.key}
              className="flex flex-col items-center rounded border border-gray-200 bg-gray-50 p-4 text-center"
            >
              <Circle className="mb-2 h-5 w-5 text-blue-600" aria-hidden />
              <p className="text-sm font-semibold text-gray-900">{stage.label}</p>
              {index < trackingStages.length - 1 && (
                <ChevronRight className="mt-2 h-4 w-4 text-gray-400" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Team Allocation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Quickly identify responsibilities and next steps for cross-functional teams.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {sampleOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {order.sampleNo}
                </p>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  {formatLabel(order.sampleType)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" aria-hidden />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" aria-hidden />
                <span>{order.outwardChallan || "Outward challan pending"}</span>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
              >
                View Timeline
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SamplesTrackingPage;