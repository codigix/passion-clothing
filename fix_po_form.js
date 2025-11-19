const fs = require('fs');

const filePath = 'd:\\projects\\passion-clothing\\client\\src\\pages\\procurement\\CreatePurchaseOrderPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Simple string replacements
// 1. Remove/replace the mappedItems section with a comment
const mappedItemsPattern = new RegExp(
  '          // Auto-fill from Sales Order\\s+const soItems = so\\.items \\|\\| \\[\\];\\s+const mappedItems = soItems\\.map.*?^          \\}\\);',
  'ms'
);

if (content.match(mappedItemsPattern)) {
  content = content.replace(mappedItemsPattern, '          // Sales Order items are shown as reference only, not prefilled into PO items');
  console.log('✓ Removed mappeditems function');
} else {
  console.log('⚠ Could not find mappedItems section - trying alternative approach');
  // Alternative: look for specific lines and comment them out
  const lines = content.split('\n');
  let foundStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Auto-fill from Sales Order')) {
      foundStart = i;
      break;
    }
  }
  
  if (foundStart >= 0) {
    // Find the end of the function (looking for });)
    let braceCount = 0;
    let foundEnd = -1;
    
    for (let i = foundStart + 1; i < lines.length; i++) {
      for (let char of lines[i]) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      if (braceCount === 0 && lines[i].includes('});')) {
        foundEnd = i;
        break;
      }
    }
    
    if (foundEnd > foundStart) {
      // Replace those lines
      const newLines = lines.slice(0, foundStart)
        .concat(['          // Sales Order items are shown as reference only, not prefilled into PO items'])
        .concat(lines.slice(foundEnd + 1));
      content = newLines.join('\n');
      console.log(`✓ Removed lines ${foundStart} to ${foundEnd}`);
    }
  }
}

// 2. Replace the items assignment
if (content.includes('items: mappedItems.length > 0 ? mappedItems : prev.items,')) {
  content = content.replace(
    'items: mappedItems.length > 0 ? mappedItems : prev.items,',
    'items: prev.items,'
  );
  console.log('✓ Fixed items assignment');
}

// 3. Update success message
if (content.includes('Loaded data from Sales Order:')) {
  content = content.replace(
    'Loaded data from Sales Order:',
    'Loaded Sales Order:'
  );
  console.log('✓ Updated success toast message (part 1)');
}

if (content.includes('so.order_number || so.id || "Successfully loaded"`')) {
  content = content.replace(
    'so.order_number || so.id || "Successfully loaded"`',
    'so.order_number || so.id || "Successfully loaded"}. Add items needed for production.`'
  );
  console.log('✓ Updated success toast message (part 2)');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\n✅ All updates completed!');
