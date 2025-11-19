# User Guide: Create Purchase Order from Sales Order

## For Procurement Staff

### Quick Start - 5 Steps

#### 1️⃣ Go to Procurement Dashboard
- **URL**: `http://localhost:3000/procurement`
- **Icon**: Shopping bag 🛍️

#### 2️⃣ Click "Create PO" Button
- **Location**: Top-right header
- **Button**: Dark button with Plus icon
- **Label**: "Create PO"

#### 3️⃣ Find Your Sales Order
- **Search Box**: Type order number, project, or customer name
- **Filter**: Select Draft or Confirmed status
- **Browse**: Scroll through the list

#### 4️⃣ Select the Order
- **Click** on the order card
- **Card highlights** in blue when selected
- **Check** the customer, quantity, and existing PO count

#### 5️⃣ Click "Create PO"
- **Button**: Bottom-right of modal
- **Result**: Navigates to PO creation form
- **Form**: Auto-filled with order details

---

## Modal Interface Guide

### 🔍 Search Box
```
What it searches:
✓ Order number (SO-2024-001)
✓ Project name (Summer Collection)
✓ Customer name (ABC Fashions)

How to use:
1. Click search box
2. Type search term
3. Results filter in real-time
```

### 📋 Status Filter
```
Options:
- All Status (shows all)
- Draft (orders not yet confirmed)
- Confirmed (approved for procurement)

How to use:
1. Click dropdown
2. Select status
3. List updates immediately
```

### 🧹 Clear Button
```
Does: Resets search and filter
When to use: Want to see full list again
```

### 🎯 Order Card
```
Shows:
- Order number
- Status (badge color)
- Project name
- Customer name
- Quantity
- PO count (existing POs)
- Info message (if POs exist)

Click: To select this order
```

### 📊 PO Count Badge
```
What it shows:
- Number in purple badge (top-right of card)
- "PO Count: 2"

What it means:
- 2 POs already created
- You can create more
- Multiple POs from same SO allowed
```

### 📌 Information Message
```
Shows when: POs already exist for this order

Message: "ℹ️ 2 PO(s) already created. 
         You can create additional POs for this order."

Purpose: Informs you can create multiple POs
```

---

## Selecting an Order

### ✅ Correct Selection

```
Before Clicking:
┌─────────────────────────────────┐
│ SO-2024-001  [Status]          │
│ Project: Summer Collection      │
│ (Gray border, normal state)     │
└─────────────────────────────────┘

After Clicking:
┌─────────────────────────────────┐
│ SO-2024-001  [Status]          │
│ Project: Summer Collection      │
│ (BLUE border, blue background)  │
└─────────────────────────────────┘
✓ Selected - Ready to create PO
```

### ❌ Invalid Selection

```
"Create PO" Button is Grayed Out
↓
This means: No order selected
↓
Action: Click an order card first
↓
"Create PO" Button becomes active
```

---

## Workflow Examples

### Example 1: Simple PO Creation

```
Step 1: Click "Create PO"
        ↓
Step 2: Modal opens showing all available orders
        ↓
Step 3: Search "SO-2024-001" 
        ↓
Step 4: Click on the order card
        ↓
Step 5: Card highlights in blue
        ↓
Step 6: Click "Create PO" button
        ↓
Result: Form opens with order details filled in
        You can select vendor and save
```

### Example 2: Creating Multiple POs

```
First PO:
Step 1: Create PO for SO-2024-001 from Vendor A
        ↓
Step 2: Save PO successfully
        ↓

Second PO (Same Order):
Step 3: Click "Create PO" again
        ↓
Step 4: Modal shows SO-2024-001 with "PO Count: 1"
        ↓
Step 5: Select same order again
        ↓
Step 6: Click "Create PO"
        ↓
Step 7: Form opens again (for same order)
        ↓
Step 8: Select DIFFERENT vendor (or same)
        ↓
Step 9: Create second PO
        ↓
Result: Two POs created from same SO
        Badge now shows "PO Count: 2"
```

### Example 3: Finding a Specific Order

```
Step 1: Click "Create PO"
        ↓
Step 2: Type "ABC" in search box
        ↓
Step 3: Results filter showing only ABC-related orders
        (Order number, project, or customer containing "ABC")
        ↓
Step 4: Find your order and click it
        ↓
Step 5: Click "Create PO"
        ↓
Result: Navigate to form with selected order
```

---

## Modal Buttons Guide

### Cancel Button (Left)
```
❌ Closes the modal
   Returns to dashboard
   No changes saved
   
When to click: If you change your mind
```

### Create PO Button (Right)
```
✓ Enabled: When you select an order
  Disabled: When no order selected (grayed out)
  
Click: Navigates to PO creation form
       Order details auto-filled
       
When to click: After selecting your order
```

---

## After Creating PO

### What Happens Next

```
1. Modal closes automatically
   ↓
2. You're on the Create PO form page
   ↓
3. Order data is already filled in:
   ✓ Project name
   ✓ Customer details
   ✓ Items and quantities
   ✓ Delivery date
   ✓ Special instructions
   ↓
4. You need to:
   ✓ Select a vendor
   ✓ Review/adjust quantities
   ✓ Set payment terms
   ✓ Configure delivery address
   ↓
5. Click "Save as Draft" or "Submit"
```

---

## Tips & Tricks

### 💡 Search Tips
- Use partial matches: type "SO-2024" to find all 2024 orders
- Use customer name: type "ABC" to find all ABC customer orders
- Case insensitive: "abc" = "ABC" = "Abc"

### 🎯 Filtering Tips
- Filter by "Confirmed" to see approved orders only
- Filter by "Draft" for orders pending confirmation
- Use "All Status" when unsure

### 🔄 Multiple PO Tips
- Check PO count badge before creating
- You can create unlimited POs per order
- Each PO can use different vendor
- Each PO can have different quantities

### ⏱️ Performance Tips
- Search is instant (client-side)
- Modal loads max 100 orders
- If > 100 orders, use search to narrow down
- Filter by status helps narrow list

---

## Troubleshooting

### ❌ Problem: Modal doesn't open
```
Cause: Possible connectivity issue
Fix:
1. Refresh the page (F5)
2. Check internet connection
3. Try again
```

### ❌ Problem: No orders showing in list
```
Cause: No sales orders ready for procurement
Fix:
1. Check if sales orders exist
2. Verify sales order status (must be draft/confirmed)
3. Verify marked "ready_for_procurement"
4. Contact admin if still not showing
```

### ❌ Problem: "Create PO" button grayed out
```
Cause: No order selected
Fix:
1. Click on an order card
2. Wait for blue highlight
3. Then click "Create PO"
```

### ❌ Problem: Wrong order selected
```
Cause: Selected wrong order
Fix:
1. Click different order card
2. Previous selection is deselected
3. New order is highlighted
```

### ❌ Problem: Want to go back to dashboard
```
Solution:
Option 1: Click "Cancel" button
Option 2: Click "×" close button in header
Result: Modal closes, return to dashboard
```

---

## FAQ

### Q: Can I create multiple POs from the same sales order?
**A:** Yes! You can create unlimited POs from one sales order. Useful for:
- Multiple vendors
- Partial shipments
- Different payment terms

### Q: What if I need to edit a PO after creation?
**A:** 
1. Go to PO details page
2. Click "Edit" (if in draft status)
3. Make changes
4. Save

### Q: Can I create POs for any sales order?
**A:** No. The order must be:
- Marked as "ready_for_procurement"
- Status: Draft OR Confirmed
- Check with sales team if not showing

### Q: What happens after I click "Create PO"?
**A:**
1. Modal closes
2. You go to PO creation form
3. Order details auto-populated
4. Select vendor and complete form
5. Save or submit PO

### Q: Can I cancel PO creation?
**A:** Yes:
- Click "Cancel" to close modal (return to dashboard)
- Click "×" to close modal (return to dashboard)
- No PO created in either case

### Q: Is my PO saved after form completion?
**A:** You must click "Save" or "Submit" button:
- **Save**: Saves as Draft (can edit later)
- **Submit**: Sends for approval (cannot edit)

### Q: Can I go back and create another PO?
**A:** Yes:
1. Return to Procurement Dashboard
2. Click "Create PO" again
3. Select same or different order
4. Create new PO

---

## Best Practices

### ✅ DO

1. **Do search for orders** - Makes finding easier
2. **Do check PO count** - Know how many POs exist
3. **Do verify customer** - Ensure correct order
4. **Do select vendor immediately** - After opening form
5. **Do save frequently** - Prevents losing data
6. **Do review form data** - Before submission

### ❌ DON'T

1. **Don't click "Create PO"** before selecting order
2. **Don't navigate away** from form without saving
3. **Don't select wrong order** - Check twice
4. **Don't forget to select vendor** - Form won't submit
5. **Don't create duplicate POs** by mistake
6. **Don't submit incomplete forms** - Fill all required fields

---

## Support

### Need Help?
1. Check this guide again
2. Ask your manager/supervisor
3. Contact IT support

### Report Issues
- Screenshot the error
- Note what you were doing
- Report to IT with details

---

## Summary

The new PO creation flow makes it:
- ✅ Faster to find sales orders
- ✅ Easier to create multiple POs
- ✅ Better visibility of existing POs
- ✅ Cleaner user interface
- ✅ More organized workflow

**Happy PO Creating!** 🎉
