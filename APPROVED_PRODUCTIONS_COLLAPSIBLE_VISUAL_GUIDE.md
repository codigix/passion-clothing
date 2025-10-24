# 🎨 Approved Productions Collapsible - Visual Guide

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION ORDERS PAGE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Navigation]  [Breadcrumbs]                    [Create Order Button]   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ✓ Approved Productions Ready to Start    [3] Ready ▼             │ │ ← Collapsible
│  │   3 projects with 5 approvals                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                      ↓ (Click to expand)                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  [Summary Stats Cards: Total | Pending | In Progress | Completed | ...]│
├─────────────────────────────────────────────────────────────────────────┤
│  [Search] [Filter] [Columns]                                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Existing Production Orders Table/Cards                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Order# | Product | Qty | Status | Priority | Actions...        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Collapsed State (Default)

### Full Page View
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Production Orders Page                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ ✓ Approved Productions Ready to Start    [3] Ready ▼             │  │ ← Height: 80px
│ │   3 projects with 5 approvals                                      │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ [Stats Cards]                                                            │
│ [Production Orders Table - Immediately Visible]                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Header Detail
```
┌──────────────────────────────────────────────────────────────────┐
│ ✓ Approved Productions Ready to Start    [3] Ready ▼           │
│   3 projects with 5 approvals                                    │
└──────────────────────────────────────────────────────────────────┘

Elements:
├─ Green Background (from-green-50 to-emerald-50)
├─ Green Icon (✓ CheckCircle)
├─ Title Text (lg font bold)
├─ Subtitle (sm gray text)
├─ Counter Badge (green with white text)
└─ Chevron Icon (pointing down, rotatable)
```

---

## 📂 Expanded State

### Full Page View
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Production Orders Page                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ ✓ Approved Productions Ready to Start    [3] Ready ▲             │  │ ← Chevron rotated
│ │   3 projects with 5 approvals                                      │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ ┌──────────────────────────────────────────────────────────────┐  │  │
│ │ │ Project A (SO-001)                  [Start Production]      │  │  │ ← Project Card
│ │ │ 👤 Customer: Acme Corp                                      │  │  │
│ │ ├──────────────────────────────────────────────────────────────┤  │  │
│ │ │ #1 APP-001  ✓ Approved                           [View]    │  │  │
│ │ │    By John Smith • 1/15/2025                                 │  │  │
│ │ │ #2 APP-002  ✓ Approved                           [View]    │  │  │
│ │ │    By Jane Doe • 1/16/2025                                   │  │  │
│ │ ├──────────────────────────────────────────────────────────────┤  │  │
│ │ │ 📦 Materials (3 total):                                     │  │  │
│ │ │   • Fabric Cotton (100 meters)                              │  │  │
│ │ │   • Thread Black (50 spools)                                │  │  │
│ │ │   +1 more materials                                          │  │  │
│ │ └──────────────────────────────────────────────────────────────┘  │  │
│ │                                                                     │  │
│ │ ┌──────────────────────────────────────────────────────────────┐  │  │
│ │ │ Project B (SO-002)                  [Start Production]      │  │  │
│ │ │ 👤 Customer: Tech Solutions                                 │  │  │
│ │ ├──────────────────────────────────────────────────────────────┤  │  │
│ │ │ #1 APP-003  ✓ Approved                           [View]    │  │  │
│ │ │    By Mike Johnson • 1/17/2025                              │  │  │
│ │ ├──────────────────────────────────────────────────────────────┤  │  │
│ │ │ 📦 Materials (2 total):                                     │  │  │
│ │ │   • Fabric Polyester (150 meters)                           │  │  │
│ │ │   • Dye Batch-01 (10 kg)                                    │  │  │
│ │ └──────────────────────────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ [Stats Cards]                                                            │
│ [Production Orders Table]                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Header Detail (Expanded)
```
┌──────────────────────────────────────────────────────────────────┐
│ ✓ Approved Productions Ready to Start    [3] Ready ▲           │ ← Chevron UP
│   3 projects with 5 approvals                                    │
└──────────────────────────────────────────────────────────────────┘

Changes:
├─ Border color: green-300 (slightly darker)
├─ Shadow: hover effect applied
└─ Chevron: rotated 180° (pointing up)
```

---

## 🎨 Color Scheme & Styling

### Header (Collapsed/Expanded)
```
Background:  Gradient green-50 → emerald-50
Text Color:  slate-900 (dark gray)
Subtitle:    slate-600 (medium gray)
Border:      green-200 → green-300 (on hover)
Icon:        green-600 (dark green)
Badge Bg:    green-500 (bright green)
Badge Text:  white
Shadow:      sm → md (on hover)
```

### Project Card Header
```
Background:  Gradient blue-500 → blue-600 (vibrant blue)
Text Color:  white
Project Tag: white bg, blue-600 text
SO Tag:      white bg, blue-600 text
Approvals:   blue-100 bg, blue-800 text
Customer:    blue-100 text
Button:      white bg, blue-600 text, hover blue-50
```

### Approval Item
```
Background:  white
Border:      gray-100 → blue-200 (on hover)
Index:       gray-500 text, smaller
ID:          gray-900 text, semibold
Badge:       green-100 bg, green-700 text
Details:     gray-500 text, smaller
View Btn:    blue-100 bg, blue-700 text, hover blue-200
```

### Materials Section
```
Background:  Gradient gray-50 → white
Title:       gray-700 text, uppercase, tracking-wide
Icon:        📦 emoji
Materials:   gray-600 text
Bullets:     green-500 (bright green)
"More" Link: blue-600 text, semibold
```

---

## 📐 Typography Hierarchy

### Size Scale
```
Heading:     lg (text-lg) = 18px bold     [Title]
Subhead:     base (text-base) = 16px      [Project Name]
Body:        sm (text-sm) = 14px          [Subtitle, labels]
Detail:      xs (text-xs) = 12px          [Metadata, timestamps]
```

### Font Weights
```
Bold:        font-bold (700) = Titles, main text
Semibold:    font-semibold (600) = Important info, IDs
Medium:      font-medium (500) = Labels, badges
Normal:      (400) = Body text, descriptions
```

### Line Heights
```
Titles:      Tight (mb-1)
Subtitles:   Normal (mt-0.5)
Details:     Comfortable (mt-1 or mt-2)
Lists:       Compact (space-y-1)
```

---

## 🎯 Icon Usage

### Main Icons
```
✓ (FaCheckCircle)     → Header icon (green, lg)
▼ (FaChevronDown)     → Toggle arrow (rotates 180°)
👤 (Customer)         → Customer emoji
📦 (Materials)        → Package emoji
▶ (FaPlay)            → Start button icon
👁 (FaEye)            → View button icon
```

### Icon Styling
```
Header Icon:    w-10 h-10, rounded-lg, bg-green-500, text-white
Chevron:        text-xl, green-600, rotate-180 on expand
Approval Badge: text-xs, inline-flex with text
Button Icons:   text-sm, inline with text
```

---

## 🔄 Animation States

### Collapse/Expand Animation
```
Duration:      300ms (smooth, not too fast)
Easing:        ease-out (default)
Effects:
  1. Chevron rotates 180° ✓
  2. Content fades in/out (opacity 0 → 100)
  3. Max-height transitions (0 → 5000px)
  4. Border color shifts (green-200 → green-300)
```

### Hover Effects
```
Header:
  - Border: green-200 → green-300
  - Shadow: sm → md
  - Background: slight shine effect

Cards:
  - Border: gray-200 → green-400
  - Shadow: sm → md
  - Slight lift effect

Buttons:
  - Color fade in 150-200ms
  - Shadow increase
  - Slight scale change (optional)
```

### Transitions Classes
```
Transition Properties:  transition-all
Duration:               duration-300
Timing:                 ease-out (implicit)
CSS Selector:           hover:shadow-md, hover:border-color
```

---

## 📱 Responsive Breakpoints

### Mobile (320px - 640px)
```
┌──────────────────────────┐
│ ✓ Approved Productions  │
│   Ready to Start    ▼   │ ← Fits in 320px width
│ 3 projects, 5 approvals  │
└──────────────────────────┘

┌──────────────────────────┐
│ Project A (SO-001) [BP]  │ ← Button below on mobile
│ 👤 Acme Corp             │
├──────────────────────────┤
│ #1 APP-001 ✓ [View]     │ ← Stacked layout
│ #2 APP-002 ✓ [View]     │
├──────────────────────────┤
│ 📦 Materials (3):        │
│ • Fabric (100m)          │
│ • Thread (50)            │
│ +1 more                  │
└──────────────────────────┘
```

### Tablet (641px - 1024px)
```
┌────────────────────────────────────────┐
│ ✓ Approved Productions  [3] Ready ▼  │ ← Button right
│   3 projects, 5 approvals              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Project A (SO-001) ✓ [Start Prod]     │ ← Better spacing
│ 👤 Acme Corp                           │
├────────────────────────────────────────┤
│ #1 APP-001 ✓ Approved      By John   │ ← 2-col friendly
│ #2 APP-002 ✓ Approved      By Jane   │
├────────────────────────────────────────┤
│ 📦 Materials (3):                      │
│ • Fabric (100m)  • Thread (50)        │
│ +1 more                                │
└────────────────────────────────────────┘
```

### Desktop (1025px+)
```
┌─────────────────────────────────────────────────────────┐
│ ✓ Approved Productions Ready to Start  [3] Ready ▼    │ ← Full
│   3 projects with 5 approvals                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Project A (SO-001) Customer: Acme Corp [Start Prod]   │ ← Optimal
├─────────────────────────────────────────────────────────┤
│ #1 APP-001 ✓ Approved           By John • 1/15/2025   │
│ #2 APP-002 ✓ Approved           By Jane • 1/16/2025   │
├─────────────────────────────────────────────────────────┤
│ 📦 Materials (3 total):                                 │
│ • Fabric Cotton (100 meters)  • Thread Black (50)      │
│ • Dye Batch-01 (10 kg)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🖱️ User Interaction Flow

### Click Interaction
```
User sees:  Green header with chevron pointing down (▼)
            Text: "Approved Productions Ready to Start"
            
User clicks: Anywhere on the header

Animation:  ┌─ Chevron rotates 180° → points up (▲)
            ├─ Content fades in (300ms)
            ├─ Max-height expands
            └─ Border color brightens

Result:     All project cards visible
            Full approval and material details shown
            "Start Production" buttons ready to click
            "View" buttons ready to click

Next:       User clicks "Start Production" or "View"
```

### Collapse Interaction
```
User sees:  Header with chevron pointing up (▲)
            Expanded project cards below
            
User clicks: Anywhere on the header again

Animation:  ┌─ Chevron rotates 180° → points down (▼)
            ├─ Content fades out (300ms)
            ├─ Max-height collapses
            └─ Border color dims

Result:     Header remains (80px)
            All content hidden
            Production Orders section now prominent
```

---

## 📊 Layout Grid

### Header Grid
```
┌─────────────────────────────────────────────────────┐
│ Icon │ Title + Subtitle        │ Badge │ Chevron   │
│ 10h  │ flex-1                  │  80px │   20px    │
└─────────────────────────────────────────────────────┘
     ↓
Divided with gap-4 (16px)
```

### Project Card Grid
```
┌─────────────────────────────────────────────────────┐
│ Project Name │ SO Tag │ Approval Count │ Button    │
│ Customer     │        │                │           │
└─────────────────────────────────────────────────────┘
  flex-1            auto    auto            auto
  min-w-0        whitespace-nowrap       whitespace-nowrap
```

### Approval Item Grid
```
┌─────────────────────────────────────────────────────┐
│ # │ ID │ Status Badge │ Approver Info │ View Btn  │
└─────────────────────────────────────────────────────┘
 12px  auto   auto         auto            auto
```

---

## ✨ Visual Polish Details

### Spacing Scale
```
Extra Small:  0.5   (p-0.5 = 2px)
Small:        1     (p-1 = 4px)
Medium:       2-3   (p-2/3 = 8/12px)
Large:        4-5   (p-4/5 = 16/20px)
Extra Large:  6+    (p-6 = 24px+)
```

### Border Radius
```
Cards:        rounded-xl (12px)
Small items:  rounded-lg (8px)
Tiny items:   rounded (4px)
Full circle:  rounded-full (50%)
```

### Shadows
```
Subtle:       shadow-sm (light)
Default:      shadow (medium)
Elevated:     shadow-md (prominent)
Hover:        shadow-md or shadow-lg
```

### Transitions
```
Quick:        duration-150 (fast interactions)
Standard:     duration-300 (main animations)
Slow:         duration-500 (special effects)
Easing:       ease-out (default, feels natural)
```

---

## 🎯 State Indicators

### Visual Feedback
```
Approved:  ✓ Green icon + green badge
Ready:     Bright green badge with count
Collapsed: ▼ Chevron pointing down
Expanded:  ▲ Chevron pointing up
Hover:     Brighter border, increased shadow
Active:    Text color darker, icons more prominent
```

### Badge Indicators
```
Status Badges:    ✓ Approved (green)
                  Count Ready (green)
Project Ref:      Blue tags (SO number)
Approval Count:   Blue badge
Customer:         Plain text with icon
Material Count:   "(X total)" in gray
```

---

## 🔍 Inspection Guide

### CSS Classes Used
```
Grid/Layout:      flex, grid, flex-col, flex-1, min-w-0
Spacing:          p-*, m-*, gap-*, px-*, py-*
Colors:           text-*, bg-*, border-*
Sizing:           w-*, h-*
Typography:       text-*, font-*
Borders:          border-*, rounded-*
Shadows:          shadow-*, shadow-sm, shadow-md
Effects:          hover:*, transition-*, duration-*
Responsive:       sm:, md:, lg:
```

### Tailwind Utilities
```
Flexbox:          flex, items-center, justify-between
Wrapping:         flex-wrap, flex-1, min-w-0
Responsive:       grid grid-cols-2 md:grid-cols-3
Animations:       animate-fadeIn (custom)
Opacity:          opacity-0, opacity-100
Transforms:       rotate-180, scale-*
```

---

## 📐 Measurement Reference

### Common Sizes
```
Icon:              w-10 h-10, w-4 h-4, w-3 h-3
Button:            px-4 py-2, px-3 py-1.5
Card Padding:      p-6, p-5, p-3
Gap Between Items: gap-4, gap-3, gap-2, gap-1
Border:            border, border-2, border-b
Radius:            rounded-xl (12px), rounded-lg (8px)
```

### Responsive Scaling
```
Mobile (320px):    Single column, full width
Tablet (768px):    2-column where possible
Desktop (1024px):  Full layout, optimal spacing
Wide (1280px):     Extra spacing added
```

---

**This visual guide provides complete reference for the collapsible design!**