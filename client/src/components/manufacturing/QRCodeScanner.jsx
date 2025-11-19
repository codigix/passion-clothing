import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  CheckCircle,
  AlertTriangle,
  Package,
  Clock,
  User,
  Calendar,
  Target,
  TrendingUp,
  X,
  RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const QRCodeScanner = ({ onClose, onScanSuccess, embedded = false }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanner, setScanner] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    setIsScanning(true);
    setScannedData(null);

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-scanner",
      {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      },
      false
    );

    html5QrcodeScanner.render(
      async (decodedText) => {
        try {
          setLoading(true);
          const qrData = JSON.parse(decodedText);
          setScannedData(qrData);

          // Log the QR scan and get updated order details
          if (qrData.order_id) {
            try {
              const scanResponse = await api.post('/manufacturing/qr-scan', {
                qrData: qrData,
                status_to: qrData.status || undefined
              });

              if (scanResponse.data?.data) {
                setScannedData(prev => ({
                  ...prev,
                  ...scanResponse.data.data,
                  qrData: qrData,
                  qr_scan_metadata: {
                    qr_scan_count: scanResponse.data.data.qr_scan_count,
                    last_scanned_at: scanResponse.data.data.last_scanned_at,
                    updated_at: scanResponse.data.data.updated_at
                  }
                }));
                toast.success(`QR scan logged! (Scan #${scanResponse.data.data.qr_scan_count})`);
              }
            } catch (error) {
              console.warn('Could not log QR scan:', error);
              
              // Fallback: fetch order details
              try {
                const response = await api.get(`/sales/orders/${qrData.order_id}`);
                if (response.data.order) {
                  setScannedData(prev => ({
                    ...prev,
                    ...response.data.order,
                    qrData: qrData
                  }));
                }
              } catch (fallbackError) {
                console.warn('Could not fetch order details:', fallbackError);
              }
            }
          }

          setIsScanning(false);
          html5QrcodeScanner.clear();
          toast.success('QR Code scanned successfully!');
        } catch (error) {
          console.error('Error parsing QR code:', error);
          toast.error('Invalid QR code format');
        } finally {
          setLoading(false);
        }
      },
      (errorMessage) => {
        // Ignore normal scanning errors
        if (errorMessage.includes('NotFoundException')) {
          // This is normal - no QR code detected
        }
      }
    );

    setScanner(html5QrcodeScanner);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setIsScanning(false);
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  };

  const handleUseData = () => {
    if (onScanSuccess && scannedData) {
      onScanSuccess(scannedData);
      onClose();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      paused: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const content = (
    <div className={`${embedded ? '' : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'}`}>
      <div className={`${embedded ? 'w-full' : 'bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden'}`}>
        {/* Header */}
        {!embedded && (
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <QrCode className="h-6 w-6 mr-2 text-blue-600" />
              QR Code Scanner
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`${embedded ? 'p-0' : 'p-6 overflow-y-auto max-h-[calc(90vh-140px)]'}`}>
          {!isScanning && !scannedData && (
            <div className={`text-center ${embedded ? 'py-8' : 'py-12'}`}>
              <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Scan Production QR Code
              </h3>
              <p className="text-gray-600 mb-6">
                Scan QR codes from production orders, challans, or materials to track progress and verify details.
              </p>
              <button
                onClick={startScanning}
                className="inline-flex items-center px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Start Scanning
              </button>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Scanning...</h3>
                <p className="text-gray-600">Position the QR code within the camera view</p>
              </div>

              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div id="qr-scanner" className="w-full" ref={scannerRef}></div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={stopScanning}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop Scanning
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-gray-600">Processing scanned data...</p>
            </div>
          )}

          {scannedData && !loading && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-2" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Scanned Successfully!</h3>
              </div>

              {/* Order Information Card */}
              {scannedData.order_id && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Information
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 w-1/3">Order ID</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{scannedData.order_id}</td>
                        </tr>
                        {scannedData.order_number && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100">Order Number</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{scannedData.order_number}</td>
                          </tr>
                        )}
                        {scannedData.customer && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100">Customer</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{scannedData.customer}</td>
                          </tr>
                        )}
                        <tr className="border-b border-gray-200">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100">Status</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(scannedData.status)}`}>
                              {scannedData.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                        {scannedData.total_quantity && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100">Total Quantity</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{scannedData.total_quantity}</td>
                          </tr>
                        )}
                        {scannedData.delivery_date && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Delivery Date
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(scannedData.delivery_date).toLocaleDateString()}
                            </td>
                          </tr>
                        )}
                        {scannedData.final_amount && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100">Final Amount</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{scannedData.final_amount?.toFixed(2)}</td>
                          </tr>
                        )}
                        {scannedData.qrData?.current_stage && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100">Current Stage</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{scannedData.qrData.current_stage}</td>
                          </tr>
                        )}
                        {scannedData.last_updated && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Last Updated
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(scannedData.last_updated).toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* QR Scan Metadata */}
                  {scannedData.qr_scan_metadata && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-blue-50 rounded p-3">
                          <label className="text-xs font-semibold text-blue-600 block">QR Scans</label>
                          <p className="text-2xl font-bold text-blue-900">{scannedData.qr_scan_metadata.qr_scan_count}</p>
                        </div>
                        <div className="bg-green-50 rounded p-3">
                          <label className="text-xs font-semibold text-green-600 block">Last Scanned</label>
                          <p className="text-sm text-green-900">
                            {new Date(scannedData.qr_scan_metadata.last_scanned_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded p-3">
                          <label className="text-xs font-semibold text-purple-600 block">Updated</label>
                          <p className="text-sm text-purple-900">
                            {new Date(scannedData.qr_scan_metadata.updated_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Production Progress Card */}
              {scannedData.qrData?.production_progress && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Production Progress
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {scannedData.qrData.production_progress.produced_quantity || 0}
                      </div>
                      <div className="text-sm text-gray-600">Produced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {scannedData.qrData.production_progress.approved_quantity || 0}
                      </div>
                      <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {scannedData.qrData.production_progress.rejected_quantity || 0}
                      </div>
                      <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {scannedData.qrData.production_progress.completed_stages || 0} / {scannedData.qrData.production_progress.total_stages || 0} stages
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${scannedData.qrData.production_progress.total_stages ?
                            ((scannedData.qrData.production_progress.completed_stages || 0) / scannedData.qrData.production_progress.total_stages) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stages */}
                  {scannedData.qrData.production_progress.stages && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Production Stages</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-blue-100">Stage Name</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 bg-blue-100">Status</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 bg-blue-100 w-1/4">Quantity Processed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scannedData.qrData.production_progress.stages.map((stage, index) => (
                              <tr key={index} className="border-b border-blue-200">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{stage.name}</td>
                                <td className="px-4 py-3 text-sm text-center">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stage.status)}`}>
                                    {stage.status?.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-600">{stage.quantity_processed || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Challan Information */}
              {scannedData.challan_number && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-green-600" />
                    Challan Information
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-green-200">
                          <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-green-100 w-1/3">Challan Number</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{scannedData.challan_number}</td>
                        </tr>
                        {scannedData.type && (
                          <tr className="border-b border-green-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-green-100">Type</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{scannedData.type?.toUpperCase()}</td>
                          </tr>
                        )}
                        {scannedData.total_quantity && (
                          <tr className="border-b border-green-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-green-100">Total Quantity</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{scannedData.total_quantity}</td>
                          </tr>
                        )}
                        {scannedData.total_amount && (
                          <tr className="border-b border-green-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 bg-green-100">Total Amount</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{scannedData.total_amount?.toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Materials Information */}
              {scannedData.qrData?.materials && scannedData.qrData.materials.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Materials Required</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-purple-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-purple-100">Material Name</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 bg-purple-100 w-1/3">Quantity & Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedData.qrData.materials.map((material, index) => (
                          <tr key={index} className="border-b border-purple-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{material.name}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{material.quantity} {material.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!embedded && (
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={resetScanner}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Another
                  </button>

                  <div className="space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleUseData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Use This Data
                    </button>
                  </div>
                </div>
              )}

              {embedded && scannedData && (
                <div className="flex justify-center pt-4 border-t border-gray-200">
                  <button
                    onClick={resetScanner}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Another Code
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return content;
};

export default QRCodeScanner;