# Purchase Order (PO) Enhancement - Implementation Guide

## Overview
Enhanced the Purchase Order creation form with:
1. **Pre-filled Project Information** - Automatically populates from linked sales orders
2. **Material Requirements Tracking** - Calculate material needed per product
3. **HSN Code Dropdown** - Select from pre-configured HSN codes instead of manual entry
4. **Material Calculation** - Automatic calculation of total material needed based on product quantity

## Files Created

### Backend

1. **`server/models/HSNCode.js`**
   - New Sequelize model for HSN codes
   - Fields: code, description, category, gst_rate, unit_of_measure, is_active, remarks
   - Table: `hsn_codes`

2. **`server/migrations/20250110_create_hsn_codes_table.js`**
   - Database migration for creating hsn_codes table
   - Includes indexes on code, category, is_active

3. **`server/seeders/seed-hsn-codes.js`**
   - Sample data seeder with 15 common HSN codes
   - Covers fabrics, apparel, and accessories
   - Run with: `node server/seeders/seed-hsn-codes.js`

### Frontend

No new files created. Enhanced existing components.

## Files Modified

### Backend

1. **`server/config/database.js`**
   - Added HSNCode model import (line 106)
   - Added HSNCode to module.exports (line 948)

2. **`server/routes/procurement.js`**
   - Added HSNCode to destructuring (line 15)
   - Added 4 new API endpoints (lines 3600-3733):
     - `GET /api/procurement/hsn-codes` - Get all HSN codes
     - `GET /api/procurement/hsn-codes/:code` - Get specific HSN code
     - `POST /api/procurement/hsn-codes` - Create new HSN code (admin only)
     - `GET /api/procurement/hsn-codes-categories` - Get HSN categories

### Frontend

1. **`client/src/components/procurement/EnhancedPOItemsBuilder_V2.jsx`**
   - Added HSN code state management (lines 39-40)
   - Added `fetchHSNCodes()` function (lines 97-108)
   - Updated `useEffect` to fetch HSN codes on mount (lines 72-75)
   - Replaced HSN text input with dropdown select (lines 755-772)
   - Added material requirements section for fabrics (lines 678-728):
     - "Material Needed" field: Amount of material per unit
     - "UOM for Material" field: Unit of measure (Meters, kg, etc.)
     - Auto-calculation: Shows total material needed (qty × material_needed)

## API Endpoints

### Get All HSN Codes
```
GET /api/procurement/hsn-codes?search=cotton&category=Fabric&is_active=true
Response: { hsnCodes: [...], total: number }
```

### Get HSN Categories
```
GET /api/procurement/hsn-codes-categories
Response: { categories: ['Fabric', 'Accessories', ...] }
```

### Create HSN Code (Admin Only)
```
POST /api/procurement/hsn-codes
Body: { code, description, category, gst_rate, unit_of_measure, remarks }
```

## Usage Instructions

### 1. Setup Database
```bash
# Run migrations
npm run migrate

# Seed sample HSN codes (optional)
node server/seeders/seed-hsn-codes.js
```

### 2. Create Purchase Order

#### Step 1: Pre-filled Information
- When creating PO from Sales Order, project info auto-populates:
  - Project Name
  - Customer Name
  - Expected Delivery Date
  - Priority

#### Step 2: Add Items
- Click "Add Item" button to add materials
- For each item:

#### Step 3: Select HSN Code
- HSN Code field is now a dropdown
- Select from pre-configured HSN codes
- Auto-fetches on component load

#### Step 4: Material Requirements (for Fabric items)
- **Material Needed**: Amount needed per unit (e.g., 2.5 meters per shirt)
- **UOM for Material**: Unit of measure (Meters, kg, Pieces, etc.)
- **Total Material**: Auto-calculated = Material Needed × Product Quantity
  - Example: 2.5 × 200 shirts = 500 meters needed

#### Step 5: Save Purchase Order
- System saves all material requirement data with the PO
- Can be viewed and edited later

## Example Scenario

**Sales Order**: Create 200 shirts and 200 pants

**PO Creation**:
1. Project Info: Pre-filled from sales order
2. Item 1 (Shirts):
   - Type: Fabric
   - Material: Cotton
   - HSN Code: 5208 (from dropdown)
   - Quantity: 200 units
   - Material Needed: 2.5 meters per unit
   - Material UOM: Meters
   - **Total Material: 500 meters**

3. Item 2 (Pants):
   - Type: Fabric
   - Material: Cotton Blend
   - HSN Code: 5209 (from dropdown)
   - Quantity: 200 units
   - Material Needed: 3.0 meters per unit
   - Material UOM: Meters
   - **Total Material: 600 meters**

4. Item 3 (Buttons):
   - Type: Accessories
   - HSN Code: 9606 (from dropdown)
   - Quantity: 4000 pieces (200 × 20 buttons per shirt)

## Database Schema

### HSN Codes Table
```sql
CREATE TABLE hsn_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  gst_rate DECIMAL(5,2) DEFAULT 0,
  unit_of_measure VARCHAR(50) DEFAULT 'Meters',
  is_active BOOLEAN DEFAULT true,
  remarks TEXT,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Purchase Order Items (existing, now includes)
```
{
  ...existing fields...,
  material_needed: number,           // Amount needed per unit
  material_uom: string,               // Unit of measure for material
  // Example: 2.5 meters per unit
}
```

## Testing Checklist

- [ ] HSN Codes table created and seeded
- [ ] API endpoints working and returning data
- [ ] HSN Code dropdown loading without errors
- [ ] Material requirements fields displaying for fabric items
- [ ] Material calculation showing correct totals
- [ ] PO creation/editing saving material data correctly
- [ ] Pre-filled project info from sales order working
- [ ] Can select HSN codes from dropdown
- [ ] HSN Code validation working
- [ ] All calculations updating correctly on qty/material changes

## Troubleshooting

### HSN Codes not loading
1. Check if migration ran: `SELECT * FROM hsn_codes`
2. Verify API endpoint: `GET /api/procurement/hsn-codes`
3. Check console for CORS or authentication errors

### Material calculation not showing
1. Verify item.type === 'fabric'
2. Check if material_needed and quantity fields have values
3. Open browser console to see any errors

### Pre-filled data not appearing
1. Verify linked_sales_order_id is set when creating PO
2. Check if sales order has items with quantity data
3. Ensure customer_name is populated in sales order

## Future Enhancements

1. **Material Waste Factor**: Add % waste to calculate actual fabric needed
2. **Auto-populate from BOM**: Fetch material requirements from Bill of Materials
3. **Vendor Pricing**: Link HSN codes to vendor-specific pricing
4. **Historical Analysis**: Track material usage patterns
5. **Bulk HSN Upload**: Import HSN codes from CSV/Excel

## Support

For issues or questions:
1. Check database structure matches schema
2. Verify API responses in network tab
3. Check server logs for errors
4. Ensure user has procurement/admin role for API access
