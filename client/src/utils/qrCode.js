/**
 * QR Code generation utility for order tracking
 * Generates QR codes containing order information and status
 */
import QRCode from 'qrcode';
import { getNetworkBaseUrl } from './networkUtils';

// Generate QR code data URL as actual scannable QR code
export const generateQRCode = async (data, size = 200, useUrl = true) => {
  try {
    let qrData;
    
    if (useUrl) {
      // Generate a URL instead of embedding raw JSON
      const dataParam = encodeURIComponent(JSON.stringify(data));
      const baseUrl = await getNetworkBaseUrl();
      qrData = `${baseUrl}/qr/view?data=${dataParam}`;
    } else {
      // Fallback to embedding raw JSON
      qrData = JSON.stringify(data);
    }
    
    // Generate actual QR code as data URL
    const dataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: size,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
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