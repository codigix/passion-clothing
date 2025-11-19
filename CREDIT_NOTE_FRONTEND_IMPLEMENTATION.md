# Credit Note Frontend Implementation Guide

## Overview
Complete end-to-end frontend functionality for managing credit notes in response to material overage. The system integrates with the existing procurement dashboard and provides a comprehensive workflow for creating, managing, and settling credit notes.

## Architecture

### Components Created

#### 1. **CreditNoteModal** (`src/components/dialogs/CreditNoteModal.jsx`)
Modal dialog for creating new credit notes from GRN overage data.

**Features:**
- Pre-populates overage items from GRN
- Manual item adjustment capability
- Tax calculation and total computation
- Settlement method selection
- Real-time totals calculation
- Form validation

**Props:**
- `isOpen` - Boolean to control modal visibility
- `onClose` - Callback when modal closes
- `grnData` - GRN request data with metadata
- `onSuccess` - Callback after successful creation

**Usage:**
```jsx
<CreditNoteModal
  isOpen={creditNoteModalOpen}
  onClose={() => setCreditNoteModalOpen(false)}
  grnData={selectedOverageRequest}
  onSuccess={() => {
    setCreditNoteModalOpen(false);
    fetchDashboardData();
  }}
/>
```

#### 2. **CreditNoteFlow** (`src/components/procurement/CreditNoteFlow.jsx`)
Comprehensive component for viewing and managing credit note workflow.

**Features:**
- Display credit note details with financial summary
- Status timeline visualization
- Contextual action buttons based on status
- Modal dialogs for status transitions
- Settlement method and notes management
- Complete audit trail tracking

**Props:**
- `creditNote` - Credit note object
- `onUpdate` - Callback when credit note is updated
- `onClose` - Callback to close the flow

**Status Lifecycle:**
- **Draft** → Issued → Accepted → Settled
- Alternative: Rejected, Cancelled (at any point)

**Available Actions:**
- **Issue to Vendor** - Transition from draft to issued
- **Accept** - Vendor acceptance
- **Reject** - Vendor rejection with reason
- **Settle** - Complete settlement with method selection
- **Cancel** - Cancel at any stage

#### 3. **CreditNotesPage** (`src/pages/procurement/CreditNotesPage.jsx`)
Comprehensive page for viewing all credit notes with filtering and pagination.

**Features:**
- List view with pagination
- Search by credit note #, vendor name, GRN #
- Status filtering (draft, issued, accepted, rejected, settled, cancelled)
- Click to view detailed flow
- Real-time data refresh
- Amount and type columns

**Routes:**
- `/procurement/credit-notes` - Main credit notes list

## Integration with Procurement Dashboard

### Changes to ProcurementDashboard.jsx

#### 1. Import Addition
```jsx
import CreditNoteModal from "../../components/dialogs/CreditNoteModal";
```

#### 2. State Management
```jsx
const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);
const [selectedOverageRequest, setSelectedOverageRequest] = useState(null);
```

#### 3. Button Handler Update
The "Request Credit Note" button in the pending requests tab now opens the modal:
```jsx
<button
  onClick={() => {
    setSelectedOverageRequest(request);
    setCreditNoteModalOpen(true);
  }}
  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
>
  <FaMoneyBillWave className="w-4 h-4" />
  Request Credit Note
</button>
```

#### 4. Modal Component
The modal is rendered at the bottom of the dashboard:
```jsx
<CreditNoteModal
  isOpen={creditNoteModalOpen}
  onClose={() => {
    setCreditNoteModalOpen(false);
    setSelectedOverageRequest(null);
  }}
  grnData={selectedOverageRequest}
  onSuccess={() => {
    setCreditNoteModalOpen(false);
    setSelectedOverageRequest(null);
    fetchDashboardData();
  }}
/>
```

## User Workflows

### Workflow 1: Create Credit Note from Overage Request

1. **Navigate to Procurement Dashboard**
   - Go to `http://localhost:3000/procurement/dashboard`

2. **Locate Pending Requests Tab**
   - Scroll to "Pending Requests" section
   - Find the "Material Overage" request card

3. **Click "Request Credit Note" Button**
   - Opens CreditNoteModal dialog
   - Pre-populated with overage items from GRN

4. **Review and Adjust Items**
   - View quantities and unit prices
   - Edit if needed
   - Remove items if not needed

5. **Select Credit Note Type**
   - `partial_credit` - For partial overage credit
   - `full_return` - For returning entire overage
   - `adjustment` - For price adjustments

6. **Select Settlement Method**
   - `cash_credit` - Direct cash credit to vendor
   - `return_material` - Return of material
   - `adjust_invoice` - Adjust existing invoice
   - `future_deduction` - Deduct from future POs

7. **Add Tax Percentage (Optional)**
   - Tax is calculated automatically
   - Affects total amount

8. **Add Remarks (Optional)**
   - Internal notes about the credit

9. **Click "Create Credit Note"**
   - API call to `/api/credit-notes/`
   - Success notification displays
   - Modal closes
   - Dashboard refreshes

### Workflow 2: Manage Credit Notes

1. **Navigate to Credit Notes Page**
   - Go to `/procurement/credit-notes` or
   - Click "Credit Notes" link in navigation

2. **Search and Filter**
   - Use search box for quick lookup
   - Filter by status dropdown

3. **View Credit Note Details**
   - Click "View" button on any row
   - Opens detailed flow view

4. **Perform Status Transitions**
   - **Issue to Vendor** - Makes it visible to vendor
   - **Accept** - Vendor accepts the credit
   - **Reject** - Vendor rejects (provide reason)
   - **Settle** - Complete the credit (select method)
   - **Cancel** - Cancel the credit note

5. **Track Status Timeline**
   - Visual timeline shows all transitions
   - Includes user who performed action
   - Timestamp of each action

## API Endpoints Used

### Create Credit Note
```
POST /api/credit-notes/
Body: {
  grn_id: string,
  credit_note_type: 'partial_credit' | 'full_return' | 'adjustment',
  tax_percentage: number,
  settlement_method: 'cash_credit' | 'return_material' | 'adjust_invoice' | 'future_deduction',
  remarks: string,
  items: Array<{
    material_name: string,
    quantity: number,
    unit_price: number,
    total_price: number
  }>
}
```

### Get Credit Notes
```
GET /api/credit-notes/?limit=10&offset=0
```

### Get Credit Note Details
```
GET /api/credit-notes/:id
```

### Issue Credit Note
```
POST /api/credit-notes/:id/issue
```

### Accept Credit Note
```
POST /api/credit-notes/:id/accept
Body: {
  response: string (optional)
}
```

### Reject Credit Note
```
POST /api/credit-notes/:id/reject
Body: {
  response: string (rejection reason)
}
```

### Settle Credit Note
```
POST /api/credit-notes/:id/settle
Body: {
  settlement_method: string,
  settlement_notes: string
}
```

### Cancel Credit Note
```
POST /api/credit-notes/:id/cancel
Body: {
  response: string (cancellation reason)
}
```

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── dialogs/
│   │   │   └── CreditNoteModal.jsx (new)
│   │   └── procurement/
│   │       ├── CreditNoteFlow.jsx (new)
│   │       └── ... (existing components)
│   ├── pages/
│   │   ├── dashboards/
│   │   │   └── ProcurementDashboard.jsx (modified)
│   │   └── procurement/
│   │       ├── CreditNotesPage.jsx (new)
│   │       └── ... (existing pages)
│   └── App.jsx (modified)
```

## Routes Added

### In App.jsx
```jsx
<Route
  path="/procurement/credit-notes"
  element={
    <ProtectedDashboard department="procurement">
      <CreditNotesPage />
    </ProtectedDashboard>
  }
/>
```

## Key Features

### 1. **Real-time Calculations**
- Automatic total calculation from items
- Tax computation based on percentage
- Subtotal and total amount updates

### 2. **Item Management**
- Add/remove items
- Edit quantities and unit prices
- Real-time recalculation

### 3. **Status Workflow**
- Clear status progression
- Contextual actions available per status
- Modal dialogs for transitions with notes

### 4. **Data Persistence**
- All credit notes saved in database
- Status transitions tracked with user info
- Audit trail maintained

### 5. **Filtering and Search**
- Search by multiple fields
- Status-based filtering
- Pagination support

### 6. **Error Handling**
- Form validation
- API error messages
- Toast notifications for user feedback

## Styling

All components use **Tailwind CSS** with:
- Consistent color scheme
- Responsive design
- Accessible UI elements
- Professional status badges
- Modal dialogs with proper layering

## Dependencies

All dependencies already present in `package.json`:
- `react-icons` - Icon library
- `lucide-react` - Additional icons
- `react-hot-toast` - Toast notifications
- `react-router-dom` - Routing
- `axios` (via api utility) - HTTP requests

## Testing Checklist

- [ ] Create credit note from overage request
- [ ] Verify items pre-populated correctly
- [ ] Calculate taxes correctly
- [ ] Issue credit note to vendor
- [ ] View credit note details
- [ ] Test all status transitions
- [ ] Verify settlement with different methods
- [ ] Test rejection with reasons
- [ ] Verify pagination on credit notes list
- [ ] Test search functionality
- [ ] Test status filtering
- [ ] Verify audit trail on status page
- [ ] Test responsive design on mobile
- [ ] Verify error messages display
- [ ] Check toast notifications

## Common Issues & Solutions

### Issue: Modal doesn't appear when clicking "Request Credit Note"
**Solution:** Ensure ProcurementDashboard has correct state management and CreditNoteModal import.

### Issue: Items not pre-populated in modal
**Solution:** Verify that `grnData` has correct metadata.items_affected structure with overage_qty fields.

### Issue: API error on credit note creation
**Solution:** Check that backend credit note API is running and accessible at `/api/credit-notes/`.

### Issue: Build fails with icon import errors
**Solution:** Use only available icons from `react-icons/fa` or `lucide-react`.

## Future Enhancements

1. **Bulk Operations**
   - Bulk issue multiple credit notes
   - Bulk settle with same method

2. **Email Integration**
   - Email notifications to vendor on issue
   - Email confirmation on settlement

3. **Reporting**
   - Credit note reports by vendor
   - Monthly summary reports

4. **Vendor Portal**
   - Vendor can accept/reject in portal
   - Vendors can download credit note PDFs

5. **Payment Integration**
   - Automatic payment processing
   - Payment status tracking

## Support & Contact

For issues or questions, contact the procurement team or refer to backend documentation at `CREDIT_NOTE_FUNCTIONALITY.md`.
