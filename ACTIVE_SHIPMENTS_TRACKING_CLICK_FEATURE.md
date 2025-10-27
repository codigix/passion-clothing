# Active Shipments - Tracking ID Click Feature

## Overview
Implemented a clickable tracking ID feature in the Active Shipments page that allows users to redirect to the Shipment Tracking page and automatically load the shipment tracking details.

## Features Implemented

### 1. **Clickable Tracking ID**
- Tracking number in Shipment Cards now displays as a clickable blue link
- Hover effect: Changes to darker blue and underlines on mouse over
- Tooltip: "Click to track shipment" appears on hover

### 2. **Auto-Load Tracking Data**
- When clicking on a tracking ID, user is redirected to `/shipment/tracking/{trackingId}`
- Tracking page automatically loads and displays the shipment details
- No need to manually search or enter tracking number

### 3. **URL Parameter Support**
- Routing updated to accept tracking ID as URL parameter
- Both routes work:
  - `/shipment/tracking` - Manual tracking page (empty)
  - `/shipment/tracking/{trackingId}` - Auto-loaded tracking page

## Changes Made

### 1. **App.jsx** (Line 259)
**Added new route to accept tracking ID parameter:**
```javascript
<Route path="/shipment/tracking/:trackingId" element={<ProtectedDashboard department="shipment"><ShipmentTrackingPage /></ProtectedDashboard>} />
```

### 2. **ShipmentTrackingPage.jsx** (Lines 2, 30-48)
**Updated to use URL parameter and auto-load tracking data:**

```javascript
// Import useParams
import { useParams } from 'react-router-dom';

// Extract trackingId from URL
const { trackingId } = useParams();

// Initialize trackingNumber state with URL parameter
const [trackingNumber, setTrackingNumber] = useState(trackingId || '');

// Auto-load tracking data when trackingId changes
useEffect(() => {
  if (trackingId) {
    handleTrackShipment(trackingId);
  }
}, [trackingId]);
```

### 3. **ShippingDashboardPage.jsx** (Lines 355-375)
**Made tracking number clickable in ShipmentCard component:**

```javascript
// New handler for tracking click
const handleTrackingClick = () => {
  if (shipment.tracking_number) {
    navigate(`/shipment/tracking/${shipment.tracking_number}`);
  } else {
    toast.error('No tracking number available');
  }
};

// Updated tracking number display as clickable button
<button
  onClick={handleTrackingClick}
  className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 font-mono font-semibold transition-colors cursor-pointer"
  title="Click to track shipment"
>
  {shipment.tracking_number}
</button>
```

## User Experience Flow

### Before Implementation
1. User views Active Shipments dashboard
2. Tracking number is displayed as plain text
3. To track a shipment, user must:
   - Navigate to /shipment/tracking page
   - Manually search or enter tracking number
   - Wait for results to load

### After Implementation
1. User views Active Shipments dashboard
2. Tracking number appears as blue clickable link
3. Click on tracking number:
   - Automatically redirects to tracking page
   - Shipment details load instantly
   - All tracking information displayed immediately

## Visual Indicators

### Tracking ID Styling
- **Default State**: `text-xs text-blue-600 font-mono font-semibold`
- **Hover State**: `text-blue-800 hover:underline transition-colors`
- **Cursor**: Changes to pointer on hover
- **Tooltip**: "Click to track shipment" (title attribute)

### Color Scheme
- Primary color: Blue (#2563EB)
- Hover color: Dark Blue (#1E40AF)
- Font: Monospace (for tracking numbers)

## Technical Details

### State Management
```javascript
// ShipmentTrackingPage now initializes with URL parameter
const { trackingId } = useParams();
const [trackingNumber, setTrackingNumber] = useState(trackingId || '');
```

### Effect Hook Execution Order
1. Component mounts
2. First useEffect fetches recent shipments
3. Second useEffect checks for trackingId and auto-calls handleTrackShipment
4. Loading state shows during API request
5. Results display once loaded

### Error Handling
- If no tracking number exists, shows error toast: "No tracking number available"
- If shipment not found, handled by existing error logic in ShipmentTrackingPage
- Navigation fails gracefully if tracking number is missing

## Navigation Flow

```
Active Shipments Page
    ↓ (Click tracking number)
ShipmentTrackingPage with :trackingId parameter
    ↓ (useParams extracts trackingId)
Auto-load shipment data
    ↓
Display complete tracking information
```

## Browser History
- Clicking tracking number adds new entry to browser history
- Users can use browser back button to return to Active Shipments
- URL in address bar shows: `/shipment/tracking/{trackingNumber}`

## Backward Compatibility
- All existing functionality preserved
- Manual tracking page still accessible at `/shipment/tracking`
- "View Details" button in shipment cards continues to work
- Other tracking methods unaffected

## Testing Checklist

- [x] Tracking ID displays as clickable link in Shipment Cards
- [x] Hover effect shows correctly (blue color + underline)
- [x] Clicking tracking ID redirects to `/shipment/tracking/{trackingId}`
- [x] ShipmentTrackingPage auto-loads tracking data
- [x] Loading state shows during data fetch
- [x] Shipment details display correctly
- [x] Error handling works when tracking number missing
- [x] Browser back button returns to Active Shipments
- [x] No tracking number case handled gracefully
- [x] Manual tracking (without parameter) still works

## Related Files
- `client/src/pages/shipment/ShippingDashboardPage.jsx` - Active Shipments display
- `client/src/pages/shipment/ShipmentTrackingPage.jsx` - Tracking details page
- `client/src/App.jsx` - Routing configuration
- `server/routes/shipments.js` - Backend tracking endpoint

## Notes
- Uses existing `handleTrackShipment` function from ShipmentTrackingPage
- No backend changes required
- Works with both tracking_number and shipment_number fields
- Responsive design maintained on all screen sizes

## Future Enhancements
- Add breadcrumb navigation showing origin page
- Add QR code scanning from tracking ID
- Add quick-track favorites
- Add tracking history
- Add bulk tracking for multiple shipments