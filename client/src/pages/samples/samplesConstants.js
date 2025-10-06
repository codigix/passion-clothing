export const tabs = [
  { key: "orders", label: "Sample Orders" },
  { key: "tracking", label: "Sample Tracking" },
  { key: "conversion", label: "Conversion Analysis" },
  { key: "cost", label: "Cost Analysis" },
];

export const statusStyles = {
  pending_approval: "border-amber-200 bg-amber-100 text-amber-700",
  approved: "border-blue-200 bg-blue-100 text-blue-700",
  in_production: "border-indigo-200 bg-indigo-100 text-indigo-700",
  ready_to_ship: "border-cyan-200 bg-cyan-100 text-cyan-700",
  delivered: "border-emerald-200 bg-emerald-100 text-emerald-700",
  rejected: "border-rose-200 bg-rose-100 text-rose-700",
  completed: "border-emerald-200 bg-emerald-100 text-emerald-700",
  in_progress: "border-indigo-200 bg-indigo-100 text-indigo-700",
  waiting: "border-amber-200 bg-amber-100 text-amber-700",
};

export const feedbackStyles = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  modifications_requested: "border-amber-200 bg-amber-50 text-amber-700",
};

export const conversionStyles = {
  converted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  in_discussion: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-blue-200 bg-blue-50 text-blue-700",
};

export const sampleTypeStyles = {
  paid: "border-blue-200 bg-blue-50 text-blue-700",
  free: "border-purple-200 bg-purple-50 text-purple-700",
};

export const defaultBadgeStyles = "border-gray-200 bg-gray-100 text-gray-600";