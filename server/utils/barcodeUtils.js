const crypto = require('crypto');

/**
 * Generate a unique barcode for inventory item
 * Format: INV-YYYYMMDD-XXXXX
 */
const generateBarcode = (prefix = 'INV') => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
};

/**
 * Generate batch-specific barcode
 * Format: BATCH-PONUMBER-INDEX
 */
const generateBatchBarcode = (poNumber, itemIndex) => {
  const cleanPO = poNumber.replace(/[^a-zA-Z0-9]/g, '');
  return `BATCH-${cleanPO}-${String(itemIndex + 1).padStart(3, '0')}`;
};

/**
 * Generate QR code data for inventory item
 */
const generateInventoryQRData = (inventoryItem, poNumber = null) => {
  return JSON.stringify({
    type: 'INVENTORY',
    id: inventoryItem.id,
    barcode: inventoryItem.barcode,
    product_id: inventoryItem.product_id,
    location: inventoryItem.location,
    quantity: inventoryItem.current_stock,
    po_number: poNumber,
    batch_number: inventoryItem.batch_number,
    generated_at: new Date().toISOString()
  });
};

/**
 * Parse barcode to extract information
 */
const parseBarcode = (barcode) => {
  const parts = barcode.split('-');
  
  if (parts.length >= 3) {
    return {
      prefix: parts[0],
      date: parts[1],
      uniqueId: parts[2],
      itemIndex: parts[3] ? parseInt(parts[3]) : null
    };
  }
  
  return null;
};

module.exports = {
  generateBarcode,
  generateBatchBarcode,
  generateInventoryQRData,
  parseBarcode
};