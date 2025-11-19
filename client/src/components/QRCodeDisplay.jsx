import React, { useEffect, useState } from 'react';
import { generateQRCode } from '../utils/qrCode';

const QRCodeDisplay = ({
  data,
  value,
  size = 150,
  includeText = true,
  textPosition = 'bottom',
  className = ''
}) => {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateQR = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use data prop first, fallback to value (for simple strings)
        const qrData = data || (typeof value === 'string' ? { text: value } : value);
        const dataUrl = await generateQRCode(qrData, size);
        setQrImage(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (data || value) {
      generateQR();
    }
  }, [data, value, size]);

  if (loading) {
    return (
      <div className={`qr-code-container flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-600 mt-2">Generating QR Code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`qr-code-container ${className}`}>
        <div className="text-center p-4 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`qr-code-container ${className}`}>
      {qrImage && (
        <div className="flex flex-col items-center">
          <img
            src={qrImage}
            alt="QR Code"
            width={size}
            height={size}
            className="border-2 border-gray-300 rounded"
            title="Scan to view order details"
          />
          {includeText && textPosition === 'bottom' && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600">Scan to view order details</p>
            </div>
          )}
        </div>
      )}
      {includeText && textPosition === 'top' && !qrImage && (
        <div className="text-center mb-2">
          <p className="text-xs text-gray-600">Scan to view order details</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;