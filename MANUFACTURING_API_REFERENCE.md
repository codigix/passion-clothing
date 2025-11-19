# Manufacturing API Reference - GET Orders Endpoint

## Endpoint

### List Production Orders
```
GET /api/manufacturing/orders
```

**Authentication**: Required (Bearer JWT token)  
**Authorization**: Requires "manufacturing" or "admin" department  
**Rate Limit**: Standard (1000 requests per 15 minutes)

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status. Comma-separated for multiple values |
| `limit` | number | No | 100 | Number of records to return (max 1000) |
| `offset` | number | No | 0 | Pagination offset for results |
| `product_id` | number | No | - | Filter by product ID |

---

## Query Examples

### Example 1: Get first 20 orders
```
GET /api/manufacturing/orders?limit=20
```

### Example 2: Get all cutting stage orders
```
GET /api/manufacturing/orders?status=cutting
```

### Example 3: Get multiple stage orders
```
GET /api/manufacturing/orders?status=cutting,stitching,printing
```

### Example 4: Get orders for specific product
```
GET /api/manufacturing/orders?product_id=5
```

### Example 5: Pagination
```
GET /api/manufacturing/orders?limit=50&offset=100
```

### Example 6: Combined filters
```
GET /api/manufacturing/orders?status=pending&product_id=5&limit=10
```

---

## Valid Status Values

| Status | Description |
|--------|-------------|
| `pending` | Order awaiting to start |
| `in_progress` | Order currently being produced |
| `on_hold` | Order paused/held |
| `cutting` | In cutting stage |
| `stitching` | In stitching stage |
| `printing` | In printing stage |
| `packaging` | In packaging stage |
| `quality_check` | In quality check stage |
| `finishing` | In finishing stage |
| `completed` | Order completed |
| `cancelled` | Order cancelled |

---

## Response Format

### Success Response (200 OK)

```json
{
  "productionOrders": [
    {
      "id": 1,
      "production_number": "PO-2024-001",
      "quantity": 100,
      "status": "pending",
      "priority": "high",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "product": {
        "id": 1,
        "name": "Basic T-Shirt",
        "product_code": "TS-001",
        "specifications": {
          "color": "Navy Blue",
          "size": "L"
        }
      },
      "salesOrder": {
        "id": 1,
        "order_number": "SO-2024-001",
        "status": "confirmed",
        "customer_id": 1,
        "customer": {
          "id": 1,
          "name": "Acme Corp",
          "company_name": "Acme Corporation"
        }
      },
      "stages": [
        {
          "id": 1,
          "stage_name": "Cutting",
          "status": "pending"
        },
        {
          "id": 2,
          "stage_name": "Stitching",
          "status": "pending"
        }
      ]
    }
  ],
  "count": 1
}
```

### Error Response (400 Bad Request)

```json
{
  "message": "Invalid query parameters",
  "error": "Invalid limit value"
}
```

### Error Response (401 Unauthorized)

```json
{
  "message": "Invalid token"
}
```

### Error Response (403 Forbidden)

```json
{
  "message": "Access denied. Required department: manufacturing"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "message": "Failed to fetch production orders",
  "error": "Database connection error"
}
```

---

## Response Fields

### ProductionOrder Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Internal unique identifier |
| `production_number` | string | Human-readable production order number |
| `quantity` | number | Total quantity to produce |
| `status` | string | Current order status |
| `priority` | string | Order priority (low, medium, high, urgent) |
| `created_at` | datetime | When the order was created |
| `updated_at` | datetime | When the order was last updated |

### Product Object (nested)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Product ID |
| `name` | string | Product name |
| `product_code` | string | Product SKU/code |
| `specifications` | object | Product specifications (JSON) |

### SalesOrder Object (nested)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Sales order ID |
| `order_number` | string | Sales order number |
| `status` | string | Sales order status |
| `customer_id` | number | Customer ID |

### Customer Object (nested in SalesOrder)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Customer ID |
| `name` | string | Customer name |
| `company_name` | string | Company name |

### Stage Object (nested array)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Production stage ID |
| `stage_name` | string | Name of the stage |
| `status` | string | Stage status |

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful retrieval of orders |
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required department |
| 500 | Server Error | Database or server error |

---

## Usage Examples

### JavaScript/Axios

```javascript
// Get all orders with limit
const response = await api.get('/manufacturing/orders?limit=100');
const orders = response.data.productionOrders;

// Filter by status
const cuttingOrders = await api.get('/manufacturing/orders?status=cutting');

// Multiple statuses
const stageOrders = await api.get(
  '/manufacturing/orders?status=cutting,stitching,printing'
);

// By product
const productOrders = await api.get(
  '/manufacturing/orders?product_id=5'
);

// Pagination
const page2 = await api.get(
  '/manufacturing/orders?limit=50&offset=50'
);
```

### cURL

```bash
# Get all orders
curl -X GET "http://localhost:5000/api/manufacturing/orders?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/manufacturing/orders?status=cutting" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Multiple filters
curl -X GET "http://localhost:5000/api/manufacturing/orders?status=pending,in_progress&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Python/Requests

```python
import requests

headers = {
    'Authorization': f'Bearer {jwt_token}'
}

# Get all orders
response = requests.get(
    'http://localhost:5000/api/manufacturing/orders?limit=100',
    headers=headers
)
orders = response.json()['productionOrders']

# Filter by status
response = requests.get(
    'http://localhost:5000/api/manufacturing/orders?status=cutting',
    headers=headers
)
```

---

## Error Handling

### Common Errors

**1. 401 Unauthorized - Invalid Token**
```javascript
try {
  const response = await api.get('/manufacturing/orders');
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Please login again');
    // Redirect to login
  }
}
```

**2. 403 Forbidden - Wrong Department**
```javascript
try {
  const response = await api.get('/manufacturing/orders');
} catch (error) {
  if (error.response?.status === 403) {
    console.log('You do not have access to manufacturing orders');
  }
}
```

**3. Handle Results with No Orders**
```javascript
const response = await api.get('/manufacturing/orders?status=nonexistent');
if (response.data.count === 0) {
  console.log('No orders found with that status');
}
```

---

## Performance Considerations

1. **Always use limit for large datasets**: Don't fetch all 10,000 orders at once
   ```javascript
   // ❌ Avoid
   GET /api/manufacturing/orders

   // ✅ Prefer
   GET /api/manufacturing/orders?limit=100
   ```

2. **Use pagination for iterating**:
   ```javascript
   // Page 1
   GET /api/manufacturing/orders?limit=50&offset=0
   // Page 2
   GET /api/manufacturing/orders?limit=50&offset=50
   ```

3. **Filter on server, not client**: Use status filter instead of fetching all
   ```javascript
   // ❌ Avoid
   const orders = await api.get('/manufacturing/orders?limit=10000');
   const cutting = orders.filter(o => o.status === 'cutting');

   // ✅ Prefer
   const orders = await api.get('/manufacturing/orders?status=cutting');
   ```

---

## Caching Recommendations

- Cache results for 30-60 seconds
- Invalidate cache when creating/updating orders
- Use cache for repeated status queries

```javascript
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

async function getCuttingOrders() {
  const cacheKey = 'manufacturing:cutting';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await api.get('/manufacturing/orders?status=cutting');
  cache.set(cacheKey, {
    data: response.data.productionOrders,
    timestamp: Date.now()
  });
  
  return response.data.productionOrders;
}
```

---

## Related Endpoints

- `GET /api/manufacturing/orders/:id` - Get single order details
- `POST /api/manufacturing/orders` - Create new production order
- `POST /api/manufacturing/orders/:id/start` - Start order production
- `POST /api/manufacturing/orders/:id/pause` - Pause production
- `POST /api/manufacturing/orders/:id/resume` - Resume production
- `POST /api/manufacturing/orders/:id/stop` - Stop/cancel production
- `GET /api/manufacturing/orders/ready-for-shipment` - Get completed orders

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current | Initial release with filtering and pagination support |

---

## Support & Issues

For issues or questions:
1. Check that server is running: `http://localhost:5000`
2. Verify JWT token is valid
3. Ensure user has "manufacturing" department
4. Check browser console for detailed error messages
5. Review server logs: `server/logs/` (if available)

---

**Last Updated**: Current Session  
**Endpoint Status**: ✅ Active and Tested  
**Documentation Version**: 1.0