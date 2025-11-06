# Sales Orders Table - Quick Start Guide

## 🚀 Quick Start in 30 Seconds

### Step 1: Navigate to Sales Orders
Go to: **http://localhost:3000/sales**

### Step 2: Click the Column Icon
Look for the **⊟ column icon** in the top toolbar (between Filter and other view options)

### Step 3: Customize Columns
- ✅ **Check** boxes to show columns
- ❌ **Uncheck** boxes to hide columns
- 📌 **Fixed columns** (SO Number, Actions) cannot be hidden

### Step 4: Done!
Your preferences are **auto-saved** - they'll persist when you refresh the page

---

## 📊 Table Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  SO Number │ Customer │ Status │ Delivery Date │ Amount │ Actions  │
├─────────────────────────────────────────────────────────────────────┤
│ SO-001     │ Acme Inc │ Draft  │ 15 Jan 2025   │ ₹50000 │ View ... │
│ SO-002     │ Beta Co  │ Shipped│ 10 Jan 2025   │ ₹75000 │ View ... │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Available Columns

### **Always Visible** (Cannot Hide)
- **SO Number** - Order reference + Project name
- **Actions** - View, QR, Edit, Delete

### **Default Layout** (7 columns)
- SO Number ✅
- Order Date ✅
- Customer ✅
- Status ✅
- Shipment Status ✅
- Delivery Date ✅
- Total Amount ✅
- Actions ✅

### **Optional Columns** (Can Show/Hide)
1. **Product Info** - Product types/descriptions
2. **Quantity** - Total items
3. **Rate per Piece** - Unit price
4. **Advance Paid** - Prepayment
5. **Balance Amount** - Remaining payment
6. **Procurement Status** - PO status
7. **Invoice Status** - Invoice status
8. **Created By** - Order creator
9. **Challan Status** - Challan tracking

---

## 💡 Usage Examples

### 👤 For Finance Team
**Show**: Total Amount, Advance Paid, Balance Amount  
**Hide**: Product Info, Quantity

**Steps**:
1. Click column icon ⊟
2. Uncheck: Product Info, Quantity
3. Check: Advance Paid, Balance Amount
4. Close menu → Done!

### 🛒 For Sales Team
**Show**: Customer, Order Date, Status, Delivery Date  
**Hide**: Everything else (use "Reset" first)

**Steps**:
1. Click column icon ⊟
2. Click "Reset" button
3. Check: Customer, Order Date
4. Done!

### 📦 For Operations Team
**Show**: All columns  
**Hide**: None

**Steps**:
1. Click column icon ⊟
2. Click "Show All" button
3. Done! All 16 columns visible

---

## ⌨️ Keyboard Tips

| Action | Result |
|--------|--------|
| Click column icon ⊟ | Open/close menu |
| Check/uncheck box | Toggle column |
| Click "Show All" | Display all columns |
| Click "Reset" | Restore defaults |
| ESC key | Close menu |

---

## 🎯 Column Icons & Colors

| Status | Color | Meaning |
|--------|-------|---------|
| 🔵 Draft | Slate | Order created, not confirmed |
| 🟦 Confirmed | Blue | Customer confirmed |
| 🟧 In Production | Orange | Manufacturing in progress |
| 🟪 Ready to Ship | Purple | Awaiting shipment |
| 🟨 Shipped | Indigo | In transit |
| 🟩 Delivered | Green | Received by customer |
| ✅ Completed | Emerald | Fully completed |
| ❌ Cancelled | Red | Order cancelled |

---

## 📱 On Mobile Devices

The column menu works the same way:
1. Tap ⊟ column icon
2. Scroll through available columns
3. Tap checkboxes to toggle
4. Tap outside to close menu

---

## 💾 Saving Your Preferences

Your column visibility is **automatically saved** to browser storage:
- ✅ Persists on page refresh
- ✅ Persists across sessions
- ✅ Per-device setting
- ❌ Does NOT sync across devices

To **reset to factory defaults**:
1. Click column icon ⊟
2. Click "Reset" button

---

## ❓ FAQ

### **Q: Why can't I hide SO Number or Actions?**
A: These are essential columns for identifying and managing orders. They're "pinned" for usability.

### **Q: My columns disappeared after clearing cache**
A: Browser cache clearing also clears column preferences. Just re-select your columns using the column menu.

### **Q: Can I set different views for different teams?**
A: Currently, each user's browser saves their own preferences. Each person can customize their view.

### **Q: How many columns can I show at once?**
A: Up to 16 columns total (though very wide on desktop - table becomes scrollable on smaller screens).

### **Q: Does this affect other pages?**
A: No, column settings are unique to the Sales Orders page (`/sales`). Other pages have their own layouts.

---

## ✨ Pro Tips

### **Tip 1: Responsive Scrolling**
If you show many columns, the table becomes horizontally scrollable on desktop:
- Scroll left/right to see all columns
- SO Number stays visible as reference

### **Tip 2: Status Filtering**
Combine column visibility with the Status filter:
- Show relevant columns for each status
- Filter orders by status
- Quick analysis by department

### **Tip 3: Financial View**
Quick financial analysis setup:
1. Show: Total Amount, Advance Paid, Balance Amount
2. Filter by Status: "Draft" or "Pending"
3. See all payment-pending orders

### **Tip 4: Production Planning**
Optimize for manufacturing:
1. Show: SO Number, Customer, Quantity, Delivery Date, Status
2. Hide: Financial columns, Challan status
3. Focus on production timeline

---

## 🆘 Troubleshooting

### **Column menu not opening?**
- ✅ Refresh the page
- ✅ Try clicking the icon again
- ✅ Close other menus first

### **Changes not persisting?**
- ✅ Check browser allows localStorage (not in private mode)
- ✅ Try a different browser
- ✅ Check browser storage settings

### **Table looks broken?**
- ✅ Refresh the page (Ctrl+Shift+R hard refresh)
- ✅ Click "Reset" button to restore defaults
- ✅ Try showing fewer columns

### **Data missing in columns?**
- ✅ Some orders might not have all data
- ✅ N/A shows when data is unavailable
- ✅ This is normal for new orders

---

## 📞 Support

**Having issues?** 
- Check console (F12) for errors
- Verify data is loading in table
- Try resetting columns to defaults
- Contact admin if problems persist

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: ✅ Live & Ready