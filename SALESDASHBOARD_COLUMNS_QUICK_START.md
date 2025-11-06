# Sales Dashboard Column Visibility - Quick Start Guide

## ⚡ 30-Second Overview

The Sales Dashboard now lets you show/hide table columns with one click:

1. Click **"Columns"** button (next to Reports)
2. Check/uncheck columns in the dropdown
3. Settings automatically saved to your browser

**Done!** Your preferences persist across sessions.

---

## 🎯 What's New?

### Before
- Fixed 11-column table
- No way to customize view
- All columns always visible

### After
- **16 available columns** (choose which to show)
- **Show/Hide toggle** for each column
- **Automatic saving** of preferences
- **Quick actions**: Show All, Reset

---

## 🖱️ Step-by-Step Tutorial

### **Step 1: Go to Sales Dashboard**
```
URL: http://localhost:3000/sales
Look for: Orders tab (first tab)
```

### **Step 2: Find the Columns Button**
```
Toolbar layout:
[Reports] [Columns▼] [Export]
                ↑ Click here
```

### **Step 3: Click to Open Menu**
```
Dropdown appears showing:
- [Show All] [Reset]  (top buttons)
- List of 16 columns with checkboxes
```

### **Step 4: Customize Your View**
```
Toggle columns on/off:
☑ Project Name (fixed - can't hide)
☑ Customer
☑ Products
□ Order Date         ← click to show
☑ Amount
□ Advanced Paid      ← click to show
☑ Status
☑ Delivery
☑ Actions (fixed - can't hide)
... more columns
```

### **Step 5: Quick Actions**
```
[Show All] - Display all 16 columns
[Reset]    - Back to 9 default columns
```

---

## 📊 16 Available Columns

### **Always Visible (Fixed)**
1. **Project Name** - Order ID with project
2. **Actions** - View & Edit buttons

### **Default Visible (9 columns)**
3. **Customer** - Customer name & phone
4. **Products** - Product list
5. **Qty** - Total quantity
6. **Amount** - Total ₹
7. **📋 Procurement** - PO status
8. **🏭 Production** - Production stage
9. **Status** - Order status (Draft, Shipped, etc.)
10. **Progress** - Progress bar %
11. **Delivery** - Expected date

### **Optional (5 columns)**
12. **Order Date** - When created
13. **Advance Paid** - Prepayment ₹
14. **Balance** - Outstanding ₹
15. **Rate/Piece** - Unit price ₹
16. **Created By** - User who created

---

## 🎨 Visual Guide

### **Column Menu Dropdown**
```
┌─────────────────────────────────┐
│ [Show All]     [Reset]          │
├─────────────────────────────────┤
│ ☑ Project Name         (fixed)  │
│ ☑ Customer                      │
│ ☑ Products                      │
│ ☑ Qty                           │
│ ☑ Amount                        │
│ ☑ 📋 Procurement                │
│ ☑ 🏭 Production                 │
│ ☑ Status                        │
│ ☑ Progress                      │
│ ☑ Delivery                      │
│ ☐ Order Date                    │
│ ☐ Advance Paid                  │
│ ☐ Balance Amount                │
│ ☐ Rate/Piece                    │
│ ☐ Created By                    │
│ ☑ Actions              (fixed)  │
└─────────────────────────────────┘
```

### **Table View (Default Layout)**
```
Project Name │Customer │Products │Qty │Amount│📋│🏭│Status│Progress│Delivery│Actions
SO-2024-001  │Acme Inc │ Shirt  │100 │₹50K │🔗│⏱ │Draft │███░░░░ │15 Jan  │👁 ✎
SO-2024-002  │Beta Ltd │ Pants  │250 │₹75K │❌│🏭│Produc│██████░░│20 Jan  │👁 ✎
```

---

## 💡 Common Use Cases

### **Finance Team**
```
Want to see: Project, Customer, Amount, Advance, Balance
Steps:
1. Click Columns
2. Hide: Products, Qty, Procurement, Production, Progress, Order Date
3. Show: Advance Paid, Balance Amount
4. Result: Clean financial view focusing on payments
```

### **Procurement Team**
```
Want to see: Project, Products, Qty, Procurement Status, Order Date
Steps:
1. Click Columns
2. Hide: Advance Paid, Balance, Progress, Production Status
3. Show: Order Date
4. Result: Focus on material orders and PO status
```

### **Production Team**
```
Want to see: Project, Products, Qty, Production Status, Progress
Steps:
1. Click Columns
2. Hide: Advance Paid, Balance, Order Date, Procurement Status
3. Keep: Production Status, Progress, Delivery
4. Result: Production workflow view
```

### **Logistics Team**
```
Want to see: Project, Status, Delivery, Progress
Steps:
1. Click Columns
2. Keep only: Project, Customer, Status, Delivery, Progress, Actions
3. Hide everything else
4. Result: Focused delivery timeline view
```

---

## 🔄 Quick Actions

### **Show All 16 Columns**
1. Click **Columns** button
2. Click **[Show All]** button
3. All columns now visible
4. Scroll horizontally to see all

### **Reset to Defaults (9 Columns)**
1. Click **Columns** button
2. Click **[Reset]** button
3. Back to default layout
4. Both buttons show again

### **Manually Hide Individual Columns**
1. Click **Columns** button
2. Uncheck unwanted columns
3. Checked columns stay visible
4. Settings auto-save

---

## 💾 How Settings Are Saved

```
Your browser: localStorage
Key: "salesDashboardVisibleColumns"
Where: Saved automatically after each change
Persist: Across page refreshes & browser sessions
Scope: Per device/browser (not synced to other devices)
```

### **Example Saved Data**
```javascript
// Browser stores this JSON array:
[
  "project_name",
  "customer", 
  "products",
  "quantity",
  "amount",
  "procurement_status",
  "production_status",
  "status",
  "progress",
  "delivery_date",
  "actions"
]
```

---

## 📋 Data Reference

### **Status Values & Icons**

| Status | Icon | Meaning |
|--------|------|---------|
| Draft | 📝 | Not confirmed |
| Confirmed | ✓ | Ready |
| In Production | 🏭 | Manufacturing |
| Ready to Ship | 📦 | Awaiting dispatch |
| Shipped | 🚚 | In transit |
| Delivered | ✅ | Received |
| Completed | ✓ | Done |

### **Procurement Status**
- 🔗 **Under PO** - PO created (green)
- ❌ **No PO** - Awaiting PO (red)

### **Production Status**
- ⏱️ **Pending** - Not started (blue)
- 🏭 **Active** - In progress (blue)
- 📦 **Ready** - Complete (blue)

---

## ⌨️ Keyboard Tips

| Action | Keys |
|--------|------|
| Toggle menu | Click "Columns" button |
| Select checkbox | Click checkbox or label |
| Close menu | Click outside or Esc key |
| Scroll menu | Mouse wheel or scroll bar |

---

## 📱 Mobile Tips

**Columns button on mobile:**
- Still visible in toolbar
- Menu stays compact
- Columns work the same
- Horizontal scroll table may be needed

**Better for mobile:**
- Keep fewer columns visible
- Hide optional columns
- Focus on Project, Customer, Status, Delivery
- Reduces horizontal scrolling

---

## ❓ FAQ

### **Q: Will my settings be saved if I close the browser?**
**A:** Yes! Settings are saved in browser localStorage and survive browser restarts.

### **Q: Can I see my settings on another computer?**
**A:** No. Settings are per-device. You'd need to set up each device separately.

### **Q: How do I reset to factory defaults?**
**A:** Click **Columns** → **[Reset]** button. Returns to 9 default columns.

### **Q: Can I see all columns at once?**
**A:** Yes! Click **Columns** → **[Show All]**. You may need to scroll right to see all.

### **Q: Which columns can't be hidden?**
**A:** Project Name and Actions are fixed (marked as "(fixed)" in menu).

### **Q: What if I accidentally hide a column?**
**A:** Click **Columns** → check the box next to it to show it again.

### **Q: How do I export data with my custom columns?**
**A:** The Export button respects your visible columns and exports only those.

### **Q: Do other users see my column layout?**
**A:** No. Each user has their own settings saved in their browser.

### **Q: What happens if I clear my browser cache?**
**A:** Column settings will reset to defaults (9 columns).

### **Q: Can I prevent auto-saving?**
**A:** No. Settings save automatically. If you want to change them back, manually toggle columns.

---

## 🚀 Pro Tips

1. **Different Layouts for Different Days**
   - Use Show All when you need full overview
   - Use Reset for quick daily checks
   - Customize for specific projects

2. **Finance Review**
   - Show Amount, Advance Paid, Balance
   - Hide Production/Procurement details
   - Focus on financial data

3. **Weekly Meeting Prep**
   - Show Status, Progress, Delivery
   - Hide Optional columns
   - Clean presentation view

4. **New User Onboarding**
   - Start with Reset (9 columns)
   - Add columns as needed
   - Preferences save for next time

5. **Mobile Efficiency**
   - Keep 5-6 core columns visible
   - Hide optional columns
   - Reduce horizontal scrolling

---

## 🐛 Troubleshooting

### **Column menu won't open?**
- ✓ Reload the page
- ✓ Check Columns button is visible
- ✓ Clear browser cache

### **Settings not saving?**
- ✓ Check localStorage enabled (DevTools → Application)
- ✓ Verify key: `salesDashboardVisibleColumns` exists
- ✓ Try different browser

### **Columns show empty data?**
- ✓ Refresh table (reload page)
- ✓ Check order data loaded correctly
- ✓ Verify API returning all fields

### **Columns menu closed unexpectedly?**
- ✓ Click Columns again to reopen
- ✓ Try clicking outside dropdown first
- ✓ Refresh page and try again

---

## 📞 Need Help?

1. **This guide** - Read relevant section
2. **Check troubleshooting** - Common issues
3. **Browser console** - Check for errors (F12)
4. **Contact support** - Share screenshot of issue

---

## 📚 Related Documentation

- **Full Guide**: `SALESDASHBOARD_COLUMN_VISIBILITY_GUIDE.md`
- **Visual Reference**: `SALES_TABLE_COLUMNS_VISUAL_GUIDE.md`
- **SalesOrdersPage Columns**: `SALES_ORDERS_COLUMN_QUICK_START.md`

---

**Quick Access:**
- 📍 **Location**: Sales Dashboard → Orders tab
- 🎯 **Goal**: Customize visible columns per role
- ⏱️ **Setup Time**: < 1 minute
- 💾 **Auto-saves**: Yes, to browser

**Status**: ✅ Live & Ready to Use  
**Updated**: January 2025