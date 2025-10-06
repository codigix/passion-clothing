import React, { useEffect, useRef } from 'react';

const QRCodeDisplay = ({
  data,
  size = 150,
  includeText = true,
  textPosition = 'bottom',
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawQRCode();
    }
  }, [data, size]);

  const drawQRCode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Simple QR-like pattern (placeholder - replace with real QR generation)
    const gridSize = 20;
    const cellSize = size / gridSize;

    ctx.fillStyle = 'black';

    // Draw a simple pattern that resembles a QR code
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Create a pattern - in real implementation, this would be QR algorithm
        const shouldFill = (i + j) % 3 === 0 || i < 3 || j < 3 || i > gridSize - 4 || j > gridSize - 4;
        if (shouldFill) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add some random dots to make it look more like a QR code
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  };

  return (
    <div className={`qr-code-container ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-gray-300"
        title={`QR Code for order data`}
      />
      {includeText && textPosition === 'bottom' && (
        <div className="text-center mt-2">
          <p className="text-xs text-gray-600">Scan to view order details</p>
        </div>
      )}
      {includeText && textPosition === 'top' && (
        <div className="text-center mb-2">
          <p className="text-xs text-gray-600">Scan to view order details</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;