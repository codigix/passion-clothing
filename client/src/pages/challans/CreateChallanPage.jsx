import React, { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaShoppingCart,
  FaTruck,
  FaBoxOpen,
  FaDownload,
  FaPrint,
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateChallanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(false);
  const [salesOrder, setSalesOrder] = useState(null);
  const [createdChallan, setCreatedChallan] = useState(null);
  const [challanData, setChallanData] = useState({
    type: 'outward',
    sub_type: 'sales',
    order_id: orderId || '',
    order_type: orderId ? 'sales_order' : '',
    customer_id: '',
    partyName: '',
    partyAddress: '',
    challanDate: new Date().toISOString().split('T')[0],
    expected_date: '',
    location_from: 'Warehouse',
    location_to: '',
    transport_details: '',
    notes: ''
  });

  const [challanItems, setChallanItems] = useState([
    {
      id: 1,
      product_id: '',
      product_type: '',
      description: '',
      quantity: 0,
      unit: 'pcs',
      rate: 0,
      remarks: ''
    }
  ]);

  // Fetch sales order data when order_id is present
  useEffect(() => {
    if (orderId) {
      fetchSalesOrder(orderId);
    }
  }, [orderId]);

  const fetchSalesOrder = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/sales/orders/${id}`);
      const order = response.data.order;
      setSalesOrder(order);

      // Auto-fill challan data from sales order
      setChallanData(prev => ({
        ...prev,
        order_id: id,
        order_type: 'sales',
        customer_id: order.customer_id,
        partyName: order.customer?.name || '',
        partyAddress: order.customer?.address || '',
        location_to: order.customer?.address || '',
        expected_date: order.delivery_date || '',
        notes: `Delivery for Sales Order: ${order.order_number}`
      }));

      // Auto-fill items from sales order
      if (order.items && order.items.length > 0) {
        const items = order.items.map((item, index) => ({
          id: index + 1,
          product_id: item.product_id || '',
          product_type: item.product_type || '',
          description: item.description || item.product_type || '',
          quantity: item.quantity || 0,
          unit: item.unit || 'pcs',
          rate: item.rate || 0,
          remarks: item.specifications || ''
        }));
        setChallanItems(items);
      }

      toast.success('Sales order data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch sales order:', error);
      toast.error('Failed to load sales order data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setChallanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...challanItems];
    updatedItems[index][field] = value;
    setChallanItems(updatedItems);
  };

  const addItem = () => {
    setChallanItems([...challanItems, {
      id: Date.now(),
      product_id: '',
      product_type: '',
      description: '',
      quantity: 0,
      unit: 'pcs',
      rate: 0,
      remarks: ''
    }]);
  };

  const removeItem = (index) => {
    if (challanItems.length > 1) {
      setChallanItems(challanItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Prepare items for API
      const items = challanItems.map(item => ({
        product_id: item.product_id || undefined,
        product_type: item.product_type,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit,
        rate: parseFloat(item.rate) || 0,
        remarks: item.remarks
      }));

      // Prepare challan payload
      const payload = {
        type: challanData.type,
        sub_type: challanData.sub_type,
        order_id: challanData.order_id || undefined,
        order_type: challanData.order_type || undefined,
        customer_id: challanData.customer_id || undefined,
        items,
        notes: challanData.notes,
        expected_date: challanData.expected_date || undefined,
        location_from: challanData.location_from,
        location_to: challanData.location_to,
        transport_details: challanData.transport_details || undefined,
        priority: 'medium'
      };

      const response = await api.post('/challans', payload);
      const challan = response.data.challan;
      
      setCreatedChallan(challan);
      toast.success(`Challan ${challan.challan_number} created successfully!`);
    } catch (error) {
      console.error('Challan creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  // Download challan as PDF
  const handleDownloadPDF = () => {
    if (!createdChallan) return;
    
    // Generate PDF content
    const printWindow = window.open('', '_blank');
    const challanHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Challan ${createdChallan.challan_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DELIVERY CHALLAN</h1>
          <p>Challan No: <strong>${createdChallan.challan_number}</strong></p>
          <p>Date: ${new Date(createdChallan.challan_date || createdChallan.created_at).toLocaleDateString()}</p>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <div><span class="label">From:</span> ${challanData.location_from}</div>
            <div><span class="label">To:</span> ${challanData.location_to}</div>
          </div>
          <div class="info-row">
            <div><span class="label">Party Name:</span> ${challanData.partyName}</div>
            <div><span class="label">Type:</span> ${challanData.type} - ${challanData.sub_type}</div>
          </div>
          ${challanData.partyAddress ? `<div class="info-row"><span class="label">Address:</span> ${challanData.partyAddress}</div>` : ''}
          ${challanData.transport_details ? `<div class="info-row"><span class="label">Transport:</span> ${challanData.transport_details}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>Product Type</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${challanItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${item.product_type || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>₹${item.rate}</td>
                <td>₹${(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3"><strong>Total</strong></td>
              <td><strong>${totalQuantity}</strong></td>
              <td></td>
              <td></td>
              <td><strong>₹${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        ${challanData.notes ? `<div class="info-section"><span class="label">Notes:</span> ${challanData.notes}</div>` : ''}

        <div class="footer">
          <p>This is a computer-generated document. No signature required.</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(challanHTML);
    printWindow.document.close();
  };

  // Calculate totals
  const totalQuantity = challanItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalAmount = challanItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)), 0);

  // Show success screen after challan creation
  if (createdChallan) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-6xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Challan Created Successfully!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Challan Number: <strong className="text-blue-600">{createdChallan.challan_number}</strong>
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">Challan Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{challanData.type} - {challanData.sub_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Party:</span>
                  <span className="font-medium">{challanData.partyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{challanData.location_from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{challanData.location_to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{challanItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{totalQuantity} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-green-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload /> Download / Print Challan
              </button>
              <button
                onClick={() => navigate(`/challans/register`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaBoxOpen /> View All Challans
              </button>
              <button
                onClick={() => {
                  setCreatedChallan(null);
                  setChallanData({
                    type: 'outward',
                    sub_type: 'sales',
                    order_id: '',
                    order_type: '',
                    customer_id: '',
                    partyName: '',
                    partyAddress: '',
                    challanDate: new Date().toISOString().split('T')[0],
                    expected_date: '',
                    location_from: 'Warehouse',
                    location_to: '',
                    transport_details: '',
                    notes: ''
                  });
                  setChallanItems([{
                    id: 1,
                    product_id: '',
                    product_type: '',
                    description: '',
                    quantity: 0,
                    unit: 'pcs',
                    rate: 0,
                    remarks: ''
                  }]);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaPlus /> Create Another Challan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !salesOrder) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/challans/register')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-xl text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Challan</h1>
            <p className="text-gray-600 mt-1">Create a new delivery challan</p>
          </div>
        </div>
        {salesOrder && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <FaShoppingCart className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              From SO: {salesOrder.order_number}
            </span>
          </div>
        )}
      </div>

      {/* Info Alert */}
      {salesOrder && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <FaShoppingCart className="text-blue-500 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-blue-700">
                Creating challan for Sales Order <strong>{salesOrder.order_number}</strong>
                {salesOrder.customer && ` - Customer: ${salesOrder.customer.name}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Challan Information */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBoxOpen className="text-blue-600" />
            Challan Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challan Type <span className="text-red-500">*</span>
              </label>
              <select
                value={challanData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                disabled={!!orderId}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="inward">Inward</option>
                <option value="outward">Outward</option>
                <option value="dispatch">Dispatch</option>
                <option value="receipt">Receipt</option>
                <option value="internal_transfer">Internal Transfer</option>
                <option value="sample_outward">Sample Outward</option>
                <option value="sample_inward">Sample Inward</option>
                <option value="return">Return</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Type <span className="text-red-500">*</span>
              </label>
              <select
                value={challanData.sub_type}
                onChange={(e) => handleInputChange('sub_type', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sales">Sales</option>
                <option value="purchase">Purchase</option>
                <option value="production">Production</option>
                <option value="outsourcing">Outsourcing</option>
                <option value="store_issue">Store Issue</option>
                <option value="store_return">Store Return</option>
                <option value="sample">Sample</option>
                <option value="waste">Waste</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={challanData.partyName}
                onChange={(e) => handleInputChange('partyName', e.target.value)}
                required
                readOnly={!!salesOrder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent read-only:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challan Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={challanData.challanDate}
                onChange={(e) => handleInputChange('challanDate', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Address
              </label>
              <textarea
                value={challanData.partyAddress}
                onChange={(e) => handleInputChange('partyAddress', e.target.value)}
                rows="2"
                readOnly={!!salesOrder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent read-only:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTruck className="text-blue-600" />
            Shipment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={challanData.location_from}
                onChange={(e) => handleInputChange('location_from', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={challanData.location_to}
                onChange={(e) => handleInputChange('location_to', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={challanData.expected_date}
                onChange={(e) => handleInputChange('expected_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Details
              </label>
              <input
                type="text"
                value={challanData.transport_details}
                onChange={(e) => handleInputChange('transport_details', e.target.value)}
                placeholder="e.g., Truck No., Driver Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaBoxOpen className="text-blue-600" />
              Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              disabled={!!salesOrder}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaPlus />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {challanItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.product_type}
                        onChange={(e) => handleItemChange(index, 'product_type', e.target.value)}
                        placeholder="Product type"
                        readOnly={!!salesOrder}
                        className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm read-only:bg-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                        readOnly={!!salesOrder}
                        className="w-48 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm read-only:bg-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="pcs">Pcs</option>
                        <option value="kg">Kg</option>
                        <option value="meter">Meter</option>
                        <option value="yard">Yard</option>
                        <option value="box">Box</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        readOnly={!!salesOrder}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm read-only:bg-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                        placeholder="Remarks"
                        className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={challanItems.length === 1 || !!salesOrder}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t flex justify-end gap-8">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-xl font-bold text-gray-900">{totalQuantity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={challanData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows="4"
            placeholder="Additional notes or instructions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/challans/register')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <FaTimes />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Challan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChallanPage;