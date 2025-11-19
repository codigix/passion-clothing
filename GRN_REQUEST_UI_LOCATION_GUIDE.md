# GRN Request - Where to Find It in the UI

## 🗺️ Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Passion Clothing ERP                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sidebar                                                    │
│  ├─ Dashboard                                              │
│  ├─ Sales                                                  │
│  ├─ Procurement                                            │
│  ├─ 📦 Inventory ← YOU ARE HERE                            │
│  │  ├─ Inventory (Dashboard) ← PENDING REQUESTS HERE       │
│  │  ├─ 📝 Goods Receipt (GRN) ← ACTUAL GRNs APPEAR HERE   │
│  │  ├─ Products                                            │
│  │  └─ ...                                                 │
│  ├─ Manufacturing                                          │
│  └─ ...                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 Location 1: Inventory Dashboard (Pending Requests)

### Path
```
Sidebar → Inventory → Inventory (Dashboard)
URL: http://localhost:3000/inventory
```

### What You'll See
```
┌─────────────────────────────────────────────────────┐
│ Inventory Dashboard                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Stat Cards at top]                                 │
│  ├─ Total Items                                    │
│  ├─ Low Stock                                      │
│  └─ ...                                            │
│                                                     │
│ ───────────────────────────────────────────────    │
│ PENDING GRN REQUESTS / INCOMING ORDERS             │
│ ───────────────────────────────────────────────    │
│                                                     │
│ ┌────────────────────────────────────────────────┐│
│ │ PO #12345                                      ││
│ │ Status: Materials Received                     ││
│ │                                                ││
│ │ [📋 View Details]  [✅ Create GRN] [❌ Reject] ││
│ └────────────────────────────────────────────────┘│
│                                                     │
│ ┌────────────────────────────────────────────────┐│
│ │ PO #12346                                      ││
│ │ Status: Materials Received                     ││
│ │                                                ││
│ │ [📋 View Details]  [✅ Create GRN] [❌ Reject] ││
│ └────────────────────────────────────────────────┘│
│                                                     │
│ Recent Movements                                   │
│ ... (rest of dashboard)                            │
└─────────────────────────────────────────────────────┘
```

### What to Do Here
1. **Look for** the section titled "Pending GRN Requests" or "Incoming Orders"
2. **Find** your PO number that you marked as received
3. **Click** "[✅ Create GRN]" or "[Approve]" button
4. **Confirm** when prompted

---

## 📍 Location 2: GRN Workflow Dashboard (Actual GRNs)

### Path
```
Sidebar → Inventory → Goods Receipt (GRN)
URL: http://localhost:3000/inventory/grn
```

### What You'll See (Before Approval)
```
┌─────────────────────────────────────────────────────┐
│ GRN Workflow Dashboard                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Tabs: [All] [Pending] [Verified] [Added]          │
│                                                     │
│ 📌 Status:                                         │
│ ┌─────────────────────────────────────────────────┐│
│ │  No GRNs found                                  ││
│ │  (You haven't approved any requests yet)        ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### What You'll See (After Approval)
```
┌─────────────────────────────────────────────────────┐
│ GRN Workflow Dashboard                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Tabs: [All] [Pending] [Verified] [Added]          │
│                                                     │
│ ┌────────────────────────────────────────────────┐│
│ │ GRN #GRN-001                    ✓ Accurate    ││
│ │ PO #12345 | Vendor: ABC Supplies               ││
│ │ Received: 100 items  |  Status: Pending       ││
│ │                                                ││
│ │ [👁️ View] [✓ Verify] [➕ Add to Inventory]   ││
│ └────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Step-by-Step Navigation

### Step 1: Go to Inventory Dashboard
```
1. Click on "Inventory" in the sidebar
2. Click on "Inventory (Dashboard)"
3. You're now at: /inventory
```

### Step 2: Find Pending GRN Requests
```
1. Scroll down to find "Pending GRN Requests" or "Incoming Orders"
2. Look for your Purchase Order number
3. It should show: "Status: Materials Received"
```

### Step 3: Approve the Request
```
1. Click the "[✅ Create GRN]" or "[Approve]" button
2. Confirm when prompted
3. Wait for confirmation message
```

### Step 4: Check GRN Page
```
1. Click on "Goods Receipt (GRN)" in the sidebar
2. You're now at: /inventory/grn
3. Your newly created GRN should appear in the list
```

---

## 🎨 Visual Element Identification

### In Inventory Dashboard
Look for these visual clues:

```
🟠 "Pending GRN Requests" or "Incoming Orders" Section
   └─ Contains cards with PO numbers
   └─ Each card has "Create GRN" button

📊 "Pending Materials" Stat Card (top right)
   └─ Shows count of pending GRN requests
   └─ Click to see requests
```

### In GRN Workflow Dashboard
Look for these visual clues:

```
🟢 Green status badges for "Accurate Qty"
   └─ Indicates quantities match perfectly

🟡 Yellow status badges for "Short Received"  
   └─ Indicates shortage

🔵 Blue status badges for "Excess Received"
   └─ Indicates overage

🔴 Red status badges for "Mixed Variances"
   └─ Indicates both shortage and excess
```

---

## 💡 Tips for Finding Your Request

### If You Can't Find It in Inventory Dashboard

**Try these searches:**
1. Use browser Find (`Ctrl+F`) and search for your PO number
2. Look in multiple tabs if they exist
3. Scroll down - requests might be below other content

### If You Can't Find It in GRN Dashboard

**Try these checks:**
1. Make sure you **approved** the request (not just created it)
2. Refresh the page (`Ctrl+F5`)
3. Check the status filter - make sure "All" is selected
4. Try creating the GRN manually via `/inventory/grn/create`

---

## 🔀 URL Shortcuts

```
Direct URL Jumps:
├─ Inventory Dashboard: http://localhost:3000/inventory
├─ GRN Page: http://localhost:3000/inventory/grn
├─ Create GRN: http://localhost:3000/inventory/grn/create
├─ Verify GRN: http://localhost:3000/inventory/grn/:id/verify
└─ Add to Inventory: http://localhost:3000/inventory/grn/:id/add-to-inventory
```

---

## ⚠️ Common Mistakes

❌ **Mistake 1**: Looking for GRN in `/inventory/grn` immediately after creating request
   - ✅ **Fix**: First approve the request in Inventory Dashboard
   - ✅ **Then** go to `/inventory/grn` to see the actual GRN

❌ **Mistake 2**: Confusing GRN Request with Actual GRN
   - ✅ **Remember**: Request = pending, GRN = approved

❌ **Mistake 3**: Not scrolling down in Inventory Dashboard
   - ✅ **Fix**: Pending requests might be below other sections

---

## ✅ Success Indicators

### You're on the Right Track When:
- [ ] You see a pending GRN request in Inventory Dashboard
- [ ] It shows your PO number
- [ ] It has an "Approve" or "Create GRN" button
- [ ] After clicking, you see a success message

### Your Fix is Complete When:
- [ ] The request disappears from Inventory Dashboard pending section
- [ ] A new GRN appears in `/inventory/grn`
- [ ] The GRN shows your PO number
- [ ] The GRN status is "Pending Verification" or similar

---

## 📞 Debugging Checklist

If things aren't working:

- [ ] Did you mark the PO as "materials received"?
- [ ] Is the Inventory Dashboard showing any pending requests?
- [ ] Did you click the correct "Approve" button?
- [ ] Did you get a success message after approving?
- [ ] Did you refresh `/inventory/grn` after approval?
- [ ] Is your browser showing a network error in console?

Check your browser console (`F12`) for any error messages.

---

## 🎯 Summary

| Action | Location |
|--------|----------|
| **View pending requests** | Inventory Dashboard (`/inventory`) |
| **Approve request** | Inventory Dashboard (click Approve button) |
| **View actual GRNs** | GRN Workflow Dashboard (`/inventory/grn`) |
| **Create GRN manually** | Create GRN Page (`/inventory/grn/create`) |
