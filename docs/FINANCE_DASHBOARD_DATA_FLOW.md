# Finance Dashboard - Data Flow Documentation

## Overview
This document outlines the complete data flow for the Finance Dashboard, including all backend endpoints, frontend state management, and data transformations.

## Dashboard Sections & Data Sources

### 1. **KPI Cards** (Key Performance Indicators)
- **Location**: Top section of dashboard
- **Backend Endpoint**: `GET /api/finance/dashboard/kpis`
- **Frontend State**: `kpis`
- **Data Structure**:
  ```javascript
  [
    {
      id: string,
      title: string,
      value: number,
      trend: number (percentage),
      subtitle: string,
      icon: string (icon name),
      color: string ('emerald' | 'rose' | 'primary' | 'sky')
    }
  ]
  ```
- **Display Elements**:
  - Total Revenue (Sales invoices, payment_status = 'paid')
  - Total Expenses (Purchase invoices)
  - Net Profit (Revenue - Expenses)
  - Cash Flow (Completed payments)

---

### 2. **Invoice Summary**
- **Location**: Below KPI cards
- **Backend Endpoint**: `GET /api/finance/dashboard/invoice-summary`
- **Frontend State**: `invoiceSummary`
- **Data Structure**:
  ```javascript
  [
    {
      id: string ('total' | 'overdue' | 'pending' | 'paid'),
      label: string,
      value: number,
      trend: number (percentage),
      color: string
    }
  ]
  ```
- **Data Queries**:
  - Total Invoices: COUNT WHERE invoice_type='sales'
  - Overdue: COUNT WHERE invoice_type='sales' AND status='overdue'
  - Pending: COUNT WHERE invoice_type='sales' AND payment_status='unpaid'
  - Paid: COUNT WHERE invoice_type='sales' AND payment_status='paid'

---

### 3. **Outstanding Receivables Summary Card**
- **Location**: Summary cards section (green card)
- **Backend Endpoint**: `GET /api/finance/dashboard/outstanding-receivables`
- **Frontend State**: `receivablesData`
- **Data Structure**:
  ```javascript
  [
    {
      id: string ('overdue' | 'pending' | 'total'),
      label: string,
      value: number,
      trend: number (percentage)
    }
  ]
  ```
- **Data Queries**:
  - Overdue invoices: COUNT WHERE invoice_type='sales' AND payment_status IN ['unpaid', 'partially_paid'] AND due_date < NOW()
  - Pending invoices: COUNT WHERE invoice_type='sales' AND payment_status='unpaid'
  - Total amount: SUM(total_amount) WHERE invoice_type='sales' AND payment_status IN ['unpaid', 'partially_paid']

---

### 4. **Outstanding Payables Summary Card**
- **Location**: Summary cards section (red card)
- **Backend Endpoint**: `GET /api/finance/dashboard/outstanding-payables`
- **Frontend State**: `payablesData`
- **Data Structure**:
  ```javascript
  {
    totalPayables: number,
    budgetAlerts: [
      {
        id: number,
        title: string,
        percentage: number (0-100),
        status: string ('danger' | 'warning' | 'success')
      }
    ]
  }
  ```
- **Data Queries**:
  - Total payables: SUM(total_amount) WHERE invoice_type='purchase' AND payment_status IN ['unpaid', 'partially_paid']
  - Budget alerts: Calculated based on department budgets vs actual spending

---

### 5. **Compliance Checklist**
- **Location**: Summary cards section (blue card)
- **Backend Endpoint**: `GET /api/finance/dashboard/compliance`
- **Frontend State**: `complianceData`
- **Data Structure**:
  ```javascript
  [
    {
      id: number,
      title: string,
      dueDate: string (YYYY-MM-DD),
      status: string ('pending' | 'completed' | 'in_progress'),
      owner: string
    }
  ]
  ```
- **Compliance Types**:
  - GST Monthly Filing
  - TDS Payment
  - Vendor Agreement Renewal
  - Other statutory requirements

---

### 6. **Expense Breakdown**
- **Location**: Summary cards section (amber card)
- **Backend Endpoint**: `GET /api/finance/dashboard/expense-breakdown`
- **Frontend State**: `expenseData`
- **Data Structure**:
  ```javascript
  [
    {
      id: number,
      category: string,
      amount: number,
      percentage: number (0-100)
    }
  ]
  ```
- **Expense Categories**:
  - Raw Materials (43%)
  - Labor & Benefits (27%)
  - Operations (14%)
  - Logistics (9%)
  - Marketing (5%)

---

### 7. **Recent Invoices Table**
- **Location**: Invoices tab
- **Backend Endpoint**: `GET /api/finance/dashboard/recent-invoices`
- **Frontend State**: `financeInvoices`
- **Data Structure**:
  ```javascript
  [
    {
      id: number,
      invoiceNo: string,
      type: string ('sales' | 'purchase'),
      customerVendor: string,
      amount: number,
      dueDate: string (YYYY-MM-DD),
      status: string ('paid' | 'pending' | 'overdue' | 'partially_paid'),
      paymentStatus: string ('paid' | 'unpaid' | 'partially_paid')
    }
  ]
  ```
- **Display**: Latest 10 invoices, with view/delete actions
- **Filtering**: By type (sales/purchase/all)

---

### 8. **Recent Payments Table**
- **Location**: Payments tab
- **Backend Endpoint**: `GET /api/finance/dashboard/recent-payments`
- **Frontend State**: `financePayments`
- **Data Structure**:
  ```javascript
  [
    {
      id: number,
      paymentNo: string,
      invoiceNo: string,
      type: string ('received' | 'made'),
      party: string (customer/vendor name),
      amount: number,
      paymentMode: string ('bank_transfer' | 'cheque' | 'cash' | 'upi'),
      paymentDate: string (YYYY-MM-DD),
      status: string ('pending' | 'completed' | 'failed' | 'cancelled'),
      reference: string (transaction/cheque number)
    }
  ]
  ```
- **Display**: Latest 10 payments with delete actions

---

### 9. **Cash Flow Events**
- **Location**: Cash Flow tab
- **Backend Endpoint**: `GET /api/finance/dashboard/cash-flow`
- **Frontend State**: `cashFlowData`
- **Data Structure**:
  ```javascript
  [
    {
      id: number,
      description: string,
      amount: number,
      category: string ('operating' | 'investing' | 'financing'),
      date: string (YYYY-MM-DD),
      reference: string
    }
  ]
  ```
- **Data Source**: Recent payments ordered by date DESC, limit 10
- **Categories**:
  - Operating: Regular business operations
  - Investing: Capital expenditure
  - Financing: Loans, debt repayment

---

### 10. **Financial Highlights**
- **Location**: Cash Flow tab (below events)
- **Backend Endpoint**: `GET /api/finance/dashboard/financial-highlights`
- **Frontend State**: `highlightsData`
- **Data Structure**:
  ```javascript
  [
    {
      id: string,
      label: string,
      value: string,
      change: number (percentage),
      direction: string ('up' | 'down'),
      description: string
    }
  ]
  ```
- **Metrics Calculated**:
  - Invoice Collection Rate: (Paid invoices / Total invoices) × 100%
  - Expense Variance: Actual vs Budget percentage
  - Gross Margin: ((Revenue - Expenses) / Revenue) × 100%
  - Upcoming Receivables: Sum of invoices due within 30 days

---

## API Endpoints Summary

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/finance/dashboard/kpis` | GET | KPI metrics | `{ kpis: [...] }` |
| `/finance/dashboard/invoice-summary` | GET | Invoice counts by status | `{ summary: [...] }` |
| `/finance/dashboard/recent-invoices` | GET | Last 10 invoices | `{ invoices: [...] }` |
| `/finance/dashboard/recent-payments` | GET | Last 10 payments | `{ payments: [...] }` |
| `/finance/dashboard/outstanding-receivables` | GET | Receivables summary | `{ data: [...] }` |
| `/finance/dashboard/outstanding-payables` | GET | Payables & budget alerts | `{ totalPayables, budgetAlerts }` |
| `/finance/dashboard/expense-breakdown` | GET | Expense categories | `{ expenses: [...] }` |
| `/finance/dashboard/cash-flow` | GET | Cash flow events | `{ cashFlowEvents: [...] }` |
| `/finance/dashboard/financial-highlights` | GET | Key metrics | `{ highlights: [...] }` |
| `/finance/dashboard/compliance` | GET | Compliance checklist | `{ complianceChecklist: [...] }` |
| `/finance/invoices` | GET | All invoices (with filters) | `{ invoices: [...] }` |
| `/finance/payments` | GET | All payments (with filters) | `{ payments: [...] }` |
| `/finance/invoices/:id` | DELETE | Delete invoice | `{ message }` |
| `/finance/payments/:id` | DELETE | Delete payment | `{ message }` |

---

## Database Tables Used

### Invoice Table
- Fields: id, invoice_number, invoice_type, vendor_id, customer_id, total_amount, payment_status, status, due_date, created_at
- Relationships: Customer, Vendor, Payment, SalesOrder, PurchaseOrder

### Payment Table
- Fields: id, payment_number, invoice_id, payment_date, amount, payment_method, status, reference_number
- Relationships: Invoice

### Customer Table
- Fields: id, name, email, phone, address

### Vendor Table
- Fields: id, name, email, phone, address

---

## Frontend Data Flow (React)

```
1. Component Mount
   ↓
2. useEffect() calls fetchDashboardData()
   ↓
3. Promise.all() fetches all 10 endpoints in parallel
   ↓
4. Update 9 state variables:
   - setKpis
   - setInvoiceSummary
   - setFinanceInvoices
   - setFinancePayments
   - setReceivablesData
   - setPayablesData
   - setExpenseData
   - setCashFlowData
   - setHighlightsData
   - setComplianceData
   ↓
5. Component re-renders with fetched data
   ↓
6. Display sections with formatted data
```

---

## Error Handling

- All API calls wrapped in try-catch
- Errors logged to console
- Failed endpoints set state to empty array or default value
- User sees empty sections if data fails to load
- Toast notifications for user actions (delete invoice/payment)

---

## Performance Considerations

- All 10 endpoints fetched in parallel using Promise.all()
- Pagination available for invoices/payments (currently showing last 10)
- No real-time updates (data fetched once on mount)
- Consider implementing refresh button or polling for updates

---

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for live dashboard updates
2. **Custom Date Ranges**: Allow users to select date ranges for KPIs
3. **Export Functionality**: Implement export to CSV/PDF
4. **Advanced Filtering**: More granular filtering options
5. **Comparisons**: Period-over-period comparisons
6. **Alerts**: Automatic notifications for critical thresholds
7. **Mobile Optimization**: Responsive cards for mobile devices
