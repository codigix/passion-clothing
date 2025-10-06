import React from 'react';
import { X, Package, Truck, MapPin, Calendar, Phone, Mail } from 'lucide-react';

const ShipmentDetailsDialog = ({ isOpen, onClose, shipment }) => {
  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Shipment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipment Number
              </label>
              <p className="text-sm text-gray-900 font-mono">{shipment.shipment_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <p className="text-sm text-gray-900">{shipment.salesOrder?.order_number || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                {shipment.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <p className="text-sm text-gray-900 font-mono">{shipment.tracking_number || 'Not assigned'}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <p className="text-sm text-gray-900">{shipment.salesOrder?.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <p className="text-sm text-gray-900">{shipment.recipient_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone size={14} />
                  {shipment.recipient_phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail size={14} />
                  {shipment.salesOrder?.customer?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={20} />
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courier Partner
                </label>
                <p className="text-sm text-gray-900">{shipment.courierPartner?.name || shipment.courier_company || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Method
                </label>
                <p className="text-sm text-gray-900 capitalize">{shipment.shipping_method || 'Standard'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment Date
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(shipment.shipment_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(shipment.expected_delivery_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Delivery Address
            </h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {shipment.shipping_address}
            </p>
          </div>

          {/* Package Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Quantity
                </label>
                <p className="text-sm text-gray-900">{shipment.total_quantity} items</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Weight
                </label>
                <p className="text-sm text-gray-900">{shipment.total_weight || 'N/A'} kg</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Cost
                </label>
                <p className="text-sm text-gray-900">₹{shipment.shipping_cost || 0}</p>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {shipment.special_instructions && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Special Instructions</h3>
              <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                {shipment.special_instructions}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    preparing: 'bg-amber-100 text-amber-700',
    packed: 'bg-blue-100 text-blue-700',
    ready_to_ship: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-sky-100 text-sky-700',
    in_transit: 'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    failed_delivery: 'bg-rose-100 text-rose-700',
    returned: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default ShipmentDetailsDialog;