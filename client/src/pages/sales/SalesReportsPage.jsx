import React, {
  useState,
  useEffect
} from 'react';
import { TrendingUp, ShoppingCart, IndianRupee, Users, FileText, Download, Printer, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SalesReportsPage = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('summary');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Real data from API
  const [salesMetrics, setSalesMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    activeCustomers: 0,
    pendingOrders: 0,
    inProductionOrders: 0,
    deliveredOrders: 0,
    advanceCollected: 0,
    balanceDue: 0,
    procurementRequested: 0,
    materialsReceived: 0,
    invoicesPending: 0,
    invoicesGenerated: 0
  });

  const [detailedReport, setDetailedReport] = useState([]);
  const [customerReport, setCustomerReport] = useState([]);
  const [productReport, setProductReport] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, customDateFrom, customDateTo]);

  const getDateRange = () => {
    const today = new Date();
    let date_from, date_to;

    switch (dateRange) {
      case 'today':
        date_from = today.toISOString().split('T')[0];
        date_to = today.toISOString().split('T')[0];
        break;
      case 'thisWeek':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        date_from = weekStart.toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'thisMonth':
        date_from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        date_from = lastMonth.toISOString().split('T')[0];
        date_to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        date_from = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'thisYear':
        date_from = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        date_to = new Date().toISOString().split('T')[0];
        break;
      case 'custom':
        date_from = customDateFrom;
        date_to = customDateTo;
        break;
      default:
        date_from = null;
        date_to = null;
    }

    return { date_from, date_to };
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { date_from, date_to } = getDateRange();
      
      // Fetch summary data
      const params = {};
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;

      const summaryResponse = await api.get('/sales/dashboard/summary', { params });
      const summary = summaryResponse.data.summary;

      // Fetch detailed orders for reports
      const ordersResponse = await api.get('/sales/orders', {
        params: { ...params, limit: 1000 }
      });
      const orders = ordersResponse.data.orders || [];

      // Calculate metrics
      const totalOrders = summary.total_orders || 0;
      const totalSales = summary.total_value || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Count unique customers
      const uniqueCustomers = new Set(orders.map(o => o.customer_id)).size;

      setSalesMetrics({
        totalSales: totalSales,
        totalOrders: totalOrders,
        averageOrderValue: averageOrderValue,
        activeCustomers: uniqueCustomers,
        pendingOrders: summary.pending_orders || 0,
        inProductionOrders: summary.in_production_orders || 0,
        deliveredOrders: summary.delivered_orders || 0,
        advanceCollected: summary.advance_collected || 0,
        balanceDue: summary.balance_due || 0,
        procurementRequested: summary.procurement_requested || 0,
        materialsReceived: summary.materials_received || 0,
        invoicesPending: summary.invoices_pending || 0,
        invoicesGenerated: summary.invoices_generated || 0
      });

      // Process detailed report
      setDetailedReport(orders);

      // Process customer report
      const customerMap = {};
      orders.forEach(order => {
        const customerId = order.customer_id;
        const customerName = order.customer?.name || 'Unknown';
        
        if (!customerMap[customerId]) {
          customerMap[customerId] = {
            id: customerId,
            name: customerName,
            totalOrders: 0,
            totalAmount: 0,
            pendingAmount: 0
          };
        }
        
        customerMap[customerId].totalOrders += 1;
        customerMap[customerId].totalAmount += parseFloat(order.final_amount || 0);
        customerMap[customerId].pendingAmount += parseFloat(order.balance_amount || 0);
      });
      
      setCustomerReport(Object.values(customerMap).sort((a, b) => b.totalAmount - a.totalAmount));

      // Process product report
      const productMap = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productKey = item.product_type || item.description || 'Unknown';
            
            if (!productMap[productKey]) {
              productMap[productKey] = {
                product: productKey,
                totalQuantity: 0,
                totalOrders: 0,
                totalAmount: 0
              };
            }
            
            productMap[productKey].totalQuantity += parseFloat(item.quantity || 0);
            productMap[productKey].totalOrders += 1;
            productMap[productKey].totalAmount += parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
          });
        }
      });
      
      setProductReport(Object.values(productMap).sort((a, b) => b.totalAmount - a.totalAmount));

    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
    toast.success('Report data refreshed');
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'summary':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Sales,₹${salesMetrics.totalSales.toFixed(2)}\n`;
        csvContent += `Total Orders,${salesMetrics.totalOrders}\n`;
        csvContent += `Average Order Value,₹${salesMetrics.averageOrderValue.toFixed(2)}\n`;
        csvContent += `Active Customers,${salesMetrics.activeCustomers}\n`;
        csvContent += `Pending Orders,${salesMetrics.pendingOrders}\n`;
        csvContent += `In Production Orders,${salesMetrics.inProductionOrders}\n`;
        csvContent += `Delivered Orders,${salesMetrics.deliveredOrders}\n`;
        csvContent += `Advance Collected,₹${salesMetrics.advanceCollected.toFixed(2)}\n`;
        csvContent += `Balance Due,₹${salesMetrics.balanceDue.toFixed(2)}\n`;
        filename = 'sales-summary-report.csv';
        break;

      case 'detailed':
        csvContent = 'Order Number,Customer,Order Date,Delivery Date,Status,Quantity,Amount,Advance,Balance\n';
        detailedReport.forEach(order => {
          csvContent += `${order.order_number},${order.customer?.name || 'N/A'},${new Date(order.order_date).toLocaleDateString()},${new Date(order.delivery_date).toLocaleDateString()},${order.status},${order.total_quantity || 0},${order.final_amount || 0},${order.advance_paid || 0},${order.balance_amount || 0}\n`;
        });
        filename = 'sales-detailed-report.csv';
        break;

      case 'customer':
        csvContent = 'Customer Name,Total Orders,Total Amount,Pending Amount\n';
        customerReport.forEach(customer => {
          csvContent += `${customer.name},${customer.totalOrders},₹${customer.totalAmount.toFixed(2)},₹${customer.pendingAmount.toFixed(2)}\n`;
        });
        filename = 'sales-customer-report.csv';
        break;

      case 'product':
        csvContent = 'Product,Total Quantity,Total Orders,Total Amount\n';
        productReport.forEach(product => {
          csvContent += `${product.product},${product.totalQuantity},${product.totalOrders},₹${product.totalAmount.toFixed(2)}\n`;
        });
        filename = 'sales-product-report.csv';
        break;

      default:
        toast.error('Invalid report type');
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const MetricCard = ({ title, value, icon, color = 'primary' }) => (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  );

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading report data...</p>
          </div>
        </div>
      );
    }

    switch (reportType) {
      case 'summary':
        return (
          <div className="space-y-6">
            {/* Extended Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="text-sm text-gray-600 mb-1">Pending Orders</div>
                <div className="text-2xl font-bold text-gray-900">{salesMetrics.pendingOrders}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <div className="text-sm text-gray-600 mb-1">In Production</div>
                <div className="text-2xl font-bold text-gray-900">{salesMetrics.inProductionOrders}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="text-sm text-gray-600 mb-1">Delivered</div>
                <div className="text-2xl font-bold text-gray-900">{salesMetrics.deliveredOrders}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="text-sm text-gray-600 mb-1">Advance Collected</div>
                <div className="text-2xl font-bold text-gray-900">₹{salesMetrics.advanceCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">Balance Due</div>
                <div className="text-2xl font-bold text-gray-900">₹{salesMetrics.balanceDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <div className="text-sm text-gray-600 mb-1">Invoices Generated</div>
                <div className="text-2xl font-bold text-gray-900">{salesMetrics.invoicesGenerated}</div>
              </div>
            </div>

            {/* Procurement & Invoice Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  Procurement Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-gray-700">Requested</span>
                    <span className="font-semibold text-blue-700">{salesMetrics.procurementRequested}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-700">Materials Received</span>
                    <span className="font-semibold text-green-700">{salesMetrics.materialsReceived}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Invoice Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="text-gray-700">Pending</span>
                    <span className="font-semibold text-yellow-700">{salesMetrics.invoicesPending}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-gray-700">Generated</span>
                    <span className="font-semibold text-green-700">{salesMetrics.invoicesGenerated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Advance</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {detailedReport.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No orders found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    detailedReport.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.order_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.customer?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.order_date).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.delivery_date).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'in_production' ? 'bg-orange-100 text-orange-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{order.total_quantity || 0}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{parseFloat(order.final_amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">₹{parseFloat(order.advance_paid || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">₹{parseFloat(order.balance_amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'customer':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerReport.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No customer data found
                      </td>
                    </tr>
                  ) : (
                    customerReport.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{customer.totalOrders}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{customer.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">₹{customer.pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600">₹{(customer.totalAmount / customer.totalOrders).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price/Unit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productReport.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No product data found
                      </td>
                    </tr>
                  ) : (
                    productReport.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.product}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{product.totalQuantity.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{product.totalOrders}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{product.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600">₹{(product.totalAmount / product.totalQuantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow p-12">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a report type to view data</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Reports</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive sales reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Orders</option>
              <option value="customer">By Customer</option>
              <option value="product">By Product</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg w-full">
              <div className="font-semibold text-blue-700">
                {reportType === 'summary' ? 'Summary View' :
                 reportType === 'detailed' ? `${detailedReport.length} Orders` :
                 reportType === 'customer' ? `${customerReport.length} Customers` :
                 reportType === 'product' ? `${productReport.length} Products` : 'View'}
              </div>
            </div>
          </div>
        </div>
        
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input 
                type="date" 
                value={customDateFrom}
                onChange={e => setCustomDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input 
                type="date" 
                value={customDateTo}
                onChange={e => setCustomDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Sales"
          value={`₹${salesMetrics.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<IndianRupee className="w-8 h-8 text-green-500" />}
          color="success"
        />
        <MetricCard
          title="Total Orders"
          value={salesMetrics.totalOrders}
          icon={<ShoppingCart className="w-8 h-8 text-blue-500" />}
          color="primary"
        />
        <MetricCard
          title="Average Order Value"
          value={`₹${salesMetrics.averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<TrendingUp className="w-8 h-8 text-cyan-500" />}
          color="info"
        />
        <MetricCard
          title="Active Customers"
          value={salesMetrics.activeCustomers}
          icon={<Users className="w-8 h-8 text-yellow-500" />}
          color="warning"
        />
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default SalesReportsPage;