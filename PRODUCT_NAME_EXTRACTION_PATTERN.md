# Product Name Extraction Pattern - Implementation Guide

## 📚 Overview

This document explains the **reusable pattern** used to fix the "Unknown Product" issue and how to apply it to similar problems in the codebase.

---

## 🎯 The Problem Pattern

Occurs when:

1. Data records have optional foreign key relationships (e.g., `product_id` can be NULL)
2. The referenced data is stored in multiple formats/locations
3. The application tries to display the data without fallback logic
4. Users see placeholder text like "Unknown Product", "N/A", or "Unspecified"

---

## ✨ The Solution Pattern

### Step 1: Identify All Data Sources

For any field that shows "Unknown [Item]", list ALL places where the actual data might be:

```javascript
// Example: Product Name
// Data might exist in:
1. product.name (direct link)
2. salesOrder.garment_specifications.product_type (nested JSON)
3. salesOrder.items[0].product_name (array within JSON)
4. productionOrder.specifications.product_name (order-level specs)
5. productionOrder.project_reference (composite fallback)
```

### Step 2: Create Extraction Helper Function

```javascript
// ✅ PATTERN: Multi-source extraction with fallbacks
const getProductName = (order) => {
  // 1. PRIMARY: Direct relationship
  if (order.product?.name) return order.product.name;

  // 2. SECONDARY: Nested in related object
  if (order.salesOrder) {
    try {
      const specs =
        typeof order.salesOrder.garment_specifications === "string"
          ? JSON.parse(order.salesOrder.garment_specifications)
          : order.salesOrder.garment_specifications;
      if (specs?.product_type) return specs.product_type;
    } catch (e) {
      // JSON parse error - continue to next source
    }

    // 2B: SECONDARY (Alternative): Array within related object
    try {
      const items =
        typeof order.salesOrder.items === "string"
          ? JSON.parse(order.salesOrder.items)
          : order.salesOrder.items;
      if (Array.isArray(items) && items[0]?.product_name) {
        return items[0].product_name;
      }
    } catch (e) {
      // Continue
    }
  }

  // 3. TERTIARY: Own object specs
  if (order.specifications) {
    try {
      const specs =
        typeof order.specifications === "string"
          ? JSON.parse(order.specifications)
          : order.specifications;
      if (specs?.product_name) return specs.product_name;
    } catch (e) {
      // Continue
    }
  }

  // 4. QUARTERNARY: Composite display
  if (order.project_reference) {
    return `Project: ${order.project_reference}`;
  }

  // 5. ULTIMATE FALLBACK
  return "Unknown Product";
};
```

### Step 3: Apply at Backend (API Enhancement)

**Location**: Endpoint that returns the data

```javascript
// ✅ PATTERN: Backend enrichment
router.get("/endpoint", async (req, res) => {
  try {
    let records = await Model.findAll({
      include: [
        { model: Product, as: "product" },
        {
          model: SalesOrder,
          as: "salesOrder",
          // 🔑 KEY: Include fields you'll extract from
          attributes: ["id", "order_number", "garment_specifications", "items"],
        },
      ],
    });

    // ✅ ENRICHMENT: Transform before sending
    const enrichedRecords = records.map((record) => {
      const recordObj = record.toJSON();

      // Only enrich if primary source is missing
      if (!recordObj.product?.name) {
        let name = extractProductName(recordObj); // Use helper function

        if (name && !recordObj.product) {
          recordObj.product = {};
        }

        if (name) {
          recordObj.product.name = name;
          recordObj.product.isEnhanced = true; // Flag enriched data
        }
      }

      return recordObj;
    });

    res.json({ records: enrichedRecords });
  } catch (error) {
    // Error handling
  }
});
```

### Step 4: Apply at Frontend (Component Level)

**Pattern A: Direct in Component**

```javascript
// Use directly in component where data is mapped
const ChildComponent = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const response = await api.get('/endpoint');
    const transformed = response.data.records.map(item => ({
      id: item.id,
      // ✅ PATTERN: Extract at mapping time
      name: getProductName(item) || 'Unknown',
      // ... other fields
    }));
    setData(transformed);
  };

  return (
    <div>
      {data.map(item => (
        <h3>{item.name}</h3> {/* Now shows real name */}
      ))}
    </div>
  );
};
```

**Pattern B: Display-time Extraction**

```javascript
// Use when displaying (doesn't require transformation)
const DisplayComponent = ({ item }) => {
  return (
    <div>
      <h3>{getProductName(item)}</h3> {/* Called at render time */}
    </div>
  );
};
```

---

## 🔄 Decision Tree: Where to Extract?

```
┌─ Is the data in the API response?
│  YES → Extract at BACKEND (more efficient)
│  NO → Extract at FRONTEND
│
└─ Is the same data used in multiple components?
   YES → Create utility function in utils/
   NO → Add helper in component file
```

---

## 📝 Applying to Other Fields

### Example 1: Customer Name

```javascript
// Problem: Shows "Unknown Customer" instead of actual name
const getCustomerName = (order) => {
  if (order.customer?.name) return order.customer.name;
  if (order.salesOrder?.customer?.name) return order.salesOrder.customer.name;
  if (order.specifications?.customer_name) {
    return typeof order.specifications === "string"
      ? JSON.parse(order.specifications).customer_name
      : order.specifications.customer_name;
  }
  return "Unknown Customer";
};
```

### Example 2: Vendor Name

```javascript
// Problem: Shows "Unknown Vendor" for outsourced orders
const getVendorName = (stage) => {
  if (stage.vendor?.name) return stage.vendor.name;
  if (stage.vendor_name) return stage.vendor_name;
  if (stage.outsource_vendor) return stage.outsource_vendor;
  return "Unknown Vendor";
};
```

### Example 3: Material Name

```javascript
// Problem: Shows "Unknown Material" in stock tracking
const getMaterialName = (allocation) => {
  if (allocation.inventory?.name) return allocation.inventory.name;
  if (allocation.material_name) return allocation.material_name;
  if (allocation.specifications?.material_type) {
    return typeof allocation.specifications === "string"
      ? JSON.parse(allocation.specifications).material_type
      : allocation.specifications.material_type;
  }
  return "Unknown Material";
};
```

---

## ⚙️ Best Practices

### 1. Always Try JSON Parse in Try-Catch

```javascript
// ✅ GOOD: Handles invalid JSON gracefully
try {
  const specs =
    typeof obj.specs === "string" ? JSON.parse(obj.specs) : obj.specs;
  // Use specs safely
} catch (e) {
  // Continue to next source
}

// ❌ BAD: Crashes on invalid JSON
const specs = JSON.parse(obj.specs); // What if it's already an object?
```

### 2. Use Optional Chaining

```javascript
// ✅ GOOD: Prevents "Cannot read property of undefined"
if (order.salesOrder?.customer?.name) {
}

// ❌ BAD: Crashes if intermediate property is undefined
if (order.salesOrder.customer.name) {
}
```

### 3. Check Array Length Before Access

```javascript
// ✅ GOOD: Safe array access
if (Array.isArray(items) && items.length > 0) {
  return items[0].name;
}

// ❌ BAD: Crashes if items is not an array
return items[0].name;
```

### 4. Flag Enriched Data (Optional but Helpful)

```javascript
// Mark data that was enriched from alternative sources
if (productName && !recordObj.product?.id) {
  recordObj.product.isEnhanced = true;
}

// Useful for debugging and future improvements
// Can filter: "Show only real product links" vs "Show all with enrichment"
```

### 5. Maintain Consistent Ordering

```javascript
// ✅ GOOD: Clear priority order
// 1. Direct relationship
// 2. Parent object relationship
// 3. Self reference
// 4. Composite/fallback
// 5. Generic fallback

// ❌ BAD: Random order makes maintenance hard
```

---

## 📊 Performance Considerations

### Backend Enrichment (Recommended for:)

- ✅ Frequently accessed data
- ✅ Complex extraction logic
- ✅ Helps multiple frontend components
- ✅ Expensive computations

### Frontend Extraction (Recommended for:)

- ✅ Simple lookups
- ✅ Rarely accessed data
- ✅ Component-specific display logic
- ✅ Dynamic user inputs

### Hybrid Approach (Recommended for:)

- ✅ Backend does primary enrichment
- ✅ Frontend does defensive fallback
- ✅ Catches API inconsistencies
- ✅ Provides defense in depth

---

## 🧪 Testing the Pattern

### Test Case 1: Primary Source Available

```javascript
const order = {
  product: { name: "Shirt" },
};
expect(getProductName(order)).toBe("Shirt"); // ✅ Should pass
```

### Test Case 2: Secondary Source (Specs)

```javascript
const order = {
  product: null,
  salesOrder: {
    garment_specifications: JSON.stringify({ product_type: "Trouser" }),
  },
};
expect(getProductName(order)).toBe("Trouser"); // ✅ Should pass
```

### Test Case 3: Secondary Source (Items)

```javascript
const order = {
  product: null,
  salesOrder: {
    items: JSON.stringify([{ product_name: "Blazer" }]),
  },
};
expect(getProductName(order)).toBe("Blazer"); // ✅ Should pass
```

### Test Case 4: Invalid JSON

```javascript
const order = {
  product: null,
  salesOrder: {
    garment_specifications: "NOT_VALID_JSON",
  },
  specifications: JSON.stringify({ product_name: "Vest" }),
};
expect(getProductName(order)).toBe("Vest"); // ✅ Should gracefully fall through
```

### Test Case 5: All Sources Empty

```javascript
const order = {
  product: null,
  salesOrder: null,
  specifications: null,
};
expect(getProductName(order)).toBe("Unknown Product"); // ✅ Should return fallback
```

---

## 🔗 Related Issues This Pattern Can Fix

1. **Unknown Vendor** - Apply to outsourced orders
2. **Unknown Customer** - Apply to sales/procurement
3. **Unnamed Material** - Apply to inventory
4. **Missing Department** - Apply to user assignments
5. **Unknown Status** - Apply to status tracking
6. **Unnamed Project** - Apply to project tracking

---

## 📚 Further Reading

- [Sequelize Eager Loading](https://sequelize.org/docs/v6/other-topics/eager-loading/)
- [JavaScript Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [JSON Parsing Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

---

## 📌 Summary

This pattern solves the **"Unknown [Item]"** problem by:

1. ✅ Identifying all data sources
2. ✅ Creating prioritized extraction helper
3. ✅ Applying at backend for efficiency
4. ✅ Applying at frontend for safety
5. ✅ Handling errors gracefully
6. ✅ Providing meaningful fallbacks
7. ✅ Maintaining code consistency

**Result**: Professional UI with real data instead of placeholder text.
