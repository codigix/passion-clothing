# Inventory Shortage/Overage Requests Feature Setup

## Overview
This feature allows users to create inventory shortage and overage requests that appear in the procurement department's pending approvals page.

## Files Created/Modified

### Backend
1. **Model**: `server/models/InventoryShortageRequest.js` - Defines the database model
2. **Migration**: `server/migrations/20251110000004-create-inventory-shortage-requests-table.js` - Creates the table
3. **Config**: `server/config/database.js` - Registered the model and associations
4. **Routes**: `server/routes/procurement.js` - Added API endpoints:
   - `GET /procurement/inventory-requests` - Fetch shortage/overage requests
   - `POST /procurement/inventory-requests` - Create new request
   - `PATCH /procurement/inventory-requests/:id/approve` - Approve request
   - `PATCH /procurement/inventory-requests/:id/reject` - Reject request

### Frontend
1. **Page**: `client/src/pages/procurement/PendingApprovalsPage.jsx` - Updated to display shortage/overage requests

## Running the Migration

### Option 1: Using the Migration Runner Script
```bash
cd d:\projects\passion-clothing
node server/scripts/runInventoryShortageRequestMigration.js
```

### Option 2: Manual Migration in Node
```bash
cd d:\projects\passion-clothing
node -e "
const { sequelize } = require('./server/config/database');
const migration = require('./server/migrations/20251110000004-create-inventory-shortage-requests-table.js');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('✅ Migration completed successfully');
    await sequelize.close();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
"
```

### Option 3: Use Sequelize CLI (if configured)
```bash
cd d:\projects\passion-clothing\server
npx sequelize-cli db:migrate --name 20251110000004-create-inventory-shortage-requests-table.js
```

## API Endpoints

### 1. Get Pending Shortage Requests
```
GET /procurement/inventory-requests?status=pending_approval&type=all
```

Response:
```json
{
  "requests": [
    {
      "id": 1,
      "request_number": "ISR-20251110-AB123",
      "request_type": "shortage",
      "product_name": "Cotton Fabric",
      "current_stock": 10,
      "required_quantity": 50,
      "priority": "high",
      "status": "pending_approval",
      "creator": { "id": 1, "name": "John Doe" },
      "created_at": "2025-11-10T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 2. Create Shortage Request
```
POST /procurement/inventory-requests
```

Body:
```json
{
  "request_type": "shortage",
  "product_id": 1,
  "product_name": "Cotton Fabric",
  "product_code": "FAB-001",
  "current_stock": 10,
  "minimum_stock": 100,
  "required_quantity": 50,
  "uom": "meters",
  "reason": "Increased demand",
  "priority": "high",
  "notes": "Urgent - needed for production"
}
```

### 3. Approve Shortage Request
```
PATCH /procurement/inventory-requests/:id/approve
```

Body:
```json
{
  "notes": "Approved for procurement"
}
```

### 4. Reject Shortage Request
```
PATCH /procurement/inventory-requests/:id/reject
```

Body:
```json
{
  "rejection_reason": "Stock will be available next week"
}
```

## Database Schema

### Table: inventory_shortage_requests

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| request_number | VARCHAR(50) | Unique request number (ISR-YYYYMMDD-XXXXX) |
| request_type | ENUM('shortage', 'overage') | Type of request |
| product_id | INTEGER | Reference to product |
| product_code | VARCHAR(50) | Product code |
| product_name | VARCHAR(200) | Product name |
| current_stock | DECIMAL(12,2) | Current inventory level |
| minimum_stock | DECIMAL(12,2) | Minimum required level |
| required_quantity | DECIMAL(12,2) | Shortage/overage quantity |
| uom | VARCHAR(20) | Unit of measurement |
| reason | TEXT | Reason for request |
| priority | ENUM('low','medium','high','urgent') | Priority level |
| status | ENUM | Request status (pending, pending_approval, approved, rejected, po_created, resolved) |
| created_by | INTEGER | User who created request |
| created_at | DATETIME | Creation timestamp |
| approved_by | INTEGER | User who approved |
| approved_at | DATETIME | Approval timestamp |
| rejected_by | INTEGER | User who rejected |
| rejection_reason | TEXT | Rejection reason |
| rejected_at | DATETIME | Rejection timestamp |
| related_po_id | INTEGER | PO created from this request |
| notes | TEXT | Additional notes |
| updated_at | DATETIME | Last update timestamp |

## Frontend Usage

### In PendingApprovalsPage
- Shortage/overage requests appear in a separate section below purchase orders
- Admin users can approve or reject requests
- Non-admin users see a read-only view with "Admin approval required" message
- Request statistics are displayed in the stats cards

### Stats Cards Show:
- Total Pending items (POs + Requests)
- PO Value
- Number of Shortage Requests
- Urgent Priority count

## Workflow

1. **Request Creation**: Any authenticated user from inventory, manufacturing, or procurement department can create a shortage/overage request
2. **Submission**: Request is created with status "pending_approval"
3. **Notification**: Procurement department receives notifications
4. **Approval/Rejection**: Admin users can approve or reject in the pending approvals page
5. **Action**: Once approved, procurement can create a PO (future enhancement)

## Testing

To test the feature:

1. Navigate to http://localhost:3000/procurement/pending-approvals
2. You should see the new stats card for "Shortage Requests"
3. Create a test shortage request (requires backend test or API client)
4. Verify it appears in the pending approvals list
5. Test approve/reject actions

## Future Enhancements

- [ ] Create PO directly from approved shortage request
- [ ] Batch processing of multiple shortage requests
- [ ] Auto-detection of shortages based on inventory levels
- [ ] Historical tracking of shortage resolution
- [ ] Export shortage request reports
- [ ] Integration with vendor pricing for estimated cost

## Troubleshooting

### Migration Fails
- Ensure MySQL is running
- Check database credentials in .env
- Verify no `inventory_shortage_requests` table already exists

### API Endpoint Not Found
- Ensure server has restarted after code changes
- Check procurement.js file has the new endpoints
- Verify Express app is loaded correctly

### Frontend Not Showing Requests
- Check browser console for API errors
- Verify user has procurement department role
- Ensure migration has been run to create table
- Check network tab to see if API call succeeds

## Notes
- The PO creation from approved requests is a future enhancement
- Requests are independent of POs - they don't automatically close any PO
- Users can create requests from any department with appropriate permissions
- Admin approval is required for all shortage/overage requests
