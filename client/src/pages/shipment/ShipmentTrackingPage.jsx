import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  User,
  Phone,
  Mail,
  Navigation,
  Route,
  Timer,
  Info,
  ExternalLink,
  Copy,
  QrCode
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ShipmentTrackingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentData, setShipmentData] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentShipments, setRecentShipments] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchRecentShipments();
  }, []);

  const fetchRecentShipments = async () => {
    try {
      const response = await fetch('/api/shipments?limit=10&status=in_transit,dispatched', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentShipments(data.shipments || []);
      }
    } catch (error) {
      console.error('Error fetching recent shipments:', error);
    }
  };

  const handleTrackShipment = async (trackingNum = trackingNumber) => {
    if (!trackingNum.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/shipments/track/${trackingNum}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShipmentData(data.shipment);
        setTrackingHistory(data.tracking || []);
        
        if (!data.shipment) {
          toast.error('Shipment not found');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Shipment not found');
        setShipmentData(null);
        setTrackingHistory([]);
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('Failed to track shipment');
      setShipmentData(null);
      setTrackingHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingNumber = (number) => {
    navigator.clipboard.writeText(number);
    toast.success('Tracking number copied to clipboard');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'dispatched': return <Package className="w-5 h-5 text-blue-500" />;
      case 'in_transit': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'exception': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dispatched': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'exception': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 10;
      case 'dispatched': return 30;
      case 'in_transit': return 70;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const TrackingTimeline = ({ history }) => {
    return (
      <div className="space-y-4">
        {history.map((event, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                {getStatusIcon(event.status)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {event.status?.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-600">{event.location}</p>
              {event.notes && (
                <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ShipmentCard = ({ shipment }) => {
    const latestStatus = shipment.trackingUpdates?.[0]?.status || shipment.status;
    
    return (
      <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">{shipment.shipment_number}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(latestStatus)}`}>
            {latestStatus?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <User size={14} />
            <span>{shipment.salesOrder?.customer?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={14} />
            <span className="truncate">{shipment.delivery_address || 'N/A'}</span>
          </div>
          {shipment.tracking_number && (
            <div className="flex items-center space-x-2">
              <Route size={14} />
              <span className="font-mono text-xs">{shipment.tracking_number}</span>
              <button
                onClick={() => copyTrackingNumber(shipment.tracking_number)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {new Date(shipment.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => handleTrackShipment(shipment.tracking_number || shipment.shipment_number)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Track
          </button>
        </div>
      </div>
    );
  };

  const QRCodeModal = ({ trackingNumber, onClose }) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingNumber)}`;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded p-6 w-full max-w-sm">
          <h3 className="text-lg font-semibold mb-4 text-center">QR Code</h3>
          <div className="flex justify-center mb-4">
            <img src={qrCodeUrl} alt="QR Code" className="border rounded" />
          </div>
          <p className="text-sm text-gray-600 text-center mb-4">
            Scan this QR code to track: {trackingNumber}
          </p>
          <button
            onClick={onClose}
            className="w-full px-3 py-1.5 bg-blue-500 text-sm text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Tracking</h1>
          <p className="text-gray-600">Track your shipments in real-time</p>
        </div>
        <button
          onClick={fetchRecentShipments}
          className="flex items-center px-3 py-1.5 bg-blue-500 text-sm text-white rounded hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Tracking Search */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Track a Shipment</h2>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter tracking number or shipment number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
              className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            />
          </div>
          <button
            onClick={() => handleTrackShipment()}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Track
          </button>
          {trackingNumber && (
            <button
              onClick={() => setShowQRCode(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <QrCode size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tracking Results */}
      {shipmentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Shipment Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Shipment Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Shipment Number</label>
                  <p className="text-gray-900">{shipmentData.shipment_number}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900 font-mono">{shipmentData.tracking_number || 'N/A'}</p>
                    {shipmentData.tracking_number && (
                      <button
                        onClick={() => copyTrackingNumber(shipmentData.tracking_number)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(shipmentData.status)}
                    <span className={`px-1.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(shipmentData.status)}`}>
                      {shipmentData.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="text-gray-900">{shipmentData.salesOrder?.customer?.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                  <p className="text-gray-900">{shipmentData.delivery_address || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Courier Partner</label>
                  <p className="text-gray-900">
                    {shipmentData.courierPartner?.company_name || shipmentData.courier_company || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <p className="text-gray-900">{new Date(shipmentData.created_at).toLocaleDateString()}</p>
                </div>

                {shipmentData.estimated_delivery && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Delivery</label>
                    <p className="text-gray-900">{new Date(shipmentData.estimated_delivery).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Progress</label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(shipmentData.status)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{getProgressPercentage(shipmentData.status)}% Complete</p>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Tracking History</h3>
              
              {trackingHistory.length > 0 ? (
                <TrackingTimeline history={trackingHistory} />
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tracking history available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Shipments */}
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Active Shipments</h3>
        
        {recentShipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {recentShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active shipments found</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && trackingNumber && (
        <QRCodeModal
          trackingNumber={trackingNumber}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};

export default ShipmentTrackingPage;
