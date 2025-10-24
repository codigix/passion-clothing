import React from 'react';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  AlertCircle,
  Package
} from 'lucide-react';

const ShipmentTimeline = ({ updates = [], status = 'preparing' }) => {
  const stages = [
    {
      key: 'preparing',
      label: 'Preparing',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      key: 'packed',
      label: 'Packed',
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      key: 'ready_to_ship',
      label: 'Ready to Ship',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      key: 'in_transit',
      label: 'In Transit',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const getLatestUpdateForStatus = (statusKey) => {
    return updates
      ?.filter(u => u.status === statusKey)
      ?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  };

  const statusOrder = ['preparing', 'packed', 'ready_to_ship', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(status);

  return (
    <div className="space-y-6">
      {/* Timeline Progress Bar */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Shipment Progress</h3>
        <div className="flex items-center gap-1">
          {stages.map((stage, index) => {
            const isCompleted = currentStatusIndex > index;
            const isCurrent = currentStatusIndex === index;
            const Icon = stage.icon;

            return (
              <React.Fragment key={stage.key}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? `${stage.bgColor} border-2 ${stage.color} scale-110 shadow-lg`
                      : isCompleted
                      ? 'bg-green-100 border-2 border-green-600 text-green-600'
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {index < stages.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded-full transition-all ${
                      isCompleted ? 'bg-green-600' : isCurrent ? `${stage.color.replace('text-', 'bg-')}` : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Timeline</h3>
        <div className="space-y-3">
          {updates && updates.length > 0 ? (
            updates
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((update, index) => (
                <div key={update.id || index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                    {index < updates.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                    )}
                  </div>

                  <div className="pb-6 pt-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {update.status?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {update.description || 'Status updated'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {format(new Date(update.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tracking updates yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Milestones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-blue-900">Key Milestones</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {getLatestUpdateForStatus('prepared') && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Prepared on{' '}
                {format(new Date(getLatestUpdateForStatus('prepared').timestamp), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          {getLatestUpdateForStatus('shipped') && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>
                Shipped on{' '}
                {format(new Date(getLatestUpdateForStatus('shipped').timestamp), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          {getLatestUpdateForStatus('delivered') && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Delivered on{' '}
                {format(new Date(getLatestUpdateForStatus('delivered').timestamp), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentTimeline;