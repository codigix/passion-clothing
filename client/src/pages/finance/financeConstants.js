export const financeTabs = [
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "cashFlow", label: "Cash Flow" },
  { key: "reports", label: "Reports" },
];

export const invoiceStatusStyles = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-600",
  pending: "border-amber-200 bg-amber-50 text-amber-600",
  overdue: "border-rose-200 bg-rose-50 text-rose-600",
  partially_paid: "border-sky-200 bg-sky-50 text-sky-600",
};

export const invoiceTypeStyles = {
  sales: "border-emerald-200 bg-emerald-50 text-emerald-600",
  purchase: "border-blue-200 bg-blue-50 text-blue-600",
};

export const paymentStatusStyles = {
  cleared: "border-emerald-200 bg-emerald-50 text-emerald-600",
  pending: "border-amber-200 bg-amber-50 text-amber-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-600",
  scheduled: "border-sky-200 bg-sky-50 text-sky-600",
};

export const paymentTypeStyles = {
  received: "border-emerald-200 bg-emerald-50 text-emerald-600",
  made: "border-blue-200 bg-blue-50 text-blue-600",
};

export const paymentModeStyles = {
  bank_transfer: "border-indigo-200 bg-indigo-50 text-indigo-600",
  cheque: "border-amber-200 bg-amber-50 text-amber-600",
  cash: "border-gray-200 bg-gray-50 text-gray-600",
  upi: "border-purple-200 bg-purple-50 text-purple-600",
};

export const cashFlowCategoryStyles = {
  operating: "border-emerald-200 bg-emerald-50 text-emerald-600",
  investing: "border-blue-200 bg-blue-50 text-blue-600",
  financing: "border-sky-200 bg-sky-50 text-sky-600",
};

export const defaultBadgeStyles = "border border-gray-200 bg-gray-100 text-gray-600";