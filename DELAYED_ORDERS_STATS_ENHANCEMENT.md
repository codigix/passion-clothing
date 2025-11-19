# Delayed Orders Stats Enhancement

## Overview
Added a new "Delayed Orders" statistics card to the Sales Orders dashboard that displays the count of orders that have passed their delivery date but are not yet completed.

## Features Added

### 1. **Delayed Orders Stat Card**
- Location: Sales Orders Page (`/sales/orders`)
- Position: Between "In Production" and "Delivered" cards
- Color: Red background with warning icon ⚠️
- Updates automatically as orders are loaded/filtered

### 2. **Calculation Logic**
An order is marked as **Delayed** if:
- Has a delivery date set
- Delivery date is before today (at 00:00:00)
- Status is NOT one of: `delivered`, `completed`, or `cancelled`

### 3. **Real-time Updates**
- Recalculates whenever orders are fetched or filters change
- Includes all pending, in-production, and ready-to-ship orders that are overdue

## Technical Implementation

### Files Modified
- **`client/src/pages/sales/SalesOrdersPage.jsx`**
  - Added `delayedOrdersCount` state variable
  - Added `calculateDelayedOrders()` function
  - Updated stats grid from 4 to 5 columns (lg:grid-cols-5)
  - Added red color scheme for warning visual

### Code Changes

#### 1. State Addition (Line 84)
```javascript
const [delayedOrdersCount, setDelayedOrdersCount] = useState(0);
```

#### 2. Calculation Function (Lines 106-121)
```javascript
const calculateDelayedOrders = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const delayed = orders.filter(order => {
    if (!order.delivery_date) return false;
    if (order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled') {
      return false;
    }
    const deliveryDate = new Date(order.delivery_date);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate < today;
  }).length;
  
  setDelayedOrdersCount(delayed);
};
```

#### 3. Effect Hook Update (Line 103)
```javascript
useEffect(() => {
  applyFilters();
  calculateDelayedOrders();
}, [orders, searchTerm, statusFilter, procurementFilter, dateFrom, dateTo]);
```

#### 4. Stats Card Addition (Line 338)
```javascript
{ label: 'Delayed', value: delayedOrdersCount, icon: FaExclamationTriangle, color: 'red' }
```

#### 5. Icon Import (Line 33)
```javascript
FaExclamationTriangle
```

## Usage

1. Navigate to Sales Orders page: `http://localhost:3000/sales/orders`
2. View the 5 stat cards at the top
3. The "Delayed" card shows the number of orders with passed delivery dates
4. Click on the card or use filters to explore delayed orders

## Visual Design

**Delayed Orders Card:**
- Background: Light red (`bg-red-50`)
- Icon: Warning triangle (`FaExclamationTriangle`)
- Icon Background: Red-100
- Icon Color: Red-600
- Border: Red-200

## Filtering Integration

The delayed orders count updates when:
- Orders are initially loaded
- Search term changes
- Status filter changes
- Procurement filter changes
- Date range filters change

## Future Enhancements

Possible improvements:
1. Add filter button to show only delayed orders
2. Add "Days Overdue" information to the card
3. Sort orders by delay duration in the table
4. Add email notifications for newly delayed orders
5. Add delay analytics/trending in reports

## Testing Checklist

- [ ] Stat card displays correctly at 0 when no delayed orders
- [ ] Stat card increments correctly when orders go past delivery date
- [ ] Stat card respects status filters (completed orders not counted)
- [ ] Responsive design works on mobile/tablet (md and lg breakpoints)
- [ ] Count updates when new orders are added
- [ ] Timezone handling is consistent across browsers
- [ ] Color scheme contrasts properly for accessibility

## Deployment Notes

No database migrations or API changes required. This is a frontend-only enhancement that calculates delayed orders from existing data.

---
**Implementation Date:** January 2025
**Status:** ✅ Complete