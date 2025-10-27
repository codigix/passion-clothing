import React from 'react';
import { X, Package, Truck, MapPin, Calendar, Phone, Mail, AlertCircle } from 'lucide-react';

const ShipmentDetailsDialog = ({ isOpen, onClose, shipment }) => {
  if (!isOpen || !shipment) return null;

  // Determine if this is an incoming production order or a shipment
  const isProductionOrder = shipment.production_number && !shipment.shipment_number;
  const orderNumber = shipment.sales_order_number || shipment.salesOrder?.order_number || shipment.order_number || 'N/A';
  const customerName = shipment.customer_name || shipment.salesOrder?.customer?.name || 'N/A';
  const customerPhone = shipment.customer_phone || shipment.salesOrder?.customer?.phone || shipment.salesOrder?.customer?.mobile || 'N/A';
  const customerEmail = shipment.customer_email || shipment.salesOrder?.customer?.email || 'N/A';
  const productName = shipment.product_name || shipment.salesOrder?.product_name || 'N/A';
  const shippingAddress = shipment.shipping_address || 'N/A';
  const status = shipment.status || shipment.production_status || 'unknown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isProductionOrder ? 'Production Order Details' : 'Shipment Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Production Order Alert */}
          {isProductionOrder && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Ready for Shipment</p>
                <p className="text-xs text-blue-800 mt-1">This is a production order. Click "Create Shipment" to create a shipment from this order.</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isProductionOrder ? 'Production Number' : 'Shipment Number'}
              </label>
              <p className="text-sm text-gray-900 font-mono">{shipment.production_number || shipment.shipment_number || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <p className="text-sm text-gray-900">{orderNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {(status || 'unknown').replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isProductionOrder ? 'Production Type' : 'Tracking Number'}
              </label>
              <p className="text-sm text-gray-900 font-mono">{isProductionOrder ? (shipment.production_type || 'N/A') : (shipment.tracking_number || 'Not assigned')}</p>
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
                <p className="text-sm text-gray-900">{customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <p className="text-sm text-gray-900">{shipment.recipient_name || customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone size={14} />
                  {shipment.recipient_phone || customerPhone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail size={14} />
                  {customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <p className="text-sm text-gray-900">{productName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code
                </label>
                <p className="text-sm text-gray-900">{shipment.product_code || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <p className="text-sm text-gray-900">{shipment.quantity || 0} units</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <p className="text-sm text-gray-900 capitalize">{shipment.priority || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {!isProductionOrder && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={20} />
                Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courier Agent
                  </label>
                  <p className="text-sm text-gray-900">{shipment.courierAgent?.name ? `${shipment.courierAgent.name} (${shipment.courierAgent.company_name || 'N/A'})` : shipment.courierPartner?.name || shipment.courier_company || 'N/A'}</p>
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
                    {shipment.shipment_date ? new Date(shipment.shipment_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery
                  </label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar size={14} />
                    {shipment.expected_delivery_date ? new Date(shipment.expected_delivery_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Delivery Address
            </h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {shippingAddress}
            </p>
          </div>

          {/* Package Details */}
          {!isProductionOrder && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quantity
                  </label>
                  <p className="text-sm text-gray-900">{shipment.total_quantity || 0} items</p>
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
          )}

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