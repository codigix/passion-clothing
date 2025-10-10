# Barcode Generation Feature for Inventory Items

## Overview
The system automatically generates unique barcodes and QR codes for each inventory item when it's stored in the inventory through the GRN (Goods Receipt Note) process.

## Barcode Format

### Inventory Barcode
- **Format**: `INV-YYYYMMDD-XXXXX`
- **Example**: `INV-20240115-A3F2B`
- **Components**:
  - `INV`: Prefix indicating inventory item
  - `YYYYMMDD`: Date of creation
  - `XXXXX`: Random unique identifier (hexadecimal)

### Batch Barcode
- **Format**: `BATCH-PONUMBER-XXX`
- **Example**: `BATCH-PO2024011500001-001`
- **Components**:
  - `BATCH`: Prefix indicating batch number
  - `PONUMBER`: Purchase Order number (sanitized)
  - `XXX`: Item index in the PO (padded to 3 digits)

## QR Code Data
Each inventory item also gets a QR code containing JSON data:
```json
{
  "type": "INVENTORY",
  "id": 123,
  "barcode": "INV-20240115-A3F2B",
  "product_id": 45,
  "location": "Warehouse-A-Rack-1",
  "quantity": 100,
  "po_number": "PO-20240115-00001",
  "batch_number": "BATCH-PO2024011500001-001",
  "generated_at": "2024-01-15T10:30:00.000Z"
}
```

## When Barcodes are Generated

Barcodes are automatically generated when:
1. **GRN is added to inventory** - When a verified GRN is moved to inventory
2. **Direct inventory creation** - When inventory is created directly from a PO

## API Endpoints

### 1. Get Inventory Item by Barcode
```http
GET /api/inventory/barcode/:barcode
```
**Response**:
```json
{
  "inventory": { /* inventory item details */ },
  "barcode_info": {
    "prefix": "INV",
    "date": "20240115",
    "uniqueId": "A3F2B"
  },
  "qr_data": { /* parsed QR code data */ }
}
```

### 2. Get Inventory Items by Batch Number
```http
GET /api/inventory/batch/:batchNumber
```
**Response**:
```json
{
  "batch_number": "BATCH-PO2024011500001-001",
  "items_count": 5,
  "total_quantity": 500,
  "total_value": 50000,
  "items": [ /* array of inventory items */ ]
}
```

### 3. Generate Barcode Labels for Printing
```http
POST /api/inventory/barcodes/print
Content-Type: application/json

{
  "inventory_ids": [1, 2, 3, 4, 5]
}
```
**Response**:
```json
{
  "labels": [
    {
      "id": 1,
      "barcode": "INV-20240115-A3F2B",
      "batch_number": "BATCH-PO2024011500001-001",
      "product_name": "Cotton Fabric",
      "location": "Warehouse-A",
      "quantity": 100,
      "unit_cost": 500,
      "po_number": "PO-20240115-00001",
      "qr_code": "{ /* JSON string */ }",
      "qr_data": { /* parsed JSON */ },
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 4. Scan Barcode (Mobile/Scanner Integration)
```http
POST /api/inventory/barcode/scan
Content-Type: application/json

{
  "barcode": "INV-20240115-A3F2B",
  "action": "view",  // or "add", "remove", "relocate"
  "quantity": 10,    // required for add/remove
  "location": "Warehouse-B",  // required for relocate
  "notes": "Optional notes"
}
```

**Actions**:
- `view`: Just retrieve item information (no changes)
- `add`: Add quantity to inventory
- `remove`: Remove quantity from inventory
- `relocate`: Move item to a different location

**Response**:
```json
{
  "message": "Inventory add successful",
  "inventory": { /* updated inventory item */ },
  "previous_stock": 100,
  "new_stock": 110,
  "change": "+10"
}
```

## Database Schema

### Inventory Table
```sql
barcode VARCHAR(200) NULL,
qr_code TEXT NULL,
batch_number VARCHAR(50) NULL,
```

### Indexes
- `barcode` field is indexed for fast lookups
- `batch_number` field is indexed for batch tracking

## Usage in Frontend

### Scanning Barcodes
1. Use a barcode scanner device or mobile camera
2. Send scanned barcode to `/api/inventory/barcode/scan`
3. Display item information or perform actions

### Printing Labels
1. Select inventory items to print
2. Call `/api/inventory/barcodes/print` with item IDs
3. Use the returned data to generate printable labels
4. Print using a label printer or standard printer

### Label Printing Libraries (Recommended)
- **Frontend**: 
  - `react-barcode` or `jsbarcode` for barcode generation
  - `qrcode.react` or `qrcode` for QR code generation
- **Backend**: 
  - `bwip-js` for server-side barcode generation
  - `qrcode` for server-side QR code generation

## Example Frontend Implementation

### React Component for Barcode Scanner
```jsx
import React, { useState } from 'react';
import BarcodeScanner from 'react-barcode-scanner';

function InventoryScanner() {
  const [scannedData, setScannedData] = useState(null);

  const handleScan = async (barcode) => {
    try {
      const response = await fetch('/api/inventory/barcode/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, action: 'view' })
      });
      const data = await response.json();
      setScannedData(data);
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  return (
    <div>
      <BarcodeScanner onScan={handleScan} />
      {scannedData && (
        <div>
          <h3>{scannedData.inventory.product?.name}</h3>
          <p>Stock: {scannedData.inventory.current_stock}</p>
          <p>Location: {scannedData.inventory.location}</p>
        </div>
      )}
    </div>
  );
}
```

### React Component for Label Printing
```jsx
import React from 'react';
import Barcode from 'react-barcode';
import QRCode from 'qrcode.react';

function InventoryLabel({ label }) {
  return (
    <div className="label" style={{ width: '4in', height: '2in', padding: '10px' }}>
      <h4>{label.product_name}</h4>
      <Barcode value={label.barcode} width={1} height={40} />
      <QRCode value={label.qr_code} size={80} />
      <div>
        <p>Batch: {label.batch_number}</p>
        <p>Location: {label.location}</p>
        <p>Qty: {label.quantity}</p>
      </div>
    </div>
  );
}

function PrintLabels({ inventoryIds }) {
  const [labels, setLabels] = useState([]);

  const fetchLabels = async () => {
    const response = await fetch('/api/inventory/barcodes/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventory_ids: inventoryIds })
    });
    const data = await response.json();
    setLabels(data.labels);
  };

  useEffect(() => {
    fetchLabels();
  }, [inventoryIds]);

  return (
    <div>
      {labels.map(label => (
        <InventoryLabel key={label.id} label={label} />
      ))}
      <button onClick={() => window.print()}>Print Labels</button>
    </div>
  );
}
```

## Benefits

1. **Unique Identification**: Each inventory item has a unique barcode
2. **Traceability**: Track items from PO to inventory to consumption
3. **Batch Tracking**: Group items by batch for quality control
4. **Quick Lookup**: Scan barcode to instantly retrieve item information
5. **Mobile Integration**: Use mobile devices for inventory management
6. **Audit Trail**: All barcode scans create movement records
7. **Error Reduction**: Minimize manual data entry errors

## Future Enhancements

1. **Serial Number Tracking**: For high-value items
2. **RFID Integration**: For automated tracking
3. **Barcode History**: Track all scans and movements
4. **Multi-location Support**: Track items across multiple warehouses
5. **Expiry Tracking**: Alert when items approach expiry date
6. **Automated Reordering**: Trigger PO when stock falls below reorder level