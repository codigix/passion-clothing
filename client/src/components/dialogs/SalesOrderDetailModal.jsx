import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Plus,
  AlertCircle,
  DollarSign,
  Calendar,
  Package,
  User,
  Truck
} from 'lucide-react';
import { FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SalesOrderDetailModal = ({ isOpen, onClose, order, onApprove, onCreatePO }) => {
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const formatINR = (value) => {
    if (!value) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const handleApprove = async () => {
    if (!window.confirm(`Confirm order ${order.order_number}?\n\nThis will change the order status to 'Confirmed' and notify the Sales department.`)) {
      return;
    }

    setApproving(true);
    try {
      await onApprove(order);
      toast.success('Order confirmed successfully');
      onClose();
    } catch (error) {
      console.error('Error approving order:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleCreatePO = () => {
    onClose();
    onCreatePO(order);
  };

  if (!isOpen || !order) return null;

  const customer = typeof order.customer === 'object' ? order.customer : { name: order.customer };
  const garmentSpecs = order.garment_specifications || {};
  const items = order.items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {order.order_number}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {order.project_name || 'Project'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                  <Package size={16} />
                  Order Status
                </div>
                <div className="text-sm text-blue-600">
                  {order.status === 'draft' ? 'Pending Confirmation' : 'Confirmed'}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-700 font-semibold mb-1">
                  <Calendar size={16} />
                  Delivery Date
                </div>
                <div className="text-sm text-amber-600">
                  {formatDate(order.delivery_date)}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                  <DollarSign size={16} />
                  Total Amount
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  {formatINR(order.final_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <User size={16} />
                Customer
              </h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-slate-800">{customer.name || 'N/A'}</p>
                {customer.email && <p className="text-slate-600">{customer.email}</p>}
                {customer.phone && <p className="text-slate-600">{customer.phone}</p>}
                {customer.billing_address && (
                  <p className="text-slate-600 text-xs mt-2">{customer.billing_address}</p>
                )}
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Truck size={16} />
                Shipping Address
              </h3>
              <div className="space-y-1 text-sm">
                {order.shipping_address ? (
                  <p className="text-slate-600 text-xs">{order.shipping_address}</p>
                ) : (
                  <p className="text-slate-500 italic">Same as billing address</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Product Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Product Type:</span>
                <p className="font-medium text-slate-900">{garmentSpecs.product_type || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">Product Name:</span>
                <p className="font-medium text-slate-900">{garmentSpecs.product_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">Fabric Type:</span>
                <p className="font-medium text-slate-900">{garmentSpecs.fabric_type || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">Color:</span>
                <p className="font-medium text-slate-900">{garmentSpecs.color || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">GSM:</span>
                <p className="font-medium text-slate-900">{garmentSpecs.gsm || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-600">Total Quantity:</span>
                <p className="font-medium text-slate-900">{order.total_quantity || 0}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="font-semibold text-slate-900 mb-3">Order Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-3 py-2 text-left text-slate-700 font-semibold">Item</th>
                    <th className="px-3 py-2 text-right text-slate-700 font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right text-slate-700 font-semibold">Unit Price</th>
                    <th className="px-3 py-2 text-right text-slate-700 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="text-slate-900 font-medium">{item.description || item.product_name || `Item ${idx + 1}`}</div>
                        {item.style_no && <div className="text-xs text-slate-500">Style: {item.style_no}</div>}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-900 font-medium">{item.quantity || 0}</td>
                      <td className="px-3 py-2 text-right text-slate-900">{formatINR(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right text-slate-900 font-semibold">{formatINR((item.quantity || 0) * (item.unit_price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium text-slate-900">{formatINR(order.total_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount {order.discount_percentage > 0 ? `(${order.discount_percentage}%)` : ''}:</span>
                  <span className="font-medium text-slate-900">-{formatINR(order.discount_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax {order.tax_percentage > 0 ? `(${order.tax_percentage}%)` : ''}:</span>
                  <span className="font-medium text-slate-900">{formatINR(order.tax_amount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-lg">{formatINR(order.final_amount)}</span>
              </div>
              {order.advance_paid > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Advance Paid:</span>
                  <span className="font-medium">{formatINR(order.advance_paid)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          {(order.special_instructions || order.payment_terms) && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600" />
                Additional Information
              </h3>
              <div className="space-y-2 text-sm">
                {order.payment_terms && (
                  <div>
                    <span className="text-slate-600">Payment Terms:</span>
                    <p className="text-slate-900">{order.payment_terms}</p>
                  </div>
                )}
                {order.special_instructions && (
                  <div>
                    <span className="text-slate-600">Special Instructions:</span>
                    <p className="text-slate-900">{order.special_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="sticky bottom-0 flex gap-2 justify-end p-6 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
          >
            Close
          </button>

          {order.status === 'draft' && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {approving ? 'Approving...' : 'Approve Order'}
            </button>
          )}

          {order.status === 'confirmed' && (
            <button
              onClick={handleCreatePO}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Create Purchase Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetailModal;
