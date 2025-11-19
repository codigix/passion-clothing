# GRN Request Workflow - Quick Start Guide

## What Changed?

A new GRN (Goods Receipt Note) request workflow has been implemented to streamline communication between Procurement and Inventory departments.

## For Procurement Users

### Requesting a GRN

**Steps:**
1. Open **Procurement Dashboard** → **Purchase Orders** tab
2. Find the PO where materials have been received
3. Look for the orange **"Request GRN"** button in the Actions column
4. Click the button
5. Confirm in the dialog box
6. You'll see: `✓ GRN request sent for PO [PO_NUMBER]! Inventory Department has been notified.`

**When will the button appear?**
- After you click "Received" (materials received)
- PO status must be: `in_transit`, `dispatched`, `partial_received`, or `received`

**What happens next?**
- PO status changes to `grn_requested`
- Inventory department receives the request
- You can track the request in the Inventory Dashboard

---

## For Inventory Users

### Managing Incoming GRN Requests

**Steps:**
1. Open **GRN Workflow Dashboard** (Inventory module)
2. Click the **"Incoming Requests"** tab at the top
3. You'll see all GRN requests from Procurement with yellow cards
4. For each request, you can:
   - Click **"Create GRN"** → Create the GRN in the normal workflow
   - Click **"View PO"** → See PO details from Procurement

**What you'll see:**
- PO Number with `grn_requested` badge
- Vendor name
- Project name
- Total Quantity and Amount
- Number of pending requests in the tab badge

**After Creating GRN:**
1. The GRN enters the normal verification workflow
2. Handle any discrepancies (shortages/excess)
3. Get approvals if needed
4. Complete the GRN
5. Materials are added to Inventory

---

## Complete Flow

### Example Workflow

**Procurement:**
```
1. Create PO for Vendor
   ↓
2. Send to Vendor
   ↓
3. Receive Materials
   ↓
4. Click "Request GRN" ← NEW
   ↓
   Inventory notified!
```

**Inventory:**
```
   Receive notification
   ↓
1. Go to GRN Dashboard
   ↓
2. Open "Incoming Requests" tab ← NEW
   ↓
3. Click "Create GRN" ← NEW
   ↓
4. Verify quantities
   ↓
5. Handle discrepancies (shortages/excess)
   ↓
6. Get approvals if needed
   ↓
7. Complete GRN
   ↓
8. Materials in Inventory ✓
```

---

## Key Features

✅ **Easy Request Sending** - Simple one-click workflow from Procurement
✅ **Clear Status** - PO status tracks "grn_requested" state
✅ **Direct Access** - Inventory sees all pending requests in one place
✅ **Quick Navigation** - Easy links between PO and GRN creation
✅ **Visual Indicators** - Badges show count of pending requests
✅ **Confirmations** - Prevents accidental requests with dialog

---

## Common Questions

**Q: Can I cancel a GRN request?**
A: Not directly through this interface. Contact an admin or use the backend.

**Q: What if I accidentally clicked "Request GRN"?**
A: Contact Inventory team or an admin to revert the PO status.

**Q: When should I click "Request GRN"?**
A: After materials have physically arrived and you've marked them as received, and before sending to verification.

**Q: Can multiple POs request GRN at the same time?**
A: Yes! Inventory can handle multiple requests and create GRNs in any order.

**Q: What happens to a GRN request after it's used?**
A: Once a GRN is created from the request, the PO is no longer in the "Incoming Requests" list and moves into normal GRN workflow.

---

## Tab View

### "Incoming Requests" Tab
- Shows POs waiting for GRN creation
- Yellow border cards for visual distinction
- Count badge shows number of pending requests
- Quick action buttons: "Create GRN" and "View PO"

### "All GRNs" Tab
- Shows all created GRNs (existing functionality)
- Filter by status and search
- View GRN details and verification status

---

## Status Badges

| Status | What it means |
|--------|--------------|
| `grn_requested` | Waiting for Inventory to create GRN |
| `received` | GRN created, materials verified, no issues |
| `short_received` | GRN created, received less than ordered |
| `excess_received` | GRN created, received more than ordered |
| `completed` | GRN fully processed, in inventory |

---

## Next Steps

1. **Procurement Users**: Use "Request GRN" button when materials arrive
2. **Inventory Users**: Check "Incoming Requests" tab regularly
3. **Both**: Communicate via the notification system

---

## Need Help?

- Check the GRN_REQUESTS_IMPLEMENTATION_GUIDE.md for technical details
- Contact your system administrator for issues
- Review the PO and GRN details in the linked pages