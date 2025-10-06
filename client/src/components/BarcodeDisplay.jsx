import React, { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeDisplay = ({ value, format = 'CODE128', width = 2, height = 40, displayValue = true }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000',
          fontSize: 12
        });
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }
  }, [value, format, width, height, displayValue]);

  if (!value) {
    return (
      <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded">
        <span className="text-gray-500 text-sm">No barcode available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <svg ref={barcodeRef}></svg>
      {displayValue && (
        <span className="text-xs text-gray-600 font-mono">{value}</span>
      )}
    </div>
  );
};

export default BarcodeDisplay;