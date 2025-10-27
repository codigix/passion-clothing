# Courier Agent Display in Shipment Dashboard - Complete Guide

## Overview
This guide explains how to integrate and display Courier Agents in your Shipment Dashboard.

## What Has Been Done

### 1. **Backend Already Implemented**
The courier agent system was already fully implemented with:
- **Database Model**: `CourierAgent` with comprehensive fields
- **API Endpoints**: Complete REST API at `/courier-agents`
- **Admin Pages**: Courier agent management interface
- **Agent Portal**: Dedicated agent login page

### 2. **Frontend Enhancement - ShipmentDashboard Update**
Added a new **"Courier Agents"** tab (Tab 5 out of 6 total tabs) to display:
- Active courier agents with real-time status
- Performance metrics (total shipments, on-time deliveries, rating)
- Agent details (name, company, phone, region)
- Visual rating stars (0-5 stars based on performance_rating)
- Quick navigation to add new agents

### 3. **Changes Made to ShipmentDashboard.jsx**

#### a. **Added State for Courier Agents**
```javascript
const [courierAgents, setCourierAgents] = useState([]);
```

#### b. **Added Fetch Function**
```javascript
const fetchCourierAgents = async () => {
  try {
    const response = await api.get('/courier-agents?is_active=true');
    setCourierAgents(response.data.agents || []);
  } catch (error) {
    console.error('Failed to fetch courier agents:', error);
    toast.error('Failed to load courier agents');
  }
};
```

#### c. **Integrated into Data Loading**
- Added to initial load effect
- Added to refresh handler
- Called alongside other dashboard data

#### d. **New Tab Panel (Index 4)**
The new tab displays:
- **Header**: Agent count and "Add Courier Agent" button
- **Empty State**: Message when no agents exist
- **Agent Cards**: Grid layout showing:
  - Agent name and ID
  - Active/Inactive badge
  - Company, phone, and region
  - Performance metrics in 3-column grid:
    - Total Shipments (Blue)
    - On-time Deliveries (Green)
    - Performance Rating (Amber)
  - 5-star rating visualization
  - Failed deliveries count
  - View Details button

## Tab Structure

| Index | Tab Name | Purpose |
|-------|----------|---------|
| 0 | Incoming Orders | Manufacturing orders ready for shipment |
| 1 | Active Shipments | Current shipments in transit |
| 2 | Delivery Tracking | Real-time tracking updates |
| 3 | Courier Partners | Delivery company information |
| **4** | **Courier Agents** | **NEW: Individual delivery personnel** |
| 5 | Performance Analytics | Key metrics and trends |

## How to Use

### For Admin Users:
1. Navigate to **Shipment Dashboard**
2. Click on the **"Courier Agents"** tab
3. View all active courier agents with their performance
4. Click **"Add Courier Agent"** to go to management page

### Agent Information Displayed:

**Top Section:**
- Agent Name
- Agent ID (auto-generated, e.g., COR-20250117-001)
- Active/Inactive status badge
- Company name

**Contact Section:**
- Phone number
- Company affiliation
- Region/Territory (if assigned)

**Performance Section:**
- **Total Shipments**: Lifetime number of deliveries
- **On-time Deliveries**: Count of on-time deliveries
- **Performance Rating**: 0-5 star rating based on success rate
- **Failed Deliveries**: Count of failed deliveries
- **Visual Star Rating**: 0-5 stars displayed visually

## API Endpoints Used

### Fetch Courier Agents
```
GET /courier-agents?is_active=true
```
**Response:**
```json
{
  "agents": [
    {
      "id": 1,
      "agent_id": "COR-20250117-001",
      "agent_name": "John Doe",
      "email": "john@courier.com",
      "phone": "+91-9999999999",
      "courier_company": "FastExpress",
      "region": "North India",
      "is_active": true,
      "is_verified": true,
      "performance_rating": 4.5,
      "total_shipments": 150,
      "on_time_deliveries": 135,
      "failed_deliveries": 5,
      "last_login": "2025-01-17T10:30:00Z"
    }
  ]
}
```

## Features

### 1. **Real-time Status Display**
- Active/Inactive status with color badges
- Green for active, gray for inactive

### 2. **Performance Tracking**
- Automatic calculation of on-time delivery rate
- Star rating system (0-5 stars)
- Failed delivery tracking

### 3. **Responsive Design**
- Single column on mobile
- 2 columns on tablet
- 3 columns on desktop
- Grid auto-adjusts based on screen size

### 4. **Visual Indicators**
- Color-coded metrics (Blue, Green, Amber)
- Star rating visualization
- Active status badges
- Company affiliation badges

### 5. **Navigation**
- Quick access from Shipment Dashboard
- Link to agent management page
- "View Details" button for individual agents

## How Agent Performance Rating is Calculated

```
Performance Rating = (On-time Deliveries / Total Shipments) × 5
```

**Example:**
- Total Shipments: 100
- On-time Deliveries: 90
- Performance Rating: (90/100) × 5 = 4.5 stars

## Database Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| agent_id | STRING | Unique identifier (auto-generated) |
| agent_name | STRING | Full name of courier agent |
| email | STRING | Email address (unique) |
| phone | STRING | Phone number |
| courier_company | STRING | Name of courier company |
| region | STRING | Territory/region covered |
| is_active | BOOLEAN | Active status |
| is_verified | BOOLEAN | Email verification status |
| performance_rating | DECIMAL | 0-5 rating based on success rate |
| total_shipments | INTEGER | Total deliveries handled |
| on_time_deliveries | INTEGER | Count of on-time deliveries |
| failed_deliveries | INTEGER | Count of failed deliveries |
| last_login | DATE | Last login timestamp |

## Adding Courier Agents

To add a new courier agent:

1. From ShipmentDashboard → Courier Agents tab
2. Click **"Add Courier Agent"** button
3. Navigate to Admin → Courier Agents management page
4. Fill in the form:
   - Agent Name (required)
   - Email (required, unique)
   - Phone (required)
   - Courier Company (required)
   - Region (optional)
   - Notes (optional)
5. System generates automatic Agent ID
6. System generates temporary password
7. Agent receives verification link
8. Agent sets permanent password via link

## Integration Points

### Frontend:
- **File**: `client/src/pages/dashboards/ShipmentDashboard.jsx`
- **State**: `courierAgents`
- **Functions**: `fetchCourierAgents()`

### Backend:
- **Model**: `server/models/CourierAgent.js`
- **Routes**: `server/routes/courierAgent.js`
- **API Base**: `/courier-agents`

### Pages:
- **Shipment Dashboard**: View agents (NEW)
- **Admin → Courier Agent Management**: Add/Edit agents
- **Courier Agent Login**: Agent portal login

## Future Enhancements

Potential improvements:
1. Agent availability calendar/status toggle
2. Real-time location tracking
3. Delivery assignment interface
4. Feedback and rating system
5. Agent performance dashboard
6. Bulk agent import
7. Territory assignment and optimization
8. Historical performance analytics

## Troubleshooting

### Agents Not Showing:
- Verify agents are active: `is_active = true`
- Check API endpoint: `/courier-agents?is_active=true`
- Verify authentication token is valid

### Performance Metrics Incorrect:
- Check `total_shipments` > 0
- Verify `on_time_deliveries` is updated after shipments
- Rating = (on_time_deliveries / total_shipments) × 5

### Add Agent Button Not Working:
- Verify admin has proper permissions
- Check if route `/admin/courier-agents` exists
- Ensure authentication is valid

## Files Modified

1. **client/src/pages/dashboards/ShipmentDashboard.jsx**
   - Added `courierAgents` state
   - Added `fetchCourierAgents()` function
   - Added new tab panel (index 4)
   - Updated tab labels
   - Updated data loading functions

## Quick Commands

### Fetch all active agents:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/courier-agents?is_active=true
```

### Add new agent:
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "John Doe",
    "email": "john@courier.com",
    "phone": "+91-9999999999",
    "courier_company": "FastExpress",
    "region": "North India"
  }' \
  http://localhost:5000/api/courier-agents/add
```

## Summary

✅ **Courier Agents** are now fully integrated into the Shipment Dashboard
✅ **Performance metrics** are displayed with visual indicators
✅ **Real-time status** shows agent availability
✅ **Responsive design** works on all screen sizes
✅ **Easy navigation** to manage agents from admin panel

The system is ready to use! Navigate to your Shipment Dashboard and check the new "Courier Agents" tab.