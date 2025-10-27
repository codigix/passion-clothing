# Courier Agent Integration for Shipments - Complete Implementation

## Overview
Replaced courier partner selection with courier agent selection in the shipment dispatch workflow. The system now fetches courier agents from the database and uses them directly instead of courier partners.

## Changes Made

### 1. Frontend Changes (ShipmentDispatchPage.jsx)

#### State Management
- Replaced `courierPartners` state with `courierAgents` state
- Updated fetch function from `fetchCourierPartners()` to `fetchCourierAgents()`

#### Dispatch Form Modal
- Changed label from "Courier Partner *" to "Courier Agent *"
- Updated form field from `courier_partner_id` to `courier_agent_id`
- Modified dropdown options to display: `{agent.name} ({agent.company_name})`
- Updated prefill logic to use `shipment.courier_agent_id`
- Maintained "Prefilled from Order" badge for prefilled fields
- Green border styling for prefilled courier agent selection

#### API Integration
- Updated `fetchCourierAgents()` to call `/api/courier-agents` endpoint
- Modified `handleDispatchShipment()` to send `courier_agent_id` instead of `courier_partner_id`

### 2. Backend Changes (shipments.js)

#### Import Statement
- Added `CourierAgent` to the destructured import from database config

#### GET Shipments Endpoint
- Added `CourierAgent` to the include array with alias `'courierAgent'`
- Enables CourierAgent data to be fetched with shipment records

#### POST Status Update Endpoint (`/:id/status`)
- Added destructuring of `courier_agent_id`, `tracking_number`, and `notes` from request body
- Updated shipment record with:
  - `courier_agent_id` (from form or existing value)
  - `tracking_number` (from form or existing value)
  - `special_instructions` (from notes or existing value)
- Added `CourierAgent` to the response include array

### 3. Database Model Changes (Shipment.js)

#### New Field Added
```javascript
courier_agent_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'courier_agents',
    key: 'id'
  },
  comment: 'Reference to courier_agents table'
}
```

#### Index Addition
- Added index on `courier_agent_id` for query performance

### 4. Database Association Changes (database.js)

#### Shipment Associations
- Added: `Shipment.belongsTo(CourierAgent, { foreignKey: 'courier_agent_id', as: 'courierAgent' })`
- Added: `CourierAgent.hasMany(Shipment, { foreignKey: 'courier_agent_id', as: 'shipments' })`

## Database Migration

### SQL Migration File
File: `add-courier-agent-to-shipments.sql`

```sql
-- Add courier_agent_id column to shipments table
ALTER TABLE `shipments` ADD COLUMN `courier_agent_id` INT NULL AFTER `courier_partner_id`;

-- Add foreign key constraint
ALTER TABLE `shipments` 
ADD CONSTRAINT `fk_shipments_courier_agent_id` 
FOREIGN KEY (`courier_agent_id`) REFERENCES `courier_agents`(`id`) ON DELETE SET NULL;

-- Add index
CREATE INDEX `idx_shipments_courier_agent_id` ON `shipments`(`courier_agent_id`);
```

### How to Apply Migration
1. **Option A: Manual SQL Execution**
   ```bash
   mysql -u root -p passion_erp < add-courier-agent-to-shipments.sql
   ```

2. **Option B: Via Node Script**
   ```javascript
   const db = require('./server/config/database');
   // Execute the migration
   ```

## Workflow Improvements

### Before
1. Select courier partner from a list
2. Manually enter tracking number
3. Dispatch shipment
- Limited visibility into individual courier representatives

### After
1. Select courier **agent** (person responsible) from dropdown
2. Tracking number auto-populated or auto-generated if missing
3. Dispatch shipment
4. Courier agent information stored directly with shipment
- Direct accountability to specific courier representatives
- Better tracking and performance metrics

## Data Flow

```
Shipment Created
    ↓
Shipment Dashboard → "Dispatch" Button Clicked
    ↓
Dispatch Modal Opens
    ↓
Pre-fill courier_agent_id from shipment record
    ↓
User selects or confirms Courier Agent
    ↓
Submit dispatch form with courier_agent_id
    ↓
Backend updates shipment with:
  - courier_agent_id
  - tracking_number
  - special_instructions
  - status = 'dispatched'
    ↓
Shipment record fully updated with courier agent assignment
```

## API Changes

### GET /shipments
**Response now includes:**
```json
{
  "shipments": [
    {
      "id": 1,
      "shipment_number": "SHP-20250115-0001",
      "status": "dispatched",
      "tracking_number": "TRK-1-123456",
      "courier_agent_id": 5,
      "courierAgent": {
        "id": 5,
        "name": "John Smith",
        "company_name": "Express Logistics",
        "phone": "555-1234",
        "email": "john@expresslogistics.com"
      },
      ...
    }
  ]
}
```

### POST /shipments/:id/status
**Request body now accepts:**
```json
{
  "status": "dispatched",
  "location": "Main Warehouse",
  "courier_agent_id": 5,
  "tracking_number": "TRK-1-123456",
  "notes": "Handle with care"
}
```

## Files Modified

1. **Frontend**
   - `client/src/pages/shipment/ShipmentDispatchPage.jsx` - Courier agent selection & prefilling

2. **Backend**
   - `server/routes/shipments.js` - API endpoints for dispatch
   - `server/models/Shipment.js` - Model field addition
   - `server/config/database.js` - Associations

3. **Database**
   - `add-courier-agent-to-shipments.sql` - Migration script

## Backward Compatibility

✅ **Fully backward compatible**
- `courier_partner_id` field remains in database
- Both fields can coexist during transition period
- Existing shipments with partner IDs are unaffected
- New shipments use `courier_agent_id`

## Testing Checklist

- [ ] Run database migration
- [ ] Restart server to load new model changes
- [ ] Navigate to Shipment Dashboard
- [ ] Click dispatch button on a shipment
- [ ] Verify courier agent dropdown loads with agents from database
- [ ] Verify prefill works (green badges shown)
- [ ] Submit dispatch form
- [ ] Verify shipment status updated to "dispatched"
- [ ] Check shipment record has correct courier_agent_id
- [ ] Verify GET /shipments includes courierAgent data

## Deployment Steps

1. **Database Migration**
   ```bash
   mysql -u root -p passion_erp < add-courier-agent-to-shipments.sql
   ```

2. **Deploy Backend** (shipments.js, Shipment.js, database.js)

3. **Deploy Frontend** (ShipmentDispatchPage.jsx)

4. **Restart Services**
   ```bash
   npm restart
   ```

5. **Verify**
   - Test dispatch workflow
   - Check courier agent data is saved
   - Verify API responses include courierAgent

## Benefits

✅ Direct assignment of shipments to specific courier representatives
✅ Better accountability and tracking
✅ Improved visibility into individual agent performance
✅ Seamless integration with existing courier agent database
✅ Pre-filled forms reduce manual data entry errors
✅ Auto-generated tracking numbers ensure every shipment is trackable