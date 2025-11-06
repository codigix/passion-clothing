# 🎯 Sales Dashboard Columns Feature - Complete User Guide

## 📍 WHERE IS THE COLUMNS BUTTON?

The **Columns button** is located in the **Sales Dashboard**, on the **Orders tab**, in the **filter/action bar**.

### Visual Location:
```
Sales Dashboard
    ↓
Orders Tab  ← You are here
    ↓
Filter Bar (below search, status, procurement filters)
    ↓
Action Buttons Row:
    [Reports] [📊 Columns] [Export] ← COLUMNS BUTTON IS HERE
```

---

## 🖱️ HOW TO ACCESS THE COLUMNS FEATURE

### Step 1: Navigate to Sales Dashboard
1. Login to the system as a **Sales user** (e.g., sales manager)
2. Click **Sales** in the sidebar or navigate to `/sales/dashboard`
3. You'll see the Sales Dashboard with multiple tabs

### Step 2: Go to Orders Tab
- Click the **"Orders"** tab (first tab on the left)
- You'll see a list of sales orders in table format

### Step 3: Locate the Columns Button
In the filter/action bar below the search box, you'll see several buttons:
- 📊 **Reports** button
- **📊 Columns** button ← **CLICK THIS**
- 📊 **Export** button

The button shows **"Columns"** icon with a small indicator dot if customized.

### Step 4: Click the Columns Button
```
┌─────────────────────────────────────────────────────────────────┐
│  Search Orders    │  Order Status  │  Procurement  │  Production │
├─────────────────────────────────────────────────────────────────┤
│ [Reports] [📊 Columns*] [Export]                                │
│           ↑                                                     │
│           Click here to open the menu                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 WHAT THE COLUMNS MENU SHOWS

When you click the **Columns** button, a dropdown menu appears with:

### Quick Action Buttons (Top)
- **Show All** - Display all available columns
- **Reset** - Reset to default columns

### Column Checkboxes
A list of all 16 available columns with checkboxes:

```
✓ Project Name          (fixed - always visible)
✓ Customer              (default visible)
✓ Products              (default visible)
✓ Qty                   (default visible)
✓ Amount                (default visible)
☐ Advance Paid          (optional)
☐ Balance               (optional)
✓ 📋 Procurement        (default visible)
✓ 🏭 Production         (default visible)
✓ Status                (default visible)
✓ Progress              (default visible)
✓ Delivery              (default visible)
☐ Created By            (optional)
☐ Order Date            (optional)
☐ Rate/Piece            (optional)
✓ Actions               (fixed - always visible)
```

**Legend:**
- ✓ = Currently visible in table
- ☐ = Currently hidden
- (fixed) = Cannot be hidden
- (default visible) = Shows by default
- (optional) = Hidden by default

---

## ✅ HOW TO CUSTOMIZE COLUMNS

### To Hide a Column
1. Click the **Columns** button
2. Find the column you want to hide
3. **Uncheck** the checkbox next to it
4. The column disappears from the table immediately
5. Menu closes automatically

### To Show a Column
1. Click the **Columns** button
2. Find the column you want to show
3. **Check** the checkbox next to it
4. The column appears in the table immediately

### To Show All Columns
1. Click the **Columns** button
2. Click the **"Show All"** button at the top
3. All columns are displayed

### To Reset to Defaults
1. Click the **Columns** button
2. Click the **"Reset"** button at the top
3. Returns to default column set (9 columns visible)

---

## 💾 SETTINGS ARE AUTO-SAVED

✅ **Your column preferences are automatically saved** to your browser's local storage

This means:
- Your selected columns persist when you:
  - Refresh the page (F5)
  - Close and reopen the browser
  - Log out and log back in (on same device)
  - Navigate away and return to Sales Dashboard

---

## 🎨 VISUAL INDICATOR

### Customization Indicator Dot
When you've customized columns (changed from defaults), a **small blue dot** appears on the Columns button:

```
Default state:        Customized state:
[📊 Columns]          [📊 Columns] •
                                  ↑
                         Blue indicator dot
```

This dot reminds you that your view is customized.

---

## 📊 DEFAULT COLUMN SET (What Shows by Default)

These 9 columns are visible when you first open the Orders tab:

1. **Project Name** - Sales order project identifier (fixed)
2. **Customer** - Customer name & phone
3. **Products** - Product names from order items
4. **Qty** - Total quantity ordered
5. **Amount** - Final order amount (₹)
6. **📋 Procurement** - PO status (Under PO / No PO)
7. **🏭 Production** - Production stage (Pending / Active / Ready)
8. **Status** - Order status (Draft, Confirmed, In Production, etc.)
9. **Progress** - Progress bar showing completion %
10. **Delivery** - Expected delivery date
11. **Actions** - View & Edit buttons (fixed)

**2 Hidden by Default (Optional):**
- Advance Paid
- Balance
- Created By
- Order Date
- Rate/Piece

---

## 🔧 FIXED COLUMNS (Cannot Be Hidden)

These 2 columns are **always visible** and cannot be toggled:

1. **Project Name** (leftmost) - Always shows for reference
2. **Actions** (rightmost) - Always shows for quick actions

These are "pinned" columns for essential information and functionality.

---

## 🎯 USE CASES

### Example 1: Focus on Procurement
If you only care about procurement details:
1. Click **Columns**
2. Uncheck: Products, Qty, Advance Paid, Balance, Created By, Order Date, Rate/Piece
3. Keep visible: Project Name, Customer, 📋 Procurement, 🏭 Production, Status, Progress, Delivery, Actions
4. Now your table is focused on procurement

### Example 2: Financial Analysis
If you need financial information:
1. Click **Columns**
2. Check "Advance Paid" and "Balance"
3. These new columns appear with payment information
4. Now you can see complete payment status

### Example 3: Hide Status Columns
If your team knows status automatically:
1. Click **Columns**
2. Uncheck "Status" and "Progress"
3. Table becomes more compact
4. Click "Reset" anytime to restore

---

## ⌨️ KEYBOARD SHORTCUTS

| Action | How To |
|--------|--------|
| Open Columns menu | Click Columns button or (Alt+C) |
| Close menu | Press **Escape** key or click outside menu |
| Toggle column | Click checkbox or Space bar when focused |
| Show All | Click "Show All" button |
| Reset Defaults | Click "Reset" button |

---

## 🐛 TROUBLESHOOTING

### "I don't see the Columns button"
- Make sure you're on the **Sales Dashboard → Orders tab**
- Look in the filter/action bar (below search box)
- Look for 📊 icon with "Columns" text
- It's between the "Reports" and "Export" buttons

### "Columns button is there but menu doesn't open"
- Try clicking it again (single click)
- Check browser console for errors (F12)
- Try refreshing the page
- Clear browser cache if still not working

### "My column settings disappeared"
- Check if you're on the same device/browser
- Settings are stored per-browser (not synced across devices)
- Try clicking "Reset" to restore defaults
- Check if browser has disabled local storage

### "Column menu keeps closing too fast"
- This was fixed in the latest update
- Try refreshing the page (F5)
- Update your browser to latest version

---

## 📱 MOBILE SUPPORT

### Mobile Devices (phones)
The Columns menu is responsive and shrinks on mobile:
- Menu width: **224px** on phones
- Menu width: **256px** on desktop
- Scrollable if many columns
- All functionality works the same

### Tablets
- Full desktop experience on landscape
- Responsive menu on portrait

---

## 🔒 DATA NOT AFFECTED

Customizing columns:
- ✅ Doesn't affect data
- ✅ Doesn't delete anything
- ✅ Doesn't change order of data
- ✅ Only affects what YOU see
- ✅ Other users see their own preferences
- ✅ Can reset anytime with "Reset" button

---

## 📞 SUPPORT

If you need help:
1. Check this guide first
2. Ask your Sales Manager
3. Contact IT Support with:
   - What you tried
   - What happened
   - Which browser you're using
   - Screenshot if possible

---

## 🎓 ADVANCED TIPS

### Tip 1: Create Different Views
- Save multiple views by changing columns and noting the setup
- Take screenshot of your preferred setup
- Recreate it anytime with the guide

### Tip 2: Mobile-First Columns
- On phones, show only essential columns
- On desktop, show detailed columns
- They're saved separately per device

### Tip 3: Share Setup with Team
- Document your preferred column setup
- Share screenshot with team
- They can recreate the same setup

### Tip 4: Export with Custom Columns
- Select your columns first
- Then click **Export**
- Export respects your column visibility
- Only visible columns are exported to CSV

---

## ✨ FEATURES

✅ **16 Total Columns Available**
✅ **Auto-Save Preferences**
✅ **Responsive Design**
✅ **Keyboard Support (Escape)**
✅ **Click-Outside Auto-Close**
✅ **Customization Indicator**
✅ **Show All / Reset Buttons**
✅ **Mobile Friendly (224px/256px)**
✅ **Visual Feedback**
✅ **No Data Loss**

---

## 📝 COLUMN DESCRIPTIONS

| Column | Purpose | Example |
|--------|---------|---------|
| Project Name | Unique order identifier | SO-20251106-0001 |
| Customer | Customer name & contact | ABC Textiles (+91-9876...) |
| Products | What's being ordered | Cotton T-Shirt, Polyester Pants |
| Qty | Total units ordered | 500 units |
| Amount | Total order value | ₹2,10,000 |
| Advance Paid | Upfront payment received | ₹1,00,000 |
| Balance | Remaining payment | ₹1,10,000 |
| 📋 Procurement | Purchase order status | 🔗 Under PO / ❌ No PO |
| 🏭 Production | Production stage | ⏱️ Pending / 🏭 Active / 📦 Ready |
| Status | Order status | Draft / Confirmed / In Production / Delivered |
| Progress | Completion percentage | 65% progress bar |
| Delivery | Expected delivery | 05-Dec-25 |
| Created By | Who created order | John Doe |
| Order Date | When order was created | 01-Nov-25 |
| Rate/Piece | Price per unit | ₹420 |
| Actions | Quick action buttons | View 👁️ Edit ✏️ |

---

**Last Updated:** January 2025
**Feature Status:** ✅ Production Ready
**Browser Support:** Chrome, Firefox, Safari, Edge
