import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Palette,
  Plus,
  Target,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { sampleOrders } from "./samplesData";
import { formatLabel } from "./samplesUtilities";

const sampleTypes = [
  { value: "paid", label: "Paid Sample" },
  { value: "free", label: "Free Sample" },
];

const quantityOptions = [
  { value: "small", label: "Small Batch (1-3)" },
  { value: "medium", label: "Medium Batch (4-6)" },
  { value: "large", label: "Large Batch (7+)" },
];

const SamplesCreateRequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    productName: "",
    sampleType: "paid",
    quantity: "small",
    expectedDate: "",
    specialInstructions: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const lastRequests = useMemo(() => sampleOrders.slice(0, 3), []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/samples/orders");
    }, 1600);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Sample Request
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Capture customer requirements, delivery expectations, and assign ownership.
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

      {showSuccess && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Sample request logged successfully! Redirecting to orders...
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileText className="h-5 w-5 text-indigo-600" aria-hidden />
              Request Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide customer and product specifics to kick-start the sample workflow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Customer Name
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Contact Details
              <input
                type="tel"
                name="customerContact"
                value={formData.customerContact}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Product / Garment Type
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Expected Delivery Date
              <input
                type="date"
                name="expectedDate"
                value={formData.expectedDate}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Sample Type
              <select
                name="sampleType"
                value={formData.sampleType}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              >
                {sampleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Quantity
              <select
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
              >
                {quantityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-sm font-medium text-gray-700">
            Special Instructions
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={4}
              placeholder="Eg: Prefer organic cotton, include logo embroidery, deliver via express courier..."
              className="mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20/20"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
            >
              Submit Request
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Palette className="h-5 w-5 text-blue-600" aria-hidden />
              Recent Requests
            </h2>
            <div className="mt-4 space-y-3">
              {lastRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded border border-gray-200 bg-gray-50 p-4 text-sm"
                >
                  <p className="font-semibold text-gray-900">
                    {request.sampleNo} — {request.customerName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatLabel(request.sampleType)} • {request.requestDate}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Status: {formatLabel(request.status)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 text-indigo-600" aria-hidden />
              Customer Preferences
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Provide both fabric and fit options for school uniforms.</li>
              <li>• Offer quick turnaround for repeat customers.</li>
              <li>• Highlight eco-friendly fabrics for corporate orders.</li>
            </ul>
          </div>

          <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Target className="h-5 w-5 text-green-600" aria-hidden />
              Approval Checklist
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Validate product specifications and branding requirements.</li>
              <li>• Confirm sample type with finance if it is free-of-cost.</li>
              <li>• Align delivery timeline with production capacity.</li>
            </ul>
          </div>

          <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Calendar className="h-5 w-5 text-purple-600" aria-hidden />
              Processing SLA
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Approval turnaround: 24 hours</li>
              <li>• Production lead time: 3-5 days</li>
              <li>• Delivery commitment: 48 hours post-production</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SamplesCreateRequestPage;