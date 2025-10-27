# Shipment Dashboard - Visual Guide & Quick Reference

## 📊 Dashboard Layout Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER SECTION                              │
│  🚚 Shipment & Delivery Dashboard                    [Live] [+] [⟳] │
│  Real-time tracking, performance analytics, coordination            │
└─────────────────────────────────────────────────────────────────────┘

┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│  Total    │ In Transit│ Delivered │ Delayed   │ On-Time % │ Avg Days  │
│  124      │ 28        │ 89        │ 7         │ 92%       │ 2.5 days  │
│  🚚       │ 🔄        │ ✓         │ ⚠️        │ 📈        │ ⏱️        │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 🔍 Search | [Bulk Track] [Performance] [Reports] [Export]           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ [Incoming Orders] [Active Shipments] [Delivery Tracking] [...]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Active Shipments Tab Content                                        │
│                                                                       │
│  Shipment # │ Order # │ Customer │ Address │ Courier │ ... │ ⏱️ Time │
│  SHP-001    │ ORD-100 │ Acme Inc │ ...     │ FedEx   │ ... │ 3 days  │
│  SHP-002    │ ORD-101 │ Beta LLC │ ...     │ DHL     │ ... │ 5 days  │
│  SHP-003    │ ORD-102 │ Gamma Co │ ...     │ UPS     │ ... │ 1 day   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme Reference

### Status Badges

#### Delivered Status
```
┌─────────────────────────┐
│ ✓ 3 days                │  Background: #d1fae5 (Emerald-100)
│                         │  Text: #047857 (Emerald-700)
└─────────────────────────┘  Border: #a7f3d0 (Emerald-200)
                             Icon: ⏱️ Clock (Emerald-600)
```

#### In-Progress Status
```
┌─────────────────────────┐
│ ⏱️ 5 days (In progress)  │  Background: #fef3c7 (Amber-100)
│                         │  Text: #b45309 (Amber-700)
└─────────────────────────┘  Border: #fde68a (Amber-200)
                             Icon: ⏱️ Clock (Amber-600)
```

### Header Colors
```
Gradient: from-slate-900 (Dark Slate) → via-blue-900 → to-blue-800 (Deep Blue)
Text: Blue-100 (#dbeafe - Light Blue)
Accent Circle: Blue-400 with opacity-10
```

### Table Header
```
Background: Linear gradient (Slate-900 → Blue-900 → Blue-800)
Text: Blue-100 (Light blue on dark background)
Font: Bold, uppercase, letter-spaced
```

### Row Identification

#### Delivered Row (Left Border)
```
┌─ Border-Left-4 (Emerald-500)
│
└─ Row: bg-emerald-50, Hover: bg-emerald-100
```

#### In-Progress Row (Left Border)
```
┌─ Border-Left-4 (Blue-400)
│
└─ Row: bg-white, Hover: bg-blue-50
```

---

## 📐 Spacing & Layout

### Header Section
```
Padding: p-8 (32px all sides)
Gap between elements: gap-6
Logo area: p-3 (padding on icon container)
Icon size: 28px
Title size: text-4xl (36px)
```

### Stats Grid
```
Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6
Gap: gap-4 (16px between items)
Card padding: p-5 (20px all sides)
Icon size: 24px
Value font size: text-3xl
```

### Table
```
Header padding: px-4 py-4 (16px horizontal, 16px vertical)
Row padding: px-4 py-3 (16px horizontal, 12px vertical)
Column spacing: Gap maintained with px-4
Time Taken cell: flex items-center gap-2 px-3 py-1.5 rounded-lg
```

---

## 🎯 Interactive Elements

### Hover Effects

#### Stats Cards
```
Before Hover: Shadow-lg, no scale
Hover: Shadow-xl, scale-105 (1.05x zoom)
Transition: 300ms
Cursor: pointer
```

#### Quick Action Buttons
```
Before Hover: border-gray-300, normal state
Hover: border-color change (blue/violet/amber), bg-color-50
Example: hover:border-blue-400 hover:bg-blue-50
Transition: transition-all (smooth)
```

#### Tab Navigation
```
Inactive: border-transparent, text-gray-600
Hover: bg-gray-100
Active: border-blue-600 (bottom), text-blue-700, bg-blue-50
Transition: 200ms
```

#### Table Rows
```
Delivered: bg-emerald-50 → hover bg-emerald-100, shadow-md
In-Progress: bg-white → hover bg-blue-50, shadow-md
Transition: transition-all 200ms
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
```
Header: Stacked layout (flex-col)
Stats: 1 column (grid-cols-1)
Buttons: Full width, stacked
Quick Actions: Vertical stack
Table: Horizontal scroll
```

### Tablet (640px - 1024px)
```
Header: Flex row (sm:flex-row)
Stats: 2 columns (sm:grid-cols-2)
Buttons: Side by side (flex-wrap)
Quick Actions: Multi-row
Table: Horizontal scroll with adjustments
```

### Desktop (1024px+)
```
Header: Full horizontal layout
Stats: 6 columns (xl:grid-cols-6)
Buttons: All inline (flex-nowrap)
Quick Actions: Single row (md:grid-cols-12)
Table: Full display with sticky header
```

---

## ⏱️ Time Taken Column Examples

### Different Scenarios

#### Delivered Yesterday
```
Input: created_at = 2025-01-15, delivered_at = 2025-01-16
Calculation: Math.ceil((delivered - created) / ms_per_day) = 1
Display: ✓ 1 day
Badge: Green/Emerald
```

#### In-Progress (5 Days)
```
Input: created_at = 2025-01-11, now = 2025-01-16
Calculation: Math.ceil((now - created) / ms_per_day) = 5
Display: ⏱️ 5 days (In progress)
Badge: Amber/Yellow
```

#### Delivered (2.5 Days)
```
Input: created_at = 2025-01-13, delivered_at = 2025-01-15 12:00
Calculation: Math.ceil((delivered - created) / ms_per_day) = 3
Display: ✓ 3 days (rounded up)
Badge: Green/Emerald
```

#### Same Day Delivery
```
Input: created_at = 2025-01-15 10:00, delivered_at = 2025-01-15 18:00
Calculation: Math.ceil((delivered - created) / ms_per_day) = 1
Display: ✓ 1 day (minimum is 1 day)
Badge: Green/Emerald
```

---

## 🔧 CSS Classes Reference

### Header
```css
.bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800
.rounded-2xl shadow-2xl p-8
.text-white overflow-hidden relative
.text-4xl font-bold
.text-blue-100 text-base leading-relaxed
```

### Stats Card
```css
.bg-gradient-to-br ${bgGradient}
.border ${borderColor} rounded-xl p-5
.shadow-lg hover:shadow-xl
.transition-all duration-300
.transform hover:scale-105 cursor-pointer
.text-3xl font-bold text-gray-900
.p-3 rounded-lg bg-white bg-opacity-70
```

### Table Header
```css
.bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800
.sticky top-0 z-10
.px-4 py-4
.text-xs font-bold text-blue-100 uppercase tracking-wider
```

### Table Row - Delivered
```css
.bg-emerald-50 hover:bg-emerald-100
.border-l-4 border-l-emerald-500
.transition-all duration-200 hover:shadow-md
```

### Table Row - In-Progress
```css
.bg-white hover:bg-blue-50
.border-l-4 border-l-blue-400
.transition-all duration-200 hover:shadow-md
```

### Time Taken Badge
```css
.flex items-center gap-2
.px-3 py-1.5 rounded-lg
.font-medium text-sm w-fit
.border
/* For Delivered: */
.bg-emerald-100 text-emerald-700 border-emerald-200
/* For In-Progress: */
.bg-amber-100 text-amber-700 border-amber-200
```

---

## 🎬 Animation Reference

### Scale Animation (Stats Card)
```css
.hover:scale-105
/* Enlarges card to 1.05x (5% bigger) on hover */
/* Smooth: transition-all duration-300 */
```

### Shadow Animation
```css
.shadow-lg hover:shadow-xl
/* Increases shadow depth on hover */
```

### Color Transition
```css
.transition-all
/* All property changes animate smoothly */
/* Used for color changes, shadow changes, etc. */
```

### Icon Scale
```css
.transform hover:scale-110
/* Icon enlarges to 1.10x (10% bigger) on hover */
```

---

## 📋 Component Tree

```
ShipmentDashboard (Main Component)
├── Header Section
│   ├── Title & Description
│   └── Action Buttons (Track, Create, Refresh)
├── Stats Grid
│   ├── StatCard (x6)
│   │   ├── Title
│   │   ├── Value
│   │   ├── Unit
│   │   └── Icon
│   └── (Total, In Transit, Delivered, Delayed, On-Time%, Avg Days)
├── Quick Actions Bar
│   ├── Search Input
│   ├── Quick Action Buttons
│   │   ├── Bulk Tracking
│   │   ├── Performance
│   │   ├── Reports
│   │   └── Export
│   └── Icons (Package, Chart, FileText, Download)
├── Main Tabs
│   ├── Tab Navigation
│   │   ├── Incoming Orders
│   │   ├── Active Shipments
│   │   ├── Delivery Tracking
│   │   ├── Courier Agents
│   │   └── Analytics
│   └── Tab Content (5 panels)
│       ├── Incoming Orders Table
│       ├── Active Shipments Table ⭐
│       │   ├── Headers (Dark gradient)
│       │   └── Rows (With left borders)
│       │       └── Time Taken Column (Color-coded badges)
│       ├── Delivery Tracking
│       ├── Courier Agents
│       └── Analytics
└── Dialogs/Modals
    └── ShipmentDetailsDialog
```

---

## 🚀 Quick Start for Users

### Finding Time Taken Information
1. Go to **Active Shipments** tab
2. Look at the **⏱️ Time Taken** column
3. **Green badge** (✓ X days) = Delivered
4. **Amber badge** (⏱️ X days In progress) = Still in transit

### Understanding Delivery Times
- **1-2 days**: Express delivery ⚡
- **3-4 days**: Standard delivery 📦
- **5+ days**: Extended delivery ℹ️
- **In progress**: Order still being delivered 🔄

### Filtering & Searching
1. Use **Search** box to find by:
   - Shipment number
   - Tracking number
   - Customer name
2. Use **Status filter** to show only:
   - Delivered orders
   - In-transit orders
   - Specific couriers

---

## ✅ Validation Checklist

When reviewing the dashboard:
- [ ] Header displays with gradient background
- [ ] Stats cards have hover scale effect
- [ ] Time Taken column shows days (not "In progress")
- [ ] Delivered orders have green badges
- [ ] In-progress orders have amber badges
- [ ] Table header has dark gradient background
- [ ] Table rows have left borders (green/blue)
- [ ] Responsive on mobile (stacked layout)
- [ ] Tabs are clearly clickable with active state
- [ ] All buttons have hover effects
- [ ] Icons display correctly in all areas

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready ✅