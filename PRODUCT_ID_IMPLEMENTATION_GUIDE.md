# Product ID Tracking - Implementation Guide

## 🎯 Quick Start

This guide helps you implement Product ID tracking throughout the entire workflow.

---

## 📋 Step-by-Step Implementation

### Step 1: Run Database Migration ✅

```powershell
# Navigate to project root
cd d:\Projects\passion-clothing

# Run the migration script
node add-product-id-tracking.js
```

**What this does:**
- Adds `product_id` column to 8 tables
- Adds `product_name` column for quick reference
- Creates indexes for better performance
- Provides SQL queries to link existing data

---

### Step 2: Update Sequelize Models ✅

The following model files need to be updated to include product_id:

1. ✅ `server/models/SalesOrder.js`
2. ✅ `server/models/PurchaseOrder.js`
3. ✅ `server/models/GoodsReceiptNote.js`
4. ✅ `server/models/ProjectMaterialRequest.js`
5. ✅ `server/models/MaterialDispatch.js`
6. ✅ `server/models/MaterialReceipt.js`
7. ✅ `server/models/MaterialVerification.js`
8. ✅ `server/models/ProductionApproval.js`

**Add these fields to each model:**

```javascript
product_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'products',
    key: 'id'
  },
  comment: 'Final product being manufactured'
},
product_name: {
  type: DataTypes.STRING(200),
  allowNull: true,
  comment: 'Product name for quick reference without joins'
}
```

**Add to indexes array:**
```javascript
indexes: [
  // ... existing indexes ...
  { fields: ['product_id'] }
]
```

---

### Step 3: Update Backend API Routes

#### 3.1 Sales Orders API

**File:** `server/routes/sales.js`

**Endpoint:** `POST /api/sales/orders`

```javascript
// In the create order handler
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { 
      customer_id, 
      product_id,  // ← ADD THIS
      order_date,
      // ... other fields
    } = req.body;

    // Fetch product details if product_id provided
    let product_name = null;
    if (product_id) {
      const product = await Product.findByPk(product_id);
      if (product) {
        product_name = product.name;
      }
    }

    const order = await SalesOrder.create({
      customer_id,
      product_id,      // ← ADD THIS
      product_name,    // ← ADD THIS
      order_date,
      // ... other fields
      created_by: req.user.id
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ error: 'Failed to create sales order' });
  }
});
```

---

#### 3.2 Purchase Orders API

**File:** `server/routes/procurement.js`

**Endpoint:** `POST /api/procurement/purchase-orders`

```javascript
// In the create PO handler
router.post('/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const { 
      vendor_id,
      linked_sales_order_id,
      product_id,  // ← Can come from request OR copied from SO
      // ... other fields
    } = req.body;

    // If linked to Sales Order, copy product_id from there
    let finalProductId = product_id;
    let finalProductName = null;

    if (linked_sales_order_id && !finalProductId) {
      const salesOrder = await SalesOrder.findByPk(linked_sales_order_id);
      if (salesOrder) {
        finalProductId = salesOrder.product_id;
        finalProductName = salesOrder.product_name;
      }
    }

    // If product_id provided directly, fetch product name
    if (finalProductId && !finalProductName) {
      const product = await Product.findByPk(finalProductId);
      if (product) {
        finalProductName = product.name;
      }
    }

    const po = await PurchaseOrder.create({
      vendor_id,
      linked_sales_order_id,
      product_id: finalProductId,        // ← ADD THIS
      product_name: finalProductName,    // ← ADD THIS
      // ... other fields
      created_by: req.user.id
    });

    res.status(201).json(po);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});
```

---

#### 3.3 GRN API

**File:** `server/routes/procurement.js`

**Endpoint:** `POST /api/procurement/grn`

```javascript
// In the create GRN handler
router.post('/grn', authenticateToken, async (req, res) => {
  try {
    const { 
      purchase_order_id,
      // ... other fields
    } = req.body;

    // Copy product_id from Purchase Order
    const po = await PurchaseOrder.findByPk(purchase_order_id);
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    const grn = await GoodsReceiptNote.create({
      purchase_order_id,
      product_id: po.product_id,        // ← COPY FROM PO
      product_name: po.product_name,    // ← COPY FROM PO
      // ... other fields
      created_by: req.user.id
    });

    res.status(201).json(grn);
  } catch (error) {
    console.error('Error creating GRN:', error);
    res.status(500).json({ error: 'Failed to create GRN' });
  }
});
```

---

#### 3.4 MRN (Material Request) API

**File:** `server/routes/manufacturing.js`

**Endpoint:** `POST /api/manufacturing/material-requests`

```javascript
// In the create MRN handler
router.post('/material-requests', authenticateToken, async (req, res) => {
  try {
    const { 
      purchase_order_id,
      sales_order_id,
      // ... other fields
    } = req.body;

    // Copy product_id from PO or SO
    let product_id = null;
    let product_name = null;

    if (purchase_order_id) {
      const po = await PurchaseOrder.findByPk(purchase_order_id);
      if (po) {
        product_id = po.product_id;
        product_name = po.product_name;
      }
    } else if (sales_order_id) {
      const so = await SalesOrder.findByPk(sales_order_id);
      if (so) {
        product_id = so.product_id;
        product_name = so.product_name;
      }
    }

    const mrn = await ProjectMaterialRequest.create({
      purchase_order_id,
      sales_order_id,
      product_id,        // ← ADD THIS
      product_name,      // ← ADD THIS
      // ... other fields
      created_by: req.user.id
    });

    res.status(201).json(mrn);
  } catch (error) {
    console.error('Error creating MRN:', error);
    res.status(500).json({ error: 'Failed to create MRN' });
  }
});
```

---

#### 3.5 Material Dispatch API

**File:** `server/routes/inventory.js`

**Endpoint:** `POST /api/inventory/dispatch`

```javascript
// In the dispatch handler
router.post('/dispatch', authenticateToken, async (req, res) => {
  try {
    const { 
      mrn_request_id,
      // ... other fields
    } = req.body;

    // Copy product_id from MRN
    const mrn = await ProjectMaterialRequest.findByPk(mrn_request_id);
    if (!mrn) {
      return res.status(404).json({ error: 'MRN not found' });
    }

    const dispatch = await MaterialDispatch.create({
      mrn_request_id,
      product_id: mrn.product_id,        // ← COPY FROM MRN
      product_name: mrn.product_name,    // ← COPY FROM MRN
      // ... other fields
      dispatched_by: req.user.id
    });

    res.status(201).json(dispatch);
  } catch (error) {
    console.error('Error creating dispatch:', error);
    res.status(500).json({ error: 'Failed to create dispatch' });
  }
});
```

---

#### 3.6 Material Receipt API

**File:** `server/routes/manufacturing.js`

**Endpoint:** `POST /api/manufacturing/material-receipt`

```javascript
// In the receipt handler
router.post('/material-receipt', authenticateToken, async (req, res) => {
  try {
    const { 
      dispatch_id,
      // ... other fields
    } = req.body;

    // Copy product_id from Dispatch
    const dispatch = await MaterialDispatch.findByPk(dispatch_id);
    if (!dispatch) {
      return res.status(404).json({ error: 'Dispatch not found' });
    }

    const receipt = await MaterialReceipt.create({
      dispatch_id,
      product_id: dispatch.product_id,        // ← COPY FROM DISPATCH
      product_name: dispatch.product_name,    // ← COPY FROM DISPATCH
      // ... other fields
      received_by: req.user.id
    });

    res.status(201).json(receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
});
```

---

#### 3.7 Material Verification API

**File:** `server/routes/manufacturing.js`

**Endpoint:** `POST /api/manufacturing/verify-materials`

```javascript
// In the verification handler
router.post('/verify-materials', authenticateToken, async (req, res) => {
  try {
    const { 
      receipt_id,
      // ... other fields
    } = req.body;

    // Copy product_id from Receipt
    const receipt = await MaterialReceipt.findByPk(receipt_id);
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const verification = await MaterialVerification.create({
      receipt_id,
      product_id: receipt.product_id,        // ← COPY FROM RECEIPT
      product_name: receipt.product_name,    // ← COPY FROM RECEIPT
      // ... other fields
      verified_by: req.user.id
    });

    res.status(201).json(verification);
  } catch (error) {
    console.error('Error creating verification:', error);
    res.status(500).json({ error: 'Failed to create verification' });
  }
});
```

---

#### 3.8 Production Approval API

**File:** `server/routes/manufacturing.js`

**Endpoint:** `POST /api/manufacturing/approve-production`

```javascript
// In the approval handler
router.post('/approve-production', authenticateToken, async (req, res) => {
  try {
    const { 
      verification_id,
      // ... other fields
    } = req.body;

    // Copy product_id from Verification
    const verification = await MaterialVerification.findByPk(verification_id);
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const approval = await ProductionApproval.create({
      verification_id,
      product_id: verification.product_id,        // ← COPY FROM VERIFICATION
      product_name: verification.product_name,    // ← COPY FROM VERIFICATION
      // ... other fields
      approved_by: req.user.id
    });

    res.status(201).json(approval);
  } catch (error) {
    console.error('Error creating approval:', error);
    res.status(500).json({ error: 'Failed to create approval' });
  }
});
```

---

### Step 4: Update Frontend

#### 4.1 Create Product Selection Component

**File:** `client/src/components/common/ProductSelector.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';

export const ProductSelector = ({ value, onChange, required = false, error = false, helperText = '' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      axios.get('/api/products')
        .then(response => {
          setProducts(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={products}
      loading={loading}
      getOptionLabel={(option) => `${option.name} (${option.product_code})`}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Final Product to Manufacture"
          required={required}
          error={error}
          helperText={helperText || "Select the product that will be manufactured"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
```

---

#### 4.2 Create Product Display Component

**File:** `client/src/components/common/ProductInfoCard.jsx`

```jsx
import React from 'react';
import { Paper, Typography, Grid, Chip, Box } from '@mui/material';
import { Inventory as ProductIcon } from '@mui/icons-material';

export const ProductInfoCard = ({ productId, productName, productCode }) => {
  if (!productId && !productName) {
    return null;
  }

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: 'primary.50',
        border: '1px solid',
        borderColor: 'primary.200'
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <ProductIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="primary.main">
          Product Information
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {productId && (
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Product ID
            </Typography>
            <Chip 
              label={`#${productId}`} 
              color="primary" 
              size="small" 
              sx={{ mt: 0.5 }}
            />
          </Grid>
        )}
        
        {productName && (
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Product Name
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>
              {productName}
            </Typography>
          </Grid>
        )}
        
        {productCode && (
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Product Code
            </Typography>
            <Typography variant="body2" fontFamily="monospace" sx={{ mt: 0.5 }}>
              {productCode}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
```

---

#### 4.3 Update Sales Order Form

**File:** `client/src/pages/sales/CreateSalesOrder.jsx`

```jsx
import { ProductSelector } from '../../components/common/ProductSelector';

// Inside the component
const [selectedProduct, setSelectedProduct] = useState(null);

// In the form JSX
<ProductSelector
  value={selectedProduct}
  onChange={(product) => setSelectedProduct(product)}
  required={true}
  error={errors.product_id}
  helperText={errors.product_id ? 'Product is required' : ''}
/>

// In the submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const orderData = {
    customer_id,
    product_id: selectedProduct?.id,     // ← ADD THIS
    product_name: selectedProduct?.name, // ← ADD THIS
    // ... other fields
  };

  try {
    await axios.post('/api/sales/orders', orderData);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

---

#### 4.4 Display Product in All Pages

Add `<ProductInfoCard />` to these pages:

1. **Purchase Order Details** - Show which product materials are for
2. **GRN Details** - Show product context
3. **MRN Details** - Show product for manufacturing
4. **Dispatch Details** - Show product context
5. **Receipt Details** - Show product being manufactured
6. **Verification Details** - Show product context
7. **Approval Details** - Show product to be approved

Example for PO Details Page:

```jsx
import { ProductInfoCard } from '../../components/common/ProductInfoCard';

<ProductInfoCard
  productId={purchaseOrder.product_id}
  productName={purchaseOrder.product_name}
  productCode={purchaseOrder.Product?.product_code}
/>
```

---

### Step 5: Testing Checklist

#### Test Complete Flow with Product ID:

- [ ] **Step 1:** Create Sales Order → Select Product → Verify product_id saved
- [ ] **Step 2:** Create PO from SO → Verify product_id copied
- [ ] **Step 3:** Create GRN → Verify product_id present
- [ ] **Step 4:** Verify GRN → Check product_id maintained
- [ ] **Step 5:** Add to Inventory → Verify product_id in inventory records
- [ ] **Step 6:** Create MRN → Verify product_id copied
- [ ] **Step 7:** Dispatch Materials → Verify product_id present
- [ ] **Step 8:** Receive Materials → Verify product_id maintained
- [ ] **Step 9:** Verify Materials → Check product_id present
- [ ] **Step 10:** Approve Production → Verify product_id carried forward
- [ ] **Step 11:** Start Production → Check Production Order has correct product_id

#### Database Verification:

```sql
-- Trace product_id through entire workflow
SELECT 
  'Sales Order' as stage, id, product_id, product_name, created_at 
FROM sales_orders WHERE id = 1
UNION ALL
SELECT 
  'Purchase Order', id, product_id, product_name, created_at 
FROM purchase_orders WHERE linked_sales_order_id = 1
UNION ALL
SELECT 
  'GRN', id, product_id, product_name, created_at 
FROM goods_receipt_notes WHERE sales_order_id = 1
UNION ALL
SELECT 
  'MRN', id, product_id, product_name, created_at 
FROM project_material_requests WHERE sales_order_id = 1
ORDER BY created_at;
```

---

### Step 6: Update Documentation

Update these files with Product ID information:

- [ ] `SALES_TO_PRODUCTION_COMPLETE_FLOW.md` - Add product selection steps
- [ ] `SALES_TO_PRODUCTION_QUICK_CARD.md` - Add product ID to quick reference
- [ ] `GRN_WORKFLOW_COMPLETE_GUIDE.md` - Add product tracking info
- [ ] `MRN_FLOW_QUICK_START.md` - Add product context
- [ ] `repo.md` - Update Recent Enhancements section

---

## 🎯 Success Metrics

After implementation, you should have:

✅ Product ID in all 8 workflow tables
✅ Product Name for quick reference (no joins needed)
✅ Product selection in Sales Order form
✅ Product info displayed in all detail pages
✅ Automatic product_id carry-forward at each stage
✅ Complete traceability from order to production
✅ Better reporting capabilities

---

## 📊 Reporting Queries

### Material Cost by Product

```sql
SELECT 
  p.name as product_name,
  COUNT(DISTINCT po.id) as purchase_orders,
  SUM(po.final_amount) as total_material_cost
FROM products p
JOIN purchase_orders po ON p.id = po.product_id
GROUP BY p.id, p.name
ORDER BY total_material_cost DESC;
```

### Production Status by Product

```sql
SELECT 
  p.name as product_name,
  prd.status,
  COUNT(*) as order_count,
  SUM(prd.quantity) as total_quantity
FROM products p
JOIN production_orders prd ON p.id = prd.product_id
GROUP BY p.id, p.name, prd.status;
```

### Material Tracking for Product

```sql
SELECT 
  'Purchased' as stage,
  po.po_number as reference,
  po.total_quantity as quantity,
  po.final_amount as amount,
  po.created_at as date
FROM purchase_orders po
WHERE po.product_id = ?
UNION ALL
SELECT 
  'Dispatched',
  md.dispatch_number,
  md.total_items,
  NULL,
  md.dispatched_at
FROM material_dispatches md
WHERE md.product_id = ?
ORDER BY date DESC;
```

---

## 🐛 Troubleshooting

### Product ID not appearing in PO
- Check if Sales Order has product_id
- Verify PO is linked to Sales Order
- Check backend logic copies product_id

### Product ID lost in workflow
- Check each stage copies from previous
- Verify foreign key relationships
- Check API response includes product_id

### Frontend not showing product
- Check ProductInfoCard component import
- Verify product_id in API response
- Check for null/undefined checks

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify database has product_id columns
4. Check model associations

---

**Last Updated:** January 2025  
**Status:** Implementation Guide Complete  
**Next:** Run migration and start updating models