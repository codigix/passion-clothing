# MRN Fabric & Accessories - Quick Reference Card

## 🎯 What Changed?

The Create MRN form now has **two material types** with different fields:

### 🟣 FABRIC
```
Required:
✅ Fabric Name
✅ Fabric Type (Cotton, Polyester, etc.)
✅ Color
✅ Quantity
✅ Unit

Optional:
⭕ GSM (Grams per m²)
⭕ Width (inches/cm)
⭕ Shrinkage %
⭕ Finish Type
⭕ Notes
```

### 🟣 ACCESSORIES
```
Required:
✅ Accessory Type (Button, Zipper, Thread, etc.)
✅ Quantity
✅ Unit

Optional:
⭕ Color
⭕ Size/Length
⭕ Quantity Per Unit
⭕ Brand
⭕ Notes
```

---

## 🎨 How It Works

### Step 1: Choose Default Type
At the top of form:
- Click **Fabric** (purple) OR **Accessories** (pink)
- This sets default for new materials

### Step 2: Add Materials
- Each material can be different type
- Toggle between Fabric/Accessories per row
- Fill appropriate fields

### Step 3: Submit
- Form validates based on material type
- Creates MRN with unique number

---

## 💡 Quick Tips

1. **Default Type**: Set it to what you'll add most (saves time)
2. **Mixed Materials**: You can have fabric + accessories in same request
3. **Visual Cues**: Purple = Fabric, Pink = Accessories
4. **Auto-Specs**: System auto-generates specification string
5. **Required Fields**: Look for red asterisk (*)

---

## 📝 Example: Shirt Order

```
Default: Fabric

Material #1 - FABRIC
  ├─ Name: Premium Cotton
  ├─ Type: Cotton
  ├─ Color: White
  ├─ GSM: 200
  ├─ Width: 60 inches
  └─ Qty: 150 meters

Material #2 - ACCESSORIES (override default)
  ├─ Type: Button
  ├─ Color: White
  ├─ Size: 12mm
  ├─ Per Unit: 8
  └─ Qty: 800 pieces

Material #3 - ACCESSORIES
  ├─ Type: Thread
  ├─ Color: White
  ├─ Brand: Coats
  └─ Qty: 5 boxes
```

---

## ⚡ Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit form
- **Esc**: Cancel/Go back

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| "Fabric name required" | Fill the Fabric Name field |
| "Fabric type required" | Select from dropdown |
| "Color required for fabric" | Enter color (required for fabric only) |
| "Accessory type required" | Select from dropdown |
| "Valid quantity required" | Enter number > 0 |
| "Required by date must be in future" | Select future date |

---

## 🔗 Where to Find

**Navigation:**
```
Manufacturing Dashboard → Create MRN
OR
Manufacturing → Material Requests → Create Request
```

**URL:**
```
/manufacturing/material-requests/create
```

---

## 📱 Mobile/Tablet Notes

- Form is fully responsive
- Fields stack on smaller screens
- Toggle buttons remain side-by-side
- Test on your device for best experience

---

## 🎯 Pro Tips

1. **Batch Entry**: Set default to your most common type
2. **Copy Values**: Use browser autocomplete for repeated entries
3. **Specifications**: Auto-generated - no manual entry needed
4. **Validation**: Form prevents invalid submissions
5. **Multiple Materials**: No limit - add as many as needed

---

## ✅ Quick Validation Checklist

Before submitting:
- [ ] Project name filled
- [ ] Required by date selected (future date)
- [ ] Each material has required fields filled
- [ ] Quantities are > 0
- [ ] Units selected for all materials

---

## 📞 Need Help?

**Can't find a field?**
→ Check you selected correct material type (Fabric vs Accessories)

**Field not accepting input?**
→ Check field type (text vs number vs dropdown)

**Submit not working?**
→ Look for validation error messages in red

**Want to change material type after filling?**
→ Just click the other type button - fields switch automatically

---

**Last Updated:** January 2025  
**Feature Status:** ✅ Active
