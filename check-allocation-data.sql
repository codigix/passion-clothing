-- Check inventory data
SELECT 
  so.order_number,
  COUNT(i.id) as item_count,
  SUM(i.current_stock) as total_stock,
  GROUP_CONCAT(DISTINCT i.stock_type) as stock_types
FROM inventory i
LEFT JOIN sales_orders so ON i.sales_order_id = so.id
WHERE i.is_active = 1
GROUP BY so.order_number
ORDER BY so.order_number DESC;

-- Check total inventory
SELECT 
  COUNT(*) as total_items,
  SUM(current_stock) as total_stock,
  GROUP_CONCAT(DISTINCT stock_type) as all_types
FROM inventory
WHERE is_active = 1;

-- Check specific sales order
SELECT 
  so.id,
  so.order_number,
  so.status,
  so.total_quantity,
  COUNT(i.id) as inv_count,
  SUM(i.current_stock) as inv_stock
FROM sales_orders so
LEFT JOIN inventory i ON so.id = i.sales_order_id AND i.is_active = 1
WHERE so.order_number = 'SO-20251031-0001'
GROUP BY so.id;