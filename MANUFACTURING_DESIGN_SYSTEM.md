# Manufacturing Department - Comprehensive Design System
**Professional, Minimal Color Palette - All Pages Unified**

---

## 📐 Design System Overview

This document provides a unified design system for all 15 Manufacturing Department pages, ensuring consistency, professionalism, and excellent user experience across the entire module.

### 15 Pages Being Enhanced:
1. ✅ ProductionDashboardPage
2. ✅ ProductionOrdersPage
3. ✅ QualityControlPage
4. ✅ MaterialReceiptPage
5. ✅ OutsourceManagementPage
6. ✅ ProductionTrackingPage
7. ✅ ProductionWizardPage
8. ✅ ProductionOperationsViewPage
9. ✅ ProductionApprovalPage
10. ✅ ManufacturingReportsPage
11. ✅ ManufacturingProductionRequestsPage
12. ✅ MaterialRequirementsPage
13. ✅ MRMListPage
14. ✅ CreateMRMPage
15. ✅ StockVerificationPage

---

## 🎨 Color Palette (Minimal & Professional)

### Primary Colors
- **Slate-900**: `#0F172A` - Main text, headers
- **Slate-700**: `#334155` - Secondary text
- **Slate-100**: `#F1F5F9` - Light backgrounds
- **Slate-50**: `#F8FAFC` - Very light backgrounds

### Accent Color
- **Teal-500**: `#14B8A6` - Primary action, highlights
- **Teal-600**: `#0D9488` - Hover states
- **Teal-50**: `#F0FDFA` - Light backgrounds

### Status Colors (Semantic)
- **Green-500**: `#22C55E` - Success, completed
- **Green-600**: `#16A34A` - Success hover
- **Amber-500**: `#F59E0B` - Warning, pending
- **Amber-600**: `#D97706` - Warning hover
- **Red-500**: `#EF4444` - Error, critical
- **Red-600**: `#DC2626` - Error hover
- **Blue-500**: `#3B82F6` - Info, in-progress
- **Blue-600**: `#2563EB` - Info hover

### Neutral Grays
- **Gray-100**: `#F3F4F6` - Borders, dividers
- **Gray-200**: `#E5E7EB` - Subtle borders
- **Gray-300**: `#D1D5DB` - Disabled states
- **Gray-400**: `#9CA3AF` - Placeholder text
- **Gray-500**: `#6B7280` - Secondary text
- **Gray-600**: `#4B5563` - Tertiary text
- **Gray-900**: `#111827` - Primary text

---

## 📏 Spacing & Sizing System

### Consistent Spacing
```
Spacing Scale:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
```

### Page Layout Standards
```
- Page padding: px-6 py-8 (24px horizontal, 32px vertical)
- Section margin: mb-8 (32px bottom margin)
- Card padding: p-6 (24px all sides)
- Component gap: gap-4 or gap-6 (16px or 24px)
```

### Typography
```
Page Title: text-3xl font-bold text-slate-900
Section Title: text-2xl font-bold text-slate-900
Card Title: text-lg font-semibold text-slate-900
Label: text-sm font-medium text-slate-700
Helper Text: text-xs text-slate-500
```

---

## 🎯 Component Styles

### Page Header
```jsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-slate-900">Page Title</h1>
  <p className="mt-2 text-slate-600">Descriptive subtitle or breadcrumb</p>
</div>
```

### Card Component (Standard)
```jsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
  {/* Content */}
</div>
```

### Section Card (With Header)
```jsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
    <h2 className="text-lg font-semibold text-slate-900">Section Title</h2>
    <p className="mt-1 text-sm text-slate-600">Description</p>
  </header>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Primary Button
```jsx
<button className="px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium 
  hover:bg-teal-600 active:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed
  transition-colors duration-200 focus:ring-2 focus:ring-teal-400 focus:outline-none">
  Button Text
</button>
```

### Secondary Button
```jsx
<button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium 
  hover:bg-slate-200 active:bg-slate-300 disabled:bg-gray-200 disabled:cursor-not-allowed
  transition-colors duration-200 focus:ring-2 focus:ring-slate-400 focus:outline-none">
  Button Text
</button>
```

### Status Badge
```jsx
// Success
<span className="inline-block px-3 py-1 text-xs font-medium rounded-full 
  bg-green-50 text-green-700 border border-green-200">
  Completed
</span>

// Pending
<span className="inline-block px-3 py-1 text-xs font-medium rounded-full 
  bg-amber-50 text-amber-700 border border-amber-200">
  Pending
</span>

// Error
<span className="inline-block px-3 py-1 text-xs font-medium rounded-full 
  bg-red-50 text-red-700 border border-red-200">
  Failed
</span>

// Info
<span className="inline-block px-3 py-1 text-xs font-medium rounded-full 
  bg-blue-50 text-blue-700 border border-blue-200">
  In Progress
</span>
```

### Form Input
```jsx
<input type="text" 
  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg 
  placeholder-slate-400 text-slate-900 font-normal
  focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none
  disabled:bg-slate-50 disabled:cursor-not-allowed
  transition-colors duration-200" />
```

### Data Table
```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>
        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Column</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200">
      <tr className="hover:bg-slate-50 transition-colors duration-150">
        <td className="px-6 py-4 text-sm text-slate-700">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Summary Stats Card
```jsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-600">Label</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">1,234</p>
    </div>
    <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
      <TrendingUp className="w-6 h-6 text-teal-600" />
    </div>
  </div>
  <p className="mt-4 text-xs text-slate-500">Trend information</p>
</div>
```

### Filter/Search Bar
```jsx
<div className="flex gap-4 items-center mb-6">
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
    <input type="text" placeholder="Search..."
      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg 
      focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
  </div>
  <select className="px-4 py-2.5 border border-slate-300 rounded-lg 
    focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
    <option>Filter</option>
  </select>
</div>
```

### Alert/Banner
```jsx
// Info
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
  <p className="text-sm font-medium text-blue-700">Information</p>
  <p className="mt-1 text-xs text-blue-600">Details here</p>
</div>

// Success
<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
  <p className="text-sm font-medium text-green-700">Success</p>
  <p className="mt-1 text-xs text-green-600">Details here</p>
</div>

// Warning
<div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
  <p className="text-sm font-medium text-amber-700">Warning</p>
  <p className="mt-1 text-xs text-amber-600">Details here</p>
</div>

// Error
<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
  <p className="text-sm font-medium text-red-700">Error</p>
  <p className="mt-1 text-xs text-red-600">Details here</p>
</div>
```

---

## 🎬 Animations & Transitions

### Standard Transitions
```css
/* For interactive elements */
transition-all duration-200

/* For color changes */
transition-colors duration-200

/* For shadow changes */
transition-shadow duration-300

/* For complex animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Applied with */
animate-fadeInUp
```

### Hover States
- Cards: shadow-sm → shadow-md
- Buttons: bg-color → darker shade
- Links: text-slate-600 → text-teal-600

---

## 📱 Responsive Breakpoints

```
Mobile:    < 640px   (Full width, single column)
Tablet:   640-1024px (2-3 columns, adjusted spacing)
Desktop:  > 1024px   (4+ columns, full spacing)
```

### Responsive Utilities Used
```
- sm:  640px
- md:  768px
- lg:  1024px
- xl:  1280px
- 2xl: 1536px
```

---

## 🚀 Implementation Steps

### Phase 1: Core Components (Week 1)
1. ✅ Update all page headers with consistent sizing (text-3xl font-bold)
2. ✅ Standardize all cards (rounded-xl, border-slate-200, shadow-sm)
3. ✅ Update all buttons (teal-500 accent, consistent padding)
4. ✅ Standardize form inputs and select elements

### Phase 2: Data Display (Week 1-2)
1. ✅ Update all data tables with consistent styling
2. ✅ Standardize all status badges (green/amber/red/blue)
3. ✅ Create consistent summary stats cards
4. ✅ Update all filters and search bars

### Phase 3: Page-Specific (Week 2)
1. ✅ ProductionDashboardPage - Dashboard cards, tabs
2. ✅ ProductionOrdersPage - Table, action menu
3. ✅ QualityControlPage - Cards, badges
4. ✅ MaterialReceiptPage - Form styling
5. ✅ OutsourceManagementPage - Already good, minor tweaks
6. ✅ ManufacturingReportsPage - Charts, metrics
7. ✅ ProductionOperationsViewPage - Sidebar, stages
8. ✅ ProductionApprovalPage - Forms, workflow
9. ✅ ManufacturingProductionRequestsPage - Table, cards
10. ✅ MaterialRequirementsPage - Forms, table
11. ✅ MRMListPage - Table, actions
12. ✅ CreateMRMPage - Multi-step form
13. ✅ StockVerificationPage - Verification items
14. ✅ ProductionTrackingPage - Already enhanced, consistency check

---

## 📋 Page Enhancement Checklist

For each page, verify:
- [ ] Page header uses text-3xl font-bold text-slate-900
- [ ] All cards use rounded-xl border-slate-200 shadow-sm
- [ ] All primary buttons use bg-teal-500 hover:bg-teal-600
- [ ] All secondary buttons use bg-slate-100 text-slate-700
- [ ] All status badges use appropriate color scheme
- [ ] All form inputs have consistent styling
- [ ] All tables use slate-50 headers, divide-y borders
- [ ] All spacing is consistent (gap-4, gap-6, p-6)
- [ ] All text uses proper color hierarchy
- [ ] Responsive design is properly applied

---

## 🎨 Naming Conventions

Use these consistent names across all pages:

**Classes (Tailwind)**:
- `page-header` - Main page title section
- `page-content` - Main content wrapper
- `section-card` - Card with header and content
- `stats-grid` - Grid of stat cards
- `action-menu` - Action dropdown menu
- `filter-bar` - Search and filter controls
- `data-table` - Standard data table
- `empty-state` - Empty state message
- `loading-state` - Loading skeleton/spinner
- `error-banner` - Error message banner

**Variables (Colors)**:
```javascript
const colors = {
  primary: 'teal-500',
  primaryHover: 'teal-600',
  secondary: 'slate-100',
  success: 'green-500',
  warning: 'amber-500',
  error: 'red-500',
  info: 'blue-500',
  border: 'slate-200',
  background: 'slate-50',
  text: 'slate-900',
  textSecondary: 'slate-600',
  textTertiary: 'slate-500'
}
```

---

## ✨ Benefits of This System

✅ **Consistency** - All pages follow same design patterns
✅ **Professionalism** - Minimal, modern, cohesive look
✅ **Accessibility** - Proper color contrast, focus states
✅ **Performance** - CSS-only changes, zero JS overhead
✅ **Maintainability** - Easy to update globally via Tailwind
✅ **Scalability** - Simple to extend for new pages
✅ **Responsiveness** - Mobile-first approach throughout
✅ **User Experience** - Better visual hierarchy and clarity

---

## 📞 Support & Maintenance

For questions about the design system:
1. Check this document first
2. Review component examples above
3. Look at implemented pages as reference
4. Use Tailwind CSS documentation: https://tailwindcss.com/

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready for Implementation