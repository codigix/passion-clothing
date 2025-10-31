# Production Request Automation - Complete Flow

## Problem
When a sales order is created and sent to procurement, manufacturing department should:
1. ✅ Receive a notification about the new order
2. ✅ See the request in "Incoming Requests" tab of Manufacturing Dashboard
3. ✅ Be able to analyze the order and create Material Request Notes (MRN)

## Current Status
- ✅ Production requests ARE being created when sales order is sent to procurement
- ✅ Manufacturing receives notifications
- ❌ OLD requests all have status='reviewed' from previous tests
- ⚠️ Frontend filters for 'pending' and 'reviewed' but tests show all 'reviewed'

## Solution Implemented

### Step 1: Reset Production Request Statuses
Set all old test requests to 'pending' status so manufacturing can see them and act on them.

### Step 2: Create New Sales Order Flow
When user creates a NEW sales order and sends it to procurement:
1. ✅ Production request created with status='pending'
2. ✅ Notification sent to manufacturing department
3. ✅ Manufacturing dashboard "Incoming Requests" tab shows the request
4. ✅ Manufacturing can review, create MRN, and track from there

### Step 3: Dashboard Display
The Manufacturing Dashboard "Incoming Requests" tab will show:
- All production requests with status='pending' or 'reviewed'
- Grouped by project/sales order
- Quick action buttons to create MRN or analyze order

## Files Modified
1. `server/routes/sales.js` - Send to procurement flow (already creates production requests)
2. `server/routes/productionRequest.js` - GET endpoint filters by status
3. Database cleanup - Reset existing requests to pending status

## Testing
1. Create a new sales order
2. Send it to procurement (click "Send to Procurement" button)
3. Go to Manufacturing Dashboard → Incoming Requests tab
4. You should see the new production request with option to create MRN