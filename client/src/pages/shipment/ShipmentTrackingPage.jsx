import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  QrCode,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ShipmentTrackingPage = () => {
  const { trackingId } = useParams();
  const [trackingNumber, setTrackingNumber] = useState(trackingId || '');
  const [shipmentData, setShipmentData] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentShipments, setRecentShipments] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchRecentShipments();
  }, []);

  // Auto-load tracking data if trackingId is provided in URL
  useEffect(() => {
    if (trackingId) {
      handleTrackShipment(trackingId);
    }
  }, [trackingId]);

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
        } else {
          toast.success('Shipment found ✓');
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
    toast.success('Tracking number copied ✓');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'dispatched': return <Package className="w-5 h-5" />;
      case 'in_transit': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'exception': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'dispatched': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'exception': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'preparing': return 10;
      case 'pending': return 15;
      case 'dispatched': return 30;
      case 'in_transit': return 60;
      case 'out_for_delivery': return 85;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const DeliveryFlowStages = ({ currentStatus }) => {
    const stages = [
      { key: 'dispatched', label: 'Dispatched', color: 'blue', icon: Package },
      { key: 'in_transit', label: 'In Transit', color: 'purple', icon: Truck },
      { key: 'out_for_delivery', label: 'Out for Delivery', color: 'orange', icon: Navigation },
      { key: 'delivered', label: 'Delivered', color: 'green', icon: CheckCircle }
    ];

    const statusOrder = ['pending', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Delivery Progress
        </h4>
        
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentIndex >= index + 1
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-110'
                        : currentIndex === index
                        ? 'bg-blue-500 text-white shadow-lg animate-pulse'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentIndex >= index + 1 ? <CheckCircle className="w-6 h-6" /> : <StageIcon className="w-6 h-6" />}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-3 text-center max-w-20">{stage.label}</p>
                </div>
                {index < stages.length - 1 && (
                  <div className={`flex-1 h-1.5 mx-4 rounded-full transition-all duration-300 ${
                    currentIndex > index ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-semibold">Overall Progress</span>
            <span className="text-lg font-bold text-blue-600">{getProgressPercentage(currentStatus)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(currentStatus)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const TrackingTimeline = ({ history }) => {
    return (
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-gray-200">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No tracking updates yet</p>
          </div>
        ) : (
          history.map((event, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${getStatusColor(event.status)}`}>
                  {getStatusIcon(event.status)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {event.status?.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-gray-600">{event.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const ShipmentCard = ({ shipment }) => {
    const latestStatus = shipment.trackingUpdates?.[0]?.status || shipment.status;
    
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group"
           onClick={() => handleTrackShipment(shipment.tracking_number || shipment.shipment_number)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-bold text-gray-900">{shipment.shipment_number}</span>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(latestStatus)}`}>
              {latestStatus?.replace('_', ' ')}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 pl-12">
            <div className="flex items-center gap-2">
              <User size={14} />
              <span className="font-medium">{shipment.salesOrder?.customer?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span className="truncate text-xs">{shipment.delivery_address || 'N/A'}</span>
            </div>
            {shipment.tracking_number && (
              <div className="flex items-center gap-2">
                <Route size={14} />
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{shipment.tracking_number}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(shipment.created_at).toLocaleDateString()}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
        </div>
      </div>
    );
  };

  const QRCodeModal = ({ trackingNumber, onClose }) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trackingNumber)}`;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <QrCode className="w-6 h-6" />
              QR Code
            </h3>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="border-4 border-gray-200 rounded-xl" />
            </div>
            <p className="text-sm text-gray-600 text-center font-medium">
              Scan this QR code to track:<br />
              <span className="text-gray-900 font-bold">{trackingNumber}</span>
            </p>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 flex gap-3 border-t border-gray-200">
            <button
              onClick={() => copyTrackingNumber(trackingNumber)}
              className="flex-1 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shipment Tracking</h1>
            <p className="text-gray-600">Track your shipments in real-time</p>
          </div>
          <button
            onClick={fetchRecentShipments}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tracking Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6">Track a Shipment</h2>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className={`flex-1 relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
              <div className="absolute left-4 top-4 z-10">
                <Search className={`w-5 h-5 transition ${searchFocused ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                placeholder="Enter tracking or shipment number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <button
              onClick={() => handleTrackShipment()}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Now
                </>
              )}
            </button>
            {trackingNumber && (
              <button
                onClick={() => setShowQRCode(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR
              </button>
            )}
          </div>
        </div>

        {/* Tracking Results */}
        {shipmentData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Progress */}
              <DeliveryFlowStages currentStatus={shipmentData.status} />

              {/* Tracking Timeline */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Timer className="w-6 h-6 text-blue-600" />
                  Tracking Timeline
                </h3>
                <TrackingTimeline history={trackingHistory} />
              </div>
            </div>

            {/* Shipment Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Shipment Number</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">{shipmentData.shipment_number}</p>
                </div>
                
                <div className="border-t pt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tracking Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex-1">
                      {shipmentData.tracking_number || 'N/A'}
                    </p>
                    {shipmentData.tracking_number && (
                      <button
                        onClick={() => copyTrackingNumber(shipmentData.tracking_number)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Copy size={18} className="text-gray-600 hover:text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Courier</label>
                  <p className="text-gray-900 font-semibold mt-1">{shipmentData.courier_company || 'N/A'}</p>
                </div>

                <div className="border-t pt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Expected Delivery</label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {shipmentData.expected_delivery_date ? new Date(shipmentData.expected_delivery_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Customer</label>
                  <p className="text-gray-900 font-semibold mt-1">{shipmentData.salesOrder?.customer?.name || 'N/A'}</p>
                </div>

                <div className="border-t pt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase">Delivery Address</label>
                  <p className="text-sm text-gray-700 mt-1">{shipmentData.delivery_address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Shipments */}
        {!shipmentData && recentShipments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Recent Shipments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentShipments.map(shipment => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && <QRCodeModal trackingNumber={trackingNumber} onClose={() => setShowQRCode(false)} />}
    </div>
  );
};

export default ShipmentTrackingPage;