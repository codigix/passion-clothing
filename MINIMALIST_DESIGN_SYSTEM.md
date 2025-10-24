# Minimalist Design System - Passion ERP

## 🎨 Design Philosophy

**Less is More**: A professional, elegant interface with minimal colors, subtle borders, and clean typography.

### Core Principles
1. **Minimal Color Palette** - Primarily neutral grays with subtle accent colors
2. **Small Border Radius** - 2-4px for professional, clean look
3. **Readable Typography** - 14px minimum for body text
4. **Clean Cards** - Simple borders, no gradients or heavy shadows
5. **Subtle Interactions** - Gentle hover effects, no dramatic animations

---

## 🎨 Color Palette

### Neutral Colors (Primary)
```css
Background:     #FFFFFF (White)
Surface:        #FAFAFA (Light Gray)
Border:         #E5E7EB (Gray-200)
Border Strong:  #D1D5DB (Gray-300)
Text Primary:   #111827 (Gray-900)
Text Secondary: #6B7280 (Gray-500)
Text Muted:     #9CA3AF (Gray-400)
```

### Accent Colors (Minimal Use)
```css
Primary:        #3B82F6 (Blue-500) - Only for CTAs and links
Success:        #10B981 (Green-500) - Only for success states
Warning:        #F59E0B (Amber-500) - Only for warnings
Error:          #EF4444 (Red-500) - Only for errors
```

### Status Colors (Subtle)
```css
Draft:          #6B7280 (Gray-500)
Pending:        #F59E0B (Amber-500)
Active:         #3B82F6 (Blue-500)
Completed:      #10B981 (Green-500)
Cancelled:      #EF4444 (Red-500)
```

---

## 📐 Spacing Scale

```css
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   16px  (1rem)
lg:   24px  (1.5rem)
xl:   32px  (2rem)
2xl:  48px  (3rem)
```

---

## 🔤 Typography

### Font Sizes (Minimum 14px for body)
```css
xs:     12px  (0.75rem)  - Only for labels/captions
sm:     14px  (0.875rem) - Body text minimum
base:   16px  (1rem)     - Default body text
lg:     18px  (1.125rem) - Subheadings
xl:     20px  (1.25rem)  - Section titles
2xl:    24px  (1.5rem)   - Page titles
3xl:    30px  (1.875rem) - Dashboard titles
```

### Font Weights
```css
normal:    400
medium:    500
semibold:  600
bold:      700
```

---

## 🔲 Border Radius (Minimal)

```css
none:   0px
sm:     2px   - Badges, small elements
base:   4px   - Buttons, inputs, cards
md:     6px   - Larger cards
lg:     8px   - Modals, dialogs (max)
```

**Rule**: Never use rounded-lg (12px) or rounded-xl (16px) - too playful

---

## 🃏 Card Styles

### Standard Card
```css
Background:     #FFFFFF
Border:         1px solid #E5E7EB
Border Radius:  4px
Shadow:         none (or very subtle: 0 1px 2px rgba(0,0,0,0.05))
Padding:        16px (1rem)
```

### Hover State (Optional)
```css
Border:         1px solid #D1D5DB
Shadow:         0 1px 3px rgba(0,0,0,0.1)
Transform:      none (no lift effect)
```

---

## 🔘 Button Styles

### Primary Button
```css
Background:     #3B82F6
Text:           #FFFFFF
Border:         none
Border Radius:  4px
Padding:        8px 16px
Font Size:      14px
Font Weight:    500

Hover:
  Background:   #2563EB
```

### Secondary Button
```css
Background:     #FFFFFF
Text:           #374151
Border:         1px solid #D1D5DB
Border Radius:  4px
Padding:        8px 16px
Font Size:      14px
Font Weight:    500

Hover:
  Background:   #F9FAFB
  Border:       1px solid #9CA3AF
```

### Icon Button
```css
Background:     transparent
Text:           #6B7280
Border:         none
Border Radius:  4px
Padding:        6px
Size:           32px × 32px

Hover:
  Background:   #F3F4F6
  Text:         #111827
```

---

## 🏷️ Badge Styles (Minimal)

### Status Badge
```css
Background:     Subtle tint (e.g., #EFF6FF for blue)
Text:           Darker shade (e.g., #1E40AF for blue)
Border:         none
Border Radius:  2px (very minimal)
Padding:        4px 8px
Font Size:      12px
Font Weight:    500
```

### Examples
```css
Draft:      bg-gray-100 text-gray-700
Pending:    bg-amber-50 text-amber-700
Active:     bg-blue-50 text-blue-700
Completed:  bg-green-50 text-green-700
Cancelled:  bg-red-50 text-red-700
```

---

## 📊 Stat Card (Minimalist)

```css
Background:     #FFFFFF
Border:         1px solid #E5E7EB
Border Radius:  4px
Shadow:         none
Padding:        16px

Title:
  Font Size:    12px
  Font Weight:  600
  Color:        #6B7280
  Transform:    uppercase
  Spacing:      0.05em

Value:
  Font Size:    28px
  Font Weight:  700
  Color:        #111827
  Margin Top:   8px

Subtitle:
  Font Size:    14px
  Font Weight:  400
  Color:        #9CA3AF
  Margin Top:   4px

Icon:
  Size:         20px
  Color:        #6B7280
  Background:   #F3F4F6
  Padding:      8px
  Border Radius: 4px
```

**No colored backgrounds, no gradients, no accent lines**

---

## 📋 Table Styles

### Table Header
```css
Background:     #FAFAFA
Border Bottom:  1px solid #E5E7EB
Padding:        12px 16px
Font Size:      12px
Font Weight:    600
Color:          #6B7280
Transform:      uppercase
Letter Spacing: 0.05em
```

### Table Row
```css
Background:     #FFFFFF
Border Bottom:  1px solid #F3F4F6
Padding:        12px 16px
Font Size:      14px
Color:          #111827

Hover:
  Background:   #FAFAFA
```

### Table Cell
```css
Padding:        12px 16px
Font Size:      14px
Color:          #111827
Vertical Align: middle
```

---

## 🔍 Input Styles

### Text Input
```css
Background:     #FFFFFF
Border:         1px solid #D1D5DB
Border Radius:  4px
Padding:        8px 12px
Font Size:      14px
Color:          #111827

Focus:
  Border:       1px solid #3B82F6
  Ring:         0 0 0 3px rgba(59, 130, 246, 0.1)
  Outline:      none

Placeholder:
  Color:        #9CA3AF
```

### Select Dropdown
```css
Background:     #FFFFFF
Border:         1px solid #D1D5DB
Border Radius:  4px
Padding:        8px 12px
Font Size:      14px
Color:          #111827

Focus:
  Border:       1px solid #3B82F6
  Ring:         0 0 0 3px rgba(59, 130, 246, 0.1)
```

---

## 📱 Dashboard Layout

### Container
```css
Max Width:      1920px
Padding:        24px
Background:     #FAFAFA
```

### Section Spacing
```css
Between Sections:   24px
Between Cards:      16px
Card Padding:       16px
```

### Grid Layouts
```css
Stats Grid:     4 columns (desktop), 2 columns (tablet), 1 column (mobile)
Gap:            16px
```

---

## 🎯 Component Guidelines

### 1. Stat Cards
- ✅ White background
- ✅ 1px gray border
- ✅ 4px border radius
- ✅ No gradients
- ✅ No colored backgrounds
- ✅ Gray icon with subtle background
- ✅ No accent lines at bottom

### 2. Status Badges
- ✅ Subtle background tints
- ✅ 2px border radius (minimal)
- ✅ No icons (text only)
- ✅ 12px font size
- ✅ Medium font weight

### 3. Buttons
- ✅ 4px border radius
- ✅ Only primary button uses color
- ✅ Secondary buttons are white with border
- ✅ No shadows on buttons
- ✅ Subtle hover effects

### 4. Cards
- ✅ White background
- ✅ 1px border
- ✅ 4px border radius
- ✅ No shadows (or very subtle)
- ✅ 16px padding
- ✅ Clean, minimal design

### 5. Tables
- ✅ Light gray header background
- ✅ White row background
- ✅ Subtle borders
- ✅ 14px font size minimum
- ✅ Proper spacing (12px padding)

---

## ❌ What to Avoid

### Colors
- ❌ Gradients (from-blue-500 to-blue-600)
- ❌ Bright, saturated colors
- ❌ Multiple accent colors in one view
- ❌ Colored card backgrounds
- ❌ Rainbow status indicators

### Border Radius
- ❌ rounded-lg (12px)
- ❌ rounded-xl (16px)
- ❌ rounded-2xl (24px)
- ❌ rounded-full (except for avatars/dots)

### Typography
- ❌ Font sizes below 12px
- ❌ Body text below 14px
- ❌ Too many font weights
- ❌ Excessive uppercase text

### Effects
- ❌ Heavy shadows
- ❌ Transform animations (lift effects)
- ❌ Pulse animations
- ❌ Gradient overlays
- ❌ Colored accent lines

### Cards
- ❌ Gradient backgrounds
- ❌ Colored borders
- ❌ Heavy shadows
- ❌ Accent lines at bottom
- ❌ Hover lift effects

---

## ✅ Implementation Checklist

### Phase 1: Update Design Tokens
- [ ] Update statusConfig.js - Remove gradients, use subtle colors
- [ ] Update CompactStatCard.jsx - Remove gradients and accent lines
- [ ] Update StatusBadge.jsx - Minimal border radius, no icons
- [ ] Update PriorityBadge.jsx - Minimal styling
- [ ] Create new MinimalCard.jsx component

### Phase 2: Update Dashboards
- [ ] Sales Dashboard - Apply minimal design
- [ ] Procurement Dashboard - Apply minimal design
- [ ] Manufacturing Dashboard - Apply minimal design
- [ ] Inventory Dashboard - Apply minimal design
- [ ] Finance Dashboard - Apply minimal design
- [ ] All other dashboards

### Phase 3: Update Pages
- [ ] Order pages - Minimal tables and cards
- [ ] Order details pages - Clean layout
- [ ] Form pages - Minimal inputs
- [ ] List pages - Clean tables

### Phase 4: Global Styles
- [ ] Update index.css - Minimal button/card styles
- [ ] Update compactDashboard.css - Remove colorful styles
- [ ] Create minimal.css - New minimal utility classes

---

## 📊 Before vs After

### Stat Card
**Before:**
- Gradient background (from-blue-50 to-white)
- Colored border (border-blue-200)
- Colored icon background (bg-blue-100)
- Accent line at bottom (gradient)
- Hover lift effect

**After:**
- White background
- Gray border (1px solid #E5E7EB)
- Gray icon background (#F3F4F6)
- No accent line
- Subtle hover (border color change only)

### Status Badge
**Before:**
- bg-blue-100 text-blue-700
- rounded (6px)
- With icon
- text-xs (12px)

**After:**
- bg-blue-50 text-blue-700
- rounded-sm (2px)
- No icon
- text-xs (12px)

### Button
**Before:**
- rounded-md (6px)
- Multiple colors
- Shadow effects

**After:**
- rounded (4px)
- Minimal colors
- No shadows

---

## 🎨 Color Usage Rules

### Use Color Only For:
1. **Primary Actions** - Blue for main CTAs
2. **Status Indicators** - Subtle tints for status
3. **Alerts** - Red for errors, amber for warnings, green for success
4. **Links** - Blue for clickable text

### Use Gray For:
1. **All cards and containers**
2. **All borders**
3. **All icons (default state)**
4. **All text (primary, secondary, muted)**
5. **All backgrounds**

---

## 📏 Spacing Rules

### Card Spacing
```css
Padding:        16px (consistent)
Gap:            16px (between cards)
Section Gap:    24px (between sections)
```

### Text Spacing
```css
Title to Value:     8px
Value to Subtitle:  4px
Label to Input:     6px
```

### Layout Spacing
```css
Page Padding:       24px
Container Max:      1920px
Grid Gap:           16px
```

---

## 🎯 Success Metrics

### Visual Consistency
- ✅ All cards look identical (white, gray border, 4px radius)
- ✅ All badges use same minimal style
- ✅ All buttons use same border radius
- ✅ All text uses readable sizes (14px+)

### Color Usage
- ✅ 90% of UI is neutral (white/gray)
- ✅ 10% of UI uses accent colors (blue/green/red)
- ✅ No gradients anywhere
- ✅ No rainbow effects

### Professional Appearance
- ✅ Clean, minimal design
- ✅ Easy to scan and read
- ✅ Professional, not playful
- ✅ Elegant and sophisticated

---

**Document Version:** 1.0  
**Date:** 2024  
**Status:** ✅ Ready for Implementation  
**Design Philosophy:** Minimalist, Professional, Elegant