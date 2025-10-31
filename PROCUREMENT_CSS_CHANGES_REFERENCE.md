# Procurement Dashboard - CSS Changes Reference Guide

## Quick CSS Change Lookup

### Header Section
```jsx
// BEFORE
<h1 className="text-3xl font-bold mb-2">Purchase Orders</h1>
<p className="text-slate-500 text-base">Manage and track all purchase orders...</p>

// AFTER
<h1 className="text-xl font-semibold mb-0.5">Purchase Orders</h1>
<p className="text-slate-500 text-xs">Manage and track all purchase orders...</p>

// CHANGES
text-3xl         → text-xl         (-58% size)
font-bold        → font-semibold   (lighter weight)
mb-2             → mb-0.5          (-75% margin)
text-base        → text-xs         (-20% size)
```

### Summary Cards Grid
```jsx
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">

// AFTER
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-3">

// CHANGES
gap-3            → gap-2          (-33% gap)
mb-6             → mb-3           (-50% margin)
grid-cols-1      → grid-cols-2    (better mobile)
```

### Summary Card Container
```jsx
// BEFORE
<div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm">

// AFTER
<div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">

// CHANGES
p-5              → p-2.5          (-50% padding)
```

### Card Content - Label
```jsx
// BEFORE
<p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Total Orders</p>

// AFTER
<p className="text-xs text-slate-400 font-normal mb-1 truncate">Total Orders</p>

// CHANGES
uppercase        → removed         (less visually loud)
tracking-wide    → removed         (tighter spacing)
font-semibold    → font-normal     (lighter weight)
mb-2             → mb-1           (-50% margin)
                 + truncate        (prevent overflow)
```

### Card Content - Number
```jsx
// BEFORE
<p className="text-2xl font-bold text-slate-800">{summary.total_orders}</p>

// AFTER
<p className="text-lg font-semibold text-slate-800">{summary.total_orders}</p>

// CHANGES
text-2xl         → text-lg        (-30% size)
font-bold        → font-semibold  (lighter weight)
```

### Card Icon
```jsx
// BEFORE
<FaShoppingCart size={20} className="text-blue-500" />
<div className="bg-blue-50 p-3 rounded-lg">

// AFTER
<FaShoppingCart size={14} className="text-blue-500" />
<div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">

// CHANGES
size={20}        → size={14}      (-30% icon)
p-3              → p-2            (-33% padding)
                 + flex-shrink-0  (prevent stretching)
```

### Search Input
```jsx
// BEFORE
<input className="w-full p-3 border border-slate-200 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 placeholder-slate-400 transition-all" />
<FaSearch size={18} />

// AFTER
<input className="w-full p-2 text-xs border border-slate-200 rounded-lg pl-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 placeholder-slate-400 transition-all" />
<FaSearch size={12} />

// CHANGES
p-3              → p-2            (-33% padding)
                 + text-xs        (smaller text)
pl-10            → pl-8           (-20% left padding for icon)
focus:ring-2     → focus:ring-1   (thinner focus ring)
size={18}        → size={12}      (-33% icon)
```

### Columns Button
```jsx
// BEFORE
<button className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all font-medium">
  <FaColumns size={16} />

// AFTER
<button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all font-medium whitespace-nowrap">
  <FaColumns size={12} />

// CHANGES
gap-1.5          → gap-1          (-33% gap)
px-4             → px-2.5         (-37% horizontal padding)
py-2.5           → py-1.5         (-40% vertical padding)
                 + text-xs        (smaller text)
size={16}        → size={12}      (-25% icon)
                 + whitespace-nowrap (prevent wrapping)
```

### Filter Section Container
```jsx
// BEFORE
<div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm mb-6">

// AFTER
<div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm mb-3">

// CHANGES
p-5              → p-2.5          (-50% padding)
mb-6             → mb-3           (-50% margin)
```

### Filter Row
```jsx
// BEFORE
<div className="flex items-center justify-between mb-4">

// AFTER
<div className="flex items-center justify-between mb-2 gap-2 flex-wrap">

// CHANGES
mb-4             → mb-2           (-50% margin)
                 + gap-2          (spacing between items)
                 + flex-wrap      (wrap on small screens)
```

### Filter Inputs Grid
```jsx
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">

// AFTER
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">

// CHANGES
grid-cols-1      → grid-cols-2    (2 cols on mobile)
gap-3            → gap-2          (-33% gap)
pt-4             → pt-2           (-50% padding-top)
```

### Filter Label
```jsx
// BEFORE
<label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>

// AFTER
<label className="block text-xs font-medium text-slate-700 mb-1">Status</label>

// CHANGES
text-sm          → text-xs        (-20% size)
font-semibold    → font-medium    (lighter weight)
mb-2             → mb-1           (-50% margin)
```

### Filter Select Input
```jsx
// BEFORE
<select className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 transition-all" />

// AFTER
<select className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:ring-opacity-20 bg-white text-slate-800 transition-all" />

// CHANGES
p-2.5            → p-1.5          (-40% padding)
                 + text-xs        (smaller text)
focus:ring-2     → focus:ring-1   (thinner ring)
```

### Table Container
```jsx
// BEFORE
<table className="min-w-full divide-y divide-slate-100">

// AFTER
<table className="min-w-full divide-y divide-slate-200">

// CHANGES
divide-slate-100 → divide-slate-200 (darker dividers for compact spacing)
```

### Table Header
```jsx
// BEFORE
<thead className="bg-slate-50 border-b border-slate-100">

// AFTER
<thead className="bg-slate-100 border-b border-slate-200">

// CHANGES
bg-slate-50      → bg-slate-100   (darker background)
border-slate-100 → border-slate-200 (darker border)
```

### Table Header Cell
```jsx
// BEFORE
<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">PO Number</th>

// AFTER
<th className="px-2 py-2 text-left text-xs font-medium text-slate-700">PO Number</th>

// CHANGES
px-4             → px-2           (-50% horizontal padding)
py-3             → py-2           (-33% vertical padding)
font-semibold    → font-medium    (lighter weight)
uppercase        → removed        (less visual noise)
tracking-wider   → removed        (tighter letters)
text-slate-600   → text-slate-700 (darker text)
```

### Table Body
```jsx
// BEFORE
<tbody className="bg-white divide-y divide-slate-100">

// AFTER
<tbody className="bg-white divide-y divide-slate-200">

// CHANGES
divide-slate-100 → divide-slate-200 (darker dividers)
```

### Table Row
```jsx
// BEFORE
<tr className="hover:bg-slate-50 transition-colors group">

// AFTER
<tr className="hover:bg-slate-50 transition-colors group">
/* No changes to styling, but cells inside changed */

// CELL CHANGES:
<td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">

// BECOMES:
<td className="px-2 py-2 whitespace-nowrap text-xs text-slate-700">

px-4             → px-2           (-50% horizontal)
py-3             → py-2           (-33% vertical)
text-sm          → text-xs        (-20% size)
```

### Table Data - Link
```jsx
// BEFORE
<button className="font-semibold hover:underline" style={{ color: '#0f172a' }}>
  {order.po_number}
</button>

// AFTER
<button className="font-medium text-xs hover:underline" style={{ color: '#0f172a' }}>
  {order.po_number}
</button>

// CHANGES
font-semibold    → font-medium    (lighter weight)
                 + text-xs        (smaller text)
```

### Expanded Row
```jsx
// BEFORE
<tr className="bg-slate-50 border-t-2 border-blue-200">
  <td colSpan={AVAILABLE_COLUMNS.length} className="px-4 py-4">
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Available Actions</h4>

// AFTER
<tr className="bg-slate-50 border-t border-blue-200">
  <td colSpan={AVAILABLE_COLUMNS.length} className="px-2 py-2">
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-slate-700 mb-1.5">Available Actions</h4>

// CHANGES
border-t-2       → border-t       (thinner border)
px-4             → px-2           (-50% padding)
py-4             → py-2           (-50% padding)
space-y-3        → space-y-1      (-67% gap)
text-sm          → text-xs        (-20% size)
font-semibold    → font-medium    (lighter weight)
mb-3             → mb-1.5         (-50% margin)
```

### Action Buttons Grid
```jsx
// BEFORE
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">

// AFTER
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1">

// CHANGES
grid-cols-2      → grid-cols-3    (more cols on mobile)
lg:grid-cols-4   → lg:grid-cols-6 (more cols on desktop)
xl:grid-cols-6   → xl:grid-cols-8 (even more on 4K)
gap-2            → gap-1          (-50% gap)
```

### Action Button
```jsx
// BEFORE
<button className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-medium border border-blue-200">
  <FaEye size={16} />
  <span className="text-center">View</span>
</button>

// AFTER
<button className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-normal border border-blue-200">
  <FaEye size={12} />
  <span className="text-center text-xs">View</span>
</button>

// CHANGES
gap-1            → gap-0.5        (-50% gap)
px-3             → px-2           (-33% horizontal)
py-2.5           → py-1.5         (-40% vertical)
rounded-lg       → rounded        (smaller border radius)
font-medium      → font-normal    (lighter weight)
size={16}        → size={12}      (-25% icon)
                 + text-xs        (explicit font size)
```

### QR Code Modal Header
```jsx
// BEFORE
<div className="px-6 py-5 border-b border-slate-100">
  <h2 className="text-lg font-semibold text-slate-800">Purchase Order QR Code</h2>
</div>

// AFTER
<div className="px-4 py-3 border-b border-slate-100">
  <h2 className="text-sm font-semibold text-slate-800">PO QR Code</h2>
</div>

// CHANGES
px-6             → px-4           (-33% horizontal)
py-5             → py-3           (-40% vertical)
text-lg          → text-sm        (-30% size)
title            → shortened      (PO QR Code vs Purchase Order QR Code)
```

### QR Code Modal Content
```jsx
// BEFORE
<div className="p-6">
  <div className="text-center mb-6">
    <QRCodeDisplay size={200} />
  </div>

// AFTER
<div className="p-3">
  <div className="text-center mb-3">
    <QRCodeDisplay size={160} />
  </div>

// CHANGES
p-6              → p-3            (-50% padding)
mb-6             → mb-3           (-50% margin)
size={200}       → size={160}     (-20% QR code)
```

### QR Modal Info Box
```jsx
// BEFORE
<div className="space-y-3 text-sm mb-6 bg-slate-50 p-4 rounded-lg">
  <div className="text-slate-700"><strong>PO Number:</strong> ...</div>

// AFTER
<div className="space-y-1.5 text-xs mb-3 bg-slate-50 p-2.5 rounded">
  <div className="text-slate-700"><strong>PO:</strong> ...</div>

// CHANGES
space-y-3        → space-y-1.5    (-50% gap)
text-sm          → text-xs        (-20% size)
mb-6             → mb-3           (-50% margin)
p-4              → p-2.5          (-37% padding)
rounded-lg       → rounded        (smaller radius)
label            → shortened      (PO Number → PO)
```

### QR Modal Buttons
```jsx
// BEFORE
<button className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-all font-medium">
  Close
</button>

// AFTER
<button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded transition-all font-medium text-xs">
  Close
</button>

// CHANGES
px-4             → px-3           (-25% horizontal)
py-2.5           → py-2           (-20% vertical)
rounded-lg       → rounded        (smaller radius)
                 + text-xs        (explicit font size)
```

## Summary of Changes

### Padding Changes
- Large padding (p-6, p-5): → p-3, p-2.5 (-50%)
- Medium padding (p-4, p-3): → p-2 (-50%)
- Small padding (px-4): → px-2.5, px-2 (-37% to -50%)

### Margin Changes
- Large margins (mb-8, mb-6): → mb-3 (-50% to -62%)
- Medium margins (mb-4): → mb-2 (-50%)
- Small margins (mb-2): → mb-1 (-50%)

### Font Size Changes
- text-3xl → text-xl (-58%)
- text-2xl → text-lg (-30%)
- text-base → text-xs (-20%)
- text-sm → text-xs (-20%)
- Explicit text-xs added where needed

### Font Weight Changes
- font-bold → font-semibold (reduce by one level)
- font-semibold → font-medium (reduce by one level)
- Appropriate areas changed to font-normal

### Gap Changes
- gap-4 → gap-2 (-50%)
- gap-3 → gap-2 (-33%)
- gap-1.5 → gap-1 (-33%)
- gap-1 → gap-0.5 (-50%)

### Icon Size Changes
- size-20 → size-14 (-30%)
- size-16 → size-12 (-25%)

### Border Radius Changes
- rounded-lg → rounded (slightly smaller)
- Some removed for even more compact look

### Color/Border Changes
- divide-slate-100 → divide-slate-200 (darker)
- border-slate-100 → border-slate-200 (darker)
- bg-slate-50 → bg-slate-100 (darker headers)

## Testing Checklist

- [ ] Verify all text readable
- [ ] Verify no overlaps
- [ ] Verify responsive on mobile/tablet/desktop
- [ ] Verify all buttons clickable
- [ ] Verify hover states work
- [ ] Verify all functionality preserved
- [ ] Verify colors still accessible (contrast ratio)