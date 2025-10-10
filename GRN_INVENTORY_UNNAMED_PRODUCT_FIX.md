# GRN to Inventory - "Unnamed Product" Fix

## Issue Summary
When adding verified GRN items to inventory, products were showing as **"Unnamed Product"** with **"N/A"** descriptions, missing barcode, and incomplete details in the inventory dashboard.

## Root Cause
The **Inventory model has merged product fields** (`product_name`, `description`, `category`, `hsn_code`, `color`, `specifications`, `cost_price`, `selling_price`, etc.) directly into the inventory table.

However, the GRN add-to-inventory endpoints were **only setting `product_id`** without filling these merged fields, causing them to default to:
- `product_name`: "Unnamed Product" (default value)
- `description`: NULL (shows as "N/A")
- Other fields: NULL or defaults

## Files Modified
✅ **`server/routes/grn.js`** - 3 locations fixed:
1. **Line ~1220**: `/grn/:id/add-to-inventory` endpoint (manual add)
2. **Line ~750**: Auto-add when GRN is verified without discrepancies
3. **Line ~1030**: Auto-add when discrepancy is approved by manager

## Changes Made

### Before (Missing Data)
```javascript
inventoryItem = await Inventory.create({
  product_id: product ? product.id : null,
  purchase_order_id: grn.purchase_order_id,
  location: location,
  batch_number: batchBarcode,
  current_stock: parseFloat(item.received_quantity),
  // ... stock fields only
  // ❌ Missing: product_name, description, category, hsn_code, color, specifications
});
```

### After (Complete Data)
```javascript
inventoryItem = await Inventory.create({
  product_id: product ? product.id : null,
  purchase_order_id: grn.purchase_order_id,
  
  // ✅ PRODUCT DETAILS (merged fields)
  product_code: product ? product.product_code : barcode,
  product_name: item.material_name || 'Unnamed Material',
  description: item.description || item.material_name || '',
  category: isFabric ? 'fabric' : 'raw_material',
  product_type: 'raw_material',
  unit_of_measurement: 'meter', // Parsed from item.uom
  hsn_code: item.hsn || null,
  color: item.color || null,
  specifications: {
    gsm: item.gsm || null,
    width: item.width || null,
    uom: item.uom || null,
    source: 'grn_received',
    grn_number: grn.grn_number
  },
  cost_price: parseFloat(item.rate) || 0,
  selling_price: parseFloat(item.rate) * 1.2 || 0,
  
  // STOCK AND LOCATION
  location: location,
  batch_number: batchBarcode,
  current_stock: parseFloat(item.received_quantity),
  // ... all stock fields
});
```

## Data Now Saved from GRN
✅ **Product Name**: From `item.material_name`  
✅ **Description**: From `item.description` or material name  
✅ **Category**: Auto-detected (fabric if has color/gsm/width, else raw_material)  
✅ **Product Type**: raw_material  
✅ **Unit of Measurement**: Parsed from `item.uom` (meter, piece, kg, etc.)  
✅ **HSN Code**: From `item.hsn`  
✅ **Color**: From `item.color`  
✅ **Specifications**: JSON with gsm, width, uom, source, grn_number  
✅ **Cost Price**: From `item.rate`  
✅ **Selling Price**: 20% markup on cost price  
✅ **Barcode**: Auto-generated (INV-YYYYMMDD-XXXXX format)  
✅ **QR Code**: Generated with full traceability  

## Testing Steps

### 1. Create a GRN
- Go to Procurement → Create GRN
- Add materials with complete details:
  - Material Name: "Cotton Fabric"
  - Color: "Blue"
  - GSM: 200
  - Width: 60
  - HSN: 5208
  - Description: "High quality cotton"
  - UOM: Meters
  - Quantity: 100
  - Rate: 50

### 2. Verify GRN
- Go to Inventory → GRN Verification
- Mark as "Verified" (no discrepancies)
- Items should auto-add to inventory

### 3. Check Inventory Dashboard
- Go to Inventory → All Stock
- Look for the new item
- **Expected Result**:
  - ✅ Product Name: "Cotton Fabric" (not "Unnamed Product")
  - ✅ Description: "High quality cotton" (not "N/A")
  - ✅ Barcode: INV-20250117-00001 (auto-generated)
  - ✅ Category: fabric
  - ✅ Color: Blue
  - ✅ Stock: 100.00 meter
  - ✅ All specifications visible

## Benefits
1. ✅ **Complete Product Information**: All GRN data transfers to inventory
2. ✅ **Better Search**: Products searchable by name, HSN, color
3. ✅ **Accurate Reports**: Inventory reports show full details
4. ✅ **Barcode Tracking**: Every item has unique barcode
5. ✅ **Traceability**: QR codes link back to GRN and PO
6. ✅ **No Manual Data Entry**: All fields auto-populated from GRN

## Technical Notes
- The `Inventory` model uses **merged product fields** (not separate Product table join)
- This is intentional for the **inventory-product merge** feature
- Product table is still created/updated for historical compatibility
- But inventory display pulls from inventory table's own fields
- This fix ensures both Product and Inventory fields are populated

## Related Files
- `server/models/Inventory.js` - Inventory model with merged fields
- `server/routes/grn.js` - GRN to inventory endpoints (fixed)
- `server/utils/barcodeUtils.js` - Barcode generation
- `server/utils/qrCodeUtils.js` - QR code generation

## Date Fixed
January 17, 2025

## Status
🟢 **FIXED** - All GRN items now save complete product information to inventory

---
*This fix resolves the "Unnamed Product" issue by ensuring all product details from GRN are saved to the merged fields in the Inventory table.*