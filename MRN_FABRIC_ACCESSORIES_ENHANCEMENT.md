# MRN Form - Fabric & Accessories Enhancement

## ✅ Implementation Complete

**Date:** January 2025  
**Component:** Create MRN (Material Request Note) Form  
**File:** `client/src/pages/manufacturing/CreateMRMPage.jsx`

---

## 🎯 Overview

The Create MRN form has been enhanced with **dynamic material type selection** that allows users to choose between **Fabric** and **Accessories** materials, with each type showing appropriate fields.

---

## 🆕 What's New

### 1. **Form-Level Default Material Type Selector**
   - Located at the top of the form
   - Sets the default type for newly added materials
   - Toggle between **Fabric** (purple) and **Accessories** (pink)
   - Visual indicators with icons (FaCut for fabric, FaTags for accessories)

### 2. **Per-Row Material Type Override**
   - Each material row has its own type selector
   - Can be different from the form-level default
   - Dynamic field display based on selection
   - Color-coded borders (purple for fabric, pink for accessories)

### 3. **Material Type-Specific Fields**

#### **Fabric Fields** (7 specialized fields)
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Fabric Name | ✅ Yes | Text | e.g., "Cotton Plain Fabric" |
| Fabric Type | ✅ Yes | Dropdown | Cotton, Polyester, Silk, etc. |
| Color | ✅ Yes | Text | e.g., "Navy Blue", "White" |
| GSM | ❌ No | Number | Grams per Square Meter (e.g., 180) |
| Width | ❌ No | Text | e.g., "60 inches", "150 cm" |
| Shrinkage % | ❌ No | Number | e.g., 3 (0-100 range) |
| Finish Type | ❌ No | Dropdown | Plain, Mercerized, Sanforized, etc. |
| Quantity | ✅ Yes | Number | Amount needed |
| Unit | ✅ Yes | Dropdown | Meters, Yards, Kilograms, Rolls |
| Additional Notes | ❌ No | Textarea | Special requirements |

#### **Accessories Fields** (7 specialized fields)
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| Accessory Type | ✅ Yes | Dropdown | Button, Zipper, Thread, Label, etc. |
| Color | ❌ No | Text | e.g., "Black", "White", "Gold" |
| Size/Length | ❌ No | Text | e.g., "12mm", "20 inches" |
| Quantity Per Unit | ❌ No | Number | e.g., 4 (buttons per garment) |
| Brand | ❌ No | Text | e.g., "YKK", "Coats" |
| Quantity | ✅ Yes | Number | Total amount needed |
| Unit | ✅ Yes | Dropdown | Pieces, Units, Boxes, Dozens, Gross |
| Additional Notes | ❌ No | Textarea | Special requirements |

---

## 🎨 Visual Design

### Color Coding
- **Fabric Materials**: Purple theme
  - Border: `border-purple-300`
  - Background: `bg-purple-50`
  - Active button: `bg-purple-500`
  - Focus ring: `ring-purple-500`

- **Accessories Materials**: Pink theme
  - Border: `border-pink-300`
  - Background: `bg-pink-50`
  - Active button: `bg-pink-500`
  - Focus ring: `ring-pink-500`

### Icons
- **Fabric**: `<FaCut />` - Scissors icon
- **Accessories**: `<FaTags />` - Tags icon

---

## 💾 Data Structure

### Material Object (Internal State)
```javascript
{
  material_type: 'fabric' | 'accessories',
  quantity_required: '',
  unit: '',
  description: '',
  
  // Fabric-specific fields
  fabric_name: '',
  fabric_type: '',
  color: '',
  gsm: '',
  width: '',
  shrinkage: '',
  finish_type: '',
  
  // Accessories-specific fields
  accessory_type: '',
  accessory_color: '',
  size_length: '',
  quantity_per_unit: '',
  brand: ''
}
```

### Backend Payload (Submitted Data)

#### For Fabric:
```json
{
  "material_type": "fabric",
  "material_name": "Cotton Plain Fabric",
  "fabric_name": "Cotton Plain Fabric",
  "fabric_type": "Cotton",
  "color": "Navy Blue",
  "gsm": "180",
  "width": "60 inches",
  "shrinkage": "3",
  "finish_type": "Sanforized",
  "quantity_required": 100,
  "unit": "meters",
  "description": "High quality cotton fabric",
  "specifications": "Cotton - Navy Blue - 180 GSM - 60 inches",
  "available_qty": 0,
  "issued_qty": 0,
  "balance_qty": 100,
  "status": "pending"
}
```

#### For Accessories:
```json
{
  "material_type": "accessories",
  "material_name": "Button",
  "accessory_type": "Button",
  "color": "Black",
  "size_length": "12mm",
  "quantity_per_unit": "4",
  "brand": "YKK",
  "quantity_required": 400,
  "unit": "pieces",
  "description": "Matching buttons for shirts",
  "specifications": "Button - 12mm - Black",
  "available_qty": 0,
  "issued_qty": 0,
  "balance_qty": 400,
  "status": "pending"
}
```

---

## 🔄 Workflow

### User Journey

1. **Navigate to Create MRN**
   - From Manufacturing Dashboard → "Create MRN" button
   - OR from Material Requests page → "Create Request" button

2. **Set Default Material Type**
   - Click either **Fabric** or **Accessories** button
   - This becomes default for new materials

3. **Fill Request Information**
   - Project Name (required)
   - Priority: Low, Medium, High, Urgent
   - Required By Date (required)
   - Notes (optional)

4. **Add Materials**
   - First material row appears with default type
   - Override type per row if needed
   - Fill type-specific fields
   - Add more materials with "Add Material" button

5. **Submit**
   - Form validates required fields per material type
   - Creates MRN with unique number (MRN-YYYYMMDD-XXXXX)
   - Navigates to Material Requests list

---

## ✅ Validation Rules

### Fabric Materials
- ✅ Fabric Name is required
- ✅ Fabric Type is required
- ✅ Color is required
- ✅ Quantity must be > 0
- ✅ Unit is required

### Accessories Materials
- ✅ Accessory Type is required
- ✅ Quantity must be > 0
- ✅ Unit is required

### Common Validations
- ✅ Project Name required
- ✅ Required By Date required and must be in future
- ✅ At least one material required
- ✅ Cannot remove last material row

---

## 📋 Fabric Type Options

1. Cotton
2. Polyester
3. Cotton Blend
4. Silk
5. Wool
6. Linen
7. Denim
8. Viscose
9. Nylon
10. Other

---

## 📋 Fabric Finish Type Options

1. Plain
2. Mercerized
3. Sanforized (pre-shrunk)
4. Brushed
5. Calendered
6. Water Repellent
7. Wrinkle Free
8. Other

---

## 📋 Accessory Type Options

1. Button
2. Zipper
3. Thread
4. Label
5. Elastic
6. Hook & Eye
7. Velcro
8. Lining
9. Interlining
10. Tape
11. Other

---

## 📋 Unit Options

### Fabric Units
- Meters
- Yards
- Kilograms
- Rolls

### Accessory Units
- Pieces
- Units
- Meters
- Boxes
- Dozens
- Gross (144 pieces)

---

## 🧪 Testing Scenarios

### Test Case 1: Create Fabric MRN
```
1. Set default to "Fabric"
2. Add material
3. Fill:
   - Fabric Name: "Premium Cotton"
   - Fabric Type: "Cotton"
   - Color: "White"
   - GSM: "200"
   - Width: "60 inches"
   - Shrinkage: "2"
   - Finish Type: "Mercerized"
   - Quantity: 150
   - Unit: Meters
4. Submit
5. Verify MRN created successfully
```

### Test Case 2: Create Accessories MRN
```
1. Set default to "Accessories"
2. Add material
3. Fill:
   - Accessory Type: "Button"
   - Color: "Black"
   - Size/Length: "15mm"
   - Quantity Per Unit: "6"
   - Brand: "YKK"
   - Quantity: 600
   - Unit: Pieces
4. Submit
5. Verify MRN created successfully
```

### Test Case 3: Mixed Material Types
```
1. Set default to "Fabric"
2. Add first material (Fabric):
   - Fabric Name: "Cotton Fabric"
   - Type: Cotton, Color: Blue
   - Quantity: 100 meters
3. Add second material
4. Change type to "Accessories"
5. Fill accessories fields:
   - Type: Thread, Color: White
   - Quantity: 10 boxes
6. Submit
7. Verify both materials saved correctly
```

### Test Case 4: Validation Testing
```
1. Try to submit without Fabric Name → Error
2. Try to submit without Fabric Type → Error
3. Try to submit without Color (fabric) → Error
4. Try to submit without Accessory Type → Error
5. Try to submit with quantity 0 → Error
6. Try to submit with past date → Error
```

---

## 🔍 Auto-Generated Specifications

The system automatically generates a `specifications` string for better readability:

### Fabric:
```
"Cotton - Navy Blue - 180 GSM - 60 inches"
```

### Accessories:
```
"Button - 12mm - Black"
```

These specifications appear in:
- Material request details
- Inventory allocation screens
- Reports and exports

---

## 🎯 Benefits

1. **Better Data Quality**
   - Captures detailed fabric specifications (GSM, shrinkage, finish)
   - Tracks accessory brands and sizes
   - Improves inventory matching accuracy

2. **Improved UX**
   - Context-aware fields
   - Visual color coding
   - Clear type differentiation

3. **Enhanced Tracking**
   - Material-specific data for reports
   - Better procurement planning
   - Accurate costing and estimation

4. **Flexible Workflow**
   - Mix fabric and accessories in one request
   - Per-item type selection
   - Default type for batch entry

---

## 🔗 Integration Points

### Frontend
- `CreateMRMPage.jsx` - Enhanced form
- `MaterialRequestsList.jsx` - Displays material types
- `ProjectMaterialDashboard.jsx` - Shows detailed material info

### Backend
- `POST /api/project-material-requests/create` - Accepts new structure
- Materials stored in `materials_requested` JSON field
- Includes `material_type`, fabric fields, accessories fields

### Database
- `project_material_requests` table
- `materials_requested` JSON column contains all fields
- No schema changes required (JSON flexible structure)

---

## 📝 Example Use Cases

### Use Case 1: Shirt Manufacturing
```
Project: Men's Formal Shirts - Order #12345

Materials:
1. FABRIC
   - Name: Premium Cotton Fabric
   - Type: Cotton
   - Color: White
   - GSM: 200
   - Width: 60 inches
   - Quantity: 150 meters

2. ACCESSORIES - Button
   - Type: Button
   - Color: White Pearl
   - Size: 12mm
   - Qty per Unit: 8
   - Quantity: 800 pieces

3. ACCESSORIES - Thread
   - Type: Thread
   - Color: White
   - Brand: Coats
   - Quantity: 5 boxes
```

### Use Case 2: Denim Jeans Production
```
Project: Women's Skinny Jeans - Order #12346

Materials:
1. FABRIC
   - Name: Stretch Denim
   - Type: Denim
   - Color: Dark Blue
   - GSM: 340
   - Width: 58 inches
   - Shrinkage: 5%
   - Quantity: 200 meters

2. ACCESSORIES - Zipper
   - Type: Zipper
   - Color: Silver
   - Size: 7 inches
   - Brand: YKK
   - Quantity: 100 pieces

3. ACCESSORIES - Button
   - Type: Button
   - Color: Silver
   - Size: 15mm
   - Qty per Unit: 1
   - Quantity: 100 pieces
```

---

## 🚀 Future Enhancements

### Possible Additions
1. **Fabric Pattern/Weave**
   - Plain, Twill, Satin, Jacquard

2. **Accessory Size Standards**
   - Button: Line system (16L, 18L, 20L)
   - Zipper: Standard lengths dropdown

3. **Material Images**
   - Upload swatch photos
   - Visual material library

4. **Cost Estimation**
   - Per-unit cost fields
   - Total cost calculation

5. **Supplier Preferences**
   - Preferred vendor selection
   - Brand alternatives

6. **Inventory Autocomplete**
   - Suggest from existing inventory
   - Show available quantities

---

## 📊 Technical Details

### State Management
```javascript
// Form-level default
const [defaultMaterialType, setDefaultMaterialType] = useState('fabric');

// Materials array in formData
materials: [
  { material_type: 'fabric', fabric_name: '', ... },
  { material_type: 'accessories', accessory_type: '', ... }
]
```

### Dynamic Rendering
```jsx
{material.material_type === 'fabric' && (
  <FabricFields material={material} index={index} />
)}

{material.material_type === 'accessories' && (
  <AccessoriesFields material={material} index={index} />
)}
```

### Payload Transformation
- Combines common fields + type-specific fields
- Auto-generates `material_name` from appropriate field
- Builds `specifications` string
- Initializes tracking fields (available_qty, issued_qty, etc.)

---

## ✅ Checklist for Testing

- [ ] Form-level default selector works
- [ ] Per-row type selector works
- [ ] Fabric fields display correctly
- [ ] Accessories fields display correctly
- [ ] Required field validations work
- [ ] Can add multiple materials
- [ ] Can remove materials (except last)
- [ ] Can mix fabric and accessories
- [ ] Specifications auto-generate correctly
- [ ] Submit creates MRN successfully
- [ ] Data saves to backend correctly
- [ ] Navigation after submit works

---

## 📞 Support

For questions or issues with this feature:
1. Check validation error messages
2. Review this documentation
3. Check browser console for errors
4. Test with sample data provided above

---

**Implementation Status:** ✅ COMPLETE  
**Ready for Testing:** ✅ YES  
**Documentation:** ✅ COMPLETE

---

*Last Updated: January 2025*