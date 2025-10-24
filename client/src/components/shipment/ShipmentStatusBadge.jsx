import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader,
  Package,
  Truck,
  MapPin,
  Home,
  XCircle
} from 'lucide-react';

const ShipmentStatusBadge = ({ status, size = 'md', showLabel = true, onClick = null }) => {
  const statusConfig = {
    no_shipment: {
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: Package,
      label: 'No Shipment',
      description: 'Not yet shipped'
    },
    preparing: {
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: Clock,
      label: 'Preparing',
      description: 'Getting ready for shipment'
    },
    packed: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: Package,
      label: 'Packed',
      description: 'Order has been packed'
    },
    ready_to_ship: {
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: CheckCircle2,
      label: 'Ready to Ship',
      description: 'Ready for dispatch'
    },
    shipped: {
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      icon: Truck,
      label: 'Shipped',
      description: 'Shipment dispatched'
    },
    in_transit: {
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      icon: Truck,
      label: 'In Transit',
      description: 'On the way'
    },
    out_for_delivery: {
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      icon: MapPin,
      label: 'Out for Delivery',
      description: 'Delivery today'
    },
    delivered: {
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: CheckCircle2,
      label: 'Delivered',
      description: 'Delivered successfully'
    },
    failed_delivery: {
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: AlertCircle,
      label: 'Delivery Failed',
      description: 'Delivery attempt failed'
    },
    returned: {
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: XCircle,
      label: 'Returned',
      description: 'Shipment returned'
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: XCircle,
      label: 'Cancelled',
      description: 'Shipment cancelled'
    }
  };

  const config = statusConfig[status] || statusConfig.no_shipment;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${sizeClasses[size]} rounded-full border ${config.color} font-medium transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
      onClick={onClick}
      title={config.description}
    >
      <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

export default ShipmentStatusBadge;