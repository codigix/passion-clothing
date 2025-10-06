export const financeStats = {
  totalRevenue: 4250000,
  totalExpenses: 2850000,
  netProfit: 1400000,
  outstandingReceivables: 850000,
  outstandingPayables: 650000,
  cashFlow: 750000,
  monthlyBudget: 5000000,
  profitTarget: 1500000,
  expenseVariance: -6.5,
};

export const financeKPIs = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: 4250000,
    trend: 12.5,
    subtitle: "Month-to-date",
    icon: "TrendingUp",
    color: "emerald",
  },
  {
    id: "expenses",
    title: "Total Expenses",
    value: 2850000,
    trend: -8.2,
    subtitle: "Month-to-date",
    icon: "TrendingDown",
    color: "rose",
  },
  {
    id: "profit",
    title: "Net Profit",
    value: 1400000,
    trend: 15.3,
    subtitle: "Month-to-date",
    icon: "DollarSign",
    color: "primary",
  },
  {
    id: "cash",
    title: "Cash Flow",
    value: 750000,
    trend: 6.1,
    subtitle: "Operating cash flow",
    icon: "Wallet",
    color: "sky",
  },
];

export const invoiceSummary = [
  {
    id: "total",
    label: "Total Invoices",
    value: 156,
    trend: 8.4,
    color: "blue",
  },
  {
    id: "overdue",
    label: "Overdue",
    value: 12,
    trend: -2.3,
    color: "rose",
  },
  {
    id: "pending",
    label: "Pending",
    value: 28,
    trend: 4.7,
    color: "amber",
  },
  {
    id: "paid",
    label: "Paid",
    value: 116,
    trend: 12.8,
    color: "emerald",
  },
];

export const financeInvoices = [
  {
    id: 1,
    invoiceNo: "INV-2024-001",
    type: "sales",
    customerVendor: "ABC School",
    amount: 425000,
    dueDate: "2024-12-15",
    status: "paid",
    paymentDate: "2024-12-10",
    challanNo: "CHN-20241201-0001",
    createdDate: "2024-11-15",
  },
  {
    id: 2,
    invoiceNo: "INV-2024-002",
    type: "purchase",
    customerVendor: "XYZ Textiles",
    amount: 125000,
    dueDate: "2024-12-20",
    status: "pending",
    paymentDate: null,
    challanNo: "CHN-20241201-0002",
    createdDate: "2024-11-20",
  },
  {
    id: 3,
    invoiceNo: "INV-2024-003",
    type: "sales",
    customerVendor: "PQR College",
    amount: 285000,
    dueDate: "2024-12-25",
    status: "overdue",
    paymentDate: null,
    challanNo: "CHN-20241201-0003",
    createdDate: "2024-11-25",
  },
  {
    id: 4,
    invoiceNo: "INV-2024-004",
    type: "purchase",
    customerVendor: "LMN Accessories",
    amount: 85000,
    dueDate: "2024-12-30",
    status: "partially_paid",
    paymentDate: "2024-12-01",
    challanNo: "CHN-20241201-0004",
    createdDate: "2024-11-28",
  },
];

export const financePayments = [
  {
    id: 1,
    paymentNo: "PAY-2024-001",
    invoiceNo: "INV-2024-001",
    type: "received",
    party: "ABC School",
    amount: 425000,
    paymentMode: "bank_transfer",
    paymentDate: "2024-12-10",
    status: "cleared",
    reference: "NEFT123456789",
  },
  {
    id: 2,
    paymentNo: "PAY-2024-002",
    invoiceNo: "INV-2024-004",
    type: "made",
    party: "LMN Accessories",
    amount: 50000,
    paymentMode: "cheque",
    paymentDate: "2024-12-01",
    status: "pending",
    reference: "CHQ001234",
  },
  {
    id: 3,
    paymentNo: "PAY-2024-003",
    invoiceNo: "INV-2024-005",
    type: "received",
    party: "XYZ School",
    amount: 180000,
    paymentMode: "cash",
    paymentDate: "2024-12-05",
    status: "cleared",
    reference: "CASH-001",
  },
];

export const cashFlowEvents = [
  {
    id: 1,
    description: "Advance payment received",
    amount: 250000,
    category: "operating",
    date: "2024-12-05",
    reference: "ADV-2024-012",
  },
  {
    id: 2,
    description: "Machinery upgrade",
    amount: -180000,
    category: "investing",
    date: "2024-12-08",
    reference: "CAPEX-2024-004",
  },
  {
    id: 3,
    description: "Loan repayment",
    amount: -95000,
    category: "financing",
    date: "2024-12-12",
    reference: "FIN-2024-015",
  },
  {
    id: 4,
    description: "Quarterly GST return",
    amount: -65000,
    category: "operating",
    date: "2024-12-14",
    reference: "GST-2024-Q4",
  },
];

export const financialHighlights = [
  {
    id: "conversion",
    label: "Invoice Collection Rate",
    value: "92%",
    change: 4.3,
    direction: "up",
    description: "Receivables collected within payment terms",
  },
  {
    id: "cost",
    label: "Expense Variance",
    value: "-6.5%",
    change: 1.2,
    direction: "down",
    description: "Under budget for the current month",
  },
  {
    id: "margin",
    label: "Gross Margin",
    value: "38.2%",
    change: 2.1,
    direction: "up",
    description: "Improved due to better pricing",
  },
  {
    id: "pipeline",
    label: "Upcoming Receivables",
    value: "₹12.4L",
    change: 3.8,
    direction: "up",
    description: "Invoices due within the next 30 days",
  },
];

export const expenseBreakdown = [
  {
    id: 1,
    category: "Raw Materials",
    amount: 1250000,
    percentage: 43,
  },
  {
    id: 2,
    category: "Labor & Benefits",
    amount: 780000,
    percentage: 27,
  },
  {
    id: 3,
    category: "Operations",
    amount: 420000,
    percentage: 14,
  },
  {
    id: 4,
    category: "Logistics",
    amount: 265000,
    percentage: 9,
  },
  {
    id: 5,
    category: "Marketing",
    amount: 135000,
    percentage: 5,
  },
];

export const complianceChecklist = [
  {
    id: 1,
    title: "GST Monthly Filing",
    dueDate: "2024-12-20",
    status: "pending",
    owner: "Priya Singh",
  },
  {
    id: 2,
    title: "TDS Payment",
    dueDate: "2024-12-07",
    status: "completed",
    owner: "Rahul Sharma",
  },
  {
    id: 3,
    title: "Vendor Agreement Renewal",
    dueDate: "2024-12-18",
    status: "in_progress",
    owner: "Amit Kumar",
  },
];

export const budgetAlerts = [
  {
    id: 1,
    title: "Marketing Budget Overspend",
    percentage: 78,
    status: "warning",
  },
  {
    id: 2,
    title: "Operations Cost Variance",
    percentage: 54,
    status: "success",
  },
  {
    id: 3,
    title: "Payroll Utilization",
    percentage: 88,
    status: "danger",
  },
];