/**
 * QR Code generation utility for order tracking
 * Generates QR codes containing order information and status
 */

// Generate QR code data URL using a simple canvas-based approach
export const generateQRCode = (data, size = 200) => {
  // For now, we'll create a simple data URL with encoded information
  // In a real application, you'd use a library like qrcode.js or react-qr-code
  const qrData = JSON.stringify(data);
  const encodedData = btoa(qrData);

  // Create a simple data URL (this is a placeholder - real QR generation would be more complex)
  const qrString = `QR:${encodedData}`;

  // Return a promise that resolves with a data URL
  return new Promise((resolve) => {
    // Simulate QR code generation delay
    setTimeout(() => {
      // For demo purposes, return a placeholder
      // In real implementation, use a proper QR library
      resolve(`data:text/plain;base64,${btoa(qrString)}`);
    }, 100);
  });
};

// Generate order QR code data structure
export const generateOrderQRData = (order, stage = 'sales') => {
  return {
    orderId: order.id,
    orderNo: order.order_no,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    deliveryDate: order.delivery_date,
    totalAmount: order.total_amount,
    status: order.status,
    currentStage: stage,
    stageTimestamp: new Date().toISOString(),
    garmentSpecs: order.garment_specifications || {},
    items: order.items || [],
    workflow: {
      sales: {
        created: order.created_at,
        qrGenerated: new Date().toISOString()
      }
    }
  };
};

// Update QR data with new stage information
export const updateOrderQRData = (existingQRData, newStage, additionalData = {}) => {
  const updatedData = { ...existingQRData };

  if (!updatedData.workflow) {
    updatedData.workflow = {};
  }

  updatedData.workflow[newStage] = {
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  updatedData.currentStage = newStage;
  updatedData.lastUpdated = new Date().toISOString();

  return updatedData;
};

// Decode QR code data
export const decodeQRData = (qrString) => {
  try {
    // Remove the QR: prefix if present
    const cleanString = qrString.replace(/^QR:/, '');
    const decodedData = atob(cleanString);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Failed to decode QR data:', error);
    return null;
  }
};

// Generate QR code for display (placeholder function)
export const generateQRCodeForDisplay = (data, options = {}) => {
  const {
    size = 150,
    includeText = true,
    textPosition = 'bottom'
  } = options;

  return {
    dataUrl: `data:image/svg+xml;base64,${btoa(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">QR Code</text></svg>`)}`,
    size,
    includeText,
    textPosition
  };
};