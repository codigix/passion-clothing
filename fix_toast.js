const fs = require('fs');

const file = 'd:\\projects\\passion-clothing\\client\\src\\pages\\procurement\\CreatePurchaseOrderPage.jsx';
let content = fs.readFileSync(file, 'utf-8');

// Update toast message
const oldToast = `          toast.success(
            \`Loaded Sales Order: \${
              so.order_number || so.id || "Successfully loaded"
            }\`
          );`;

const newToast = `          toast.success(
            \`Loaded Sales Order: \${
              so.order_number || so.id || "Successfully loaded"
            }. Add items needed for production.\`
          );`;

if (content.includes(oldToast)) {
  content = content.replace(oldToast, newToast);
  fs.writeFileSync(file, content, 'utf-8');
  console.log('✓ Toast message updated');
} else {
  console.log('⚠ Toast pattern not found exactly');
}
