import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Calendar, TrendingUp, Wifi, Copy, CheckCircle } from 'lucide-react';
import { getNetworkBaseUrl, formatShareUrl } from '../utils/networkUtils';

const QRDataViewer = () => {
  const [searchParams] = useSearchParams();
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [networkUrl, setNetworkUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const dataParam = searchParams.get('data');
      if (dataParam) {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setQrData(decoded);
      }
    } catch (err) {
      setError('Invalid QR data format');
    }
  }, [searchParams]);

  useEffect(() => {
    const getUrl = async () => {
      try {
        const url = await getNetworkBaseUrl();
        setNetworkUrl(url);
      } catch (err) {
        console.warn('Could not detect network URL:', err);
        setNetworkUrl(window.location.origin);
      }
    };
    getUrl();
  }, []);

  const copyToClipboard = () => {
    if (networkUrl) {
      navigator.clipboard.writeText(networkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
          <div className="text-blue-600 text-4xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data</h1>
          <p className="text-gray-600">Scan a QR code to view the order details</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN');
    } catch {
      return date;
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-orange-100 text-orange-800',
      paused: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Network Access Info */}
        {networkUrl && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <Wifi className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-sm font-semibold text-green-900">Local Network Access</h3>
            </div>
            <div className="flex items-center justify-between bg-white rounded p-2">
              <code className="text-xs text-gray-700 break-all">{formatShareUrl(networkUrl)}</code>
              <button
                onClick={copyToClipboard}
                className="ml-2 p-1 hover:bg-gray-100 rounded flex items-center"
                title="Copy URL"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-green-700 mt-2">✓ Accessible from other devices on the same WiFi network</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Order Details</h1>
          <p className="text-center text-gray-600">QR Code Information</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <h2 className="text-white text-lg font-semibold">
              Order #{qrData.order_number || qrData.order_id}
            </h2>
          </div>

          <div className="p-4">
            {/* Order Information Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {qrData.order_id && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">Order ID</td>
                        <td className="px-3 py-2 text-gray-900">{qrData.order_id}</td>
                      </tr>
                    )}
                    {qrData.order_number && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">Order Number</td>
                        <td className="px-3 py-2 text-gray-900 font-semibold">{qrData.order_number}</td>
                      </tr>
                    )}
                    {qrData.customer && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">Customer</td>
                        <td className="px-3 py-2 text-gray-900">{qrData.customer}</td>
                      </tr>
                    )}
                    {qrData.status && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">Status</td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(qrData.status)}`}>
                            {qrData.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    )}
                    {qrData.total_quantity && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">Total Quantity</td>
                        <td className="px-3 py-2 text-gray-900 font-semibold">{qrData.total_quantity}</td>
                      </tr>
                    )}
                    {qrData.delivery_date && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Delivery Date
                        </td>
                        <td className="px-3 py-2 text-gray-900">{formatDate(qrData.delivery_date)}</td>
                      </tr>
                    )}
                    {qrData.final_amount && (
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">Final Amount</td>
                        <td className="px-3 py-2 text-gray-900 font-semibold">₹{qrData.final_amount.toFixed(2)}</td>
                      </tr>
                    )}
                    {qrData.timestamp && (
                      <tr>
                        <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3">QR Scanned At</td>
                        <td className="px-3 py-2 text-gray-900 text-xs">{formatDate(qrData.timestamp)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Data Section */}
            {Object.keys(qrData).length > 7 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(qrData).map(([key, value]) => {
                        const commonKeys = ['order_id', 'order_number', 'customer', 'status', 'total_quantity', 'delivery_date', 'final_amount', 'timestamp'];
                        if (commonKeys.includes(key)) return null;
                        
                        return (
                          <tr key={key} className="border-b border-gray-200">
                            <td className="px-3 py-2 font-medium text-gray-600 bg-gray-50 w-1/3 capitalize">
                              {key.replace(/_/g, ' ')}
                            </td>
                            <td className="px-3 py-2 text-gray-900 break-words">{formatValue(value)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center text-xs text-gray-600">
            <p>This information was extracted from the QR code</p>
            <p className="mt-1">Scan date: {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDataViewer;
