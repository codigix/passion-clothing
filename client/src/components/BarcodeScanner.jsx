import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, Square, Camera } from 'lucide-react';

const BarcodeScanner = ({ onScanSuccess, onScanError, isScanning, setIsScanning }) => {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (isScanning && !scanner) {
      // Initialize scanner
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "barcode-scanner",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
          // Success callback
          onScanSuccess(decodedText, decodedResult);
          setIsScanning(false);
          html5QrcodeScanner.clear();
        },
        (errorMessage) => {
          // Error callback - we can ignore most errors as they're normal during scanning
          if (onScanError && errorMessage.includes('NotFoundException')) {
            onScanError(errorMessage);
          }
        }
      );

      setScanner(html5QrcodeScanner);
    } else if (!isScanning && scanner) {
      // Stop scanning
      scanner.clear();
      setScanner(null);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isScanning, scanner, onScanSuccess, onScanError, setIsScanning]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-2">Click to start barcode scanning</p>
            <button
              onClick={startScanning}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Scan className="h-5 w-5 mr-2" />
              Start Scanning
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Scanning...</h3>
            <button
              onClick={stopScanning}
              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </button>
          </div>

          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <div id="barcode-scanner" className="w-full"></div>
          </div>

          <div className="text-center text-sm text-gray-500">
            Position barcode within the scanning area
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;