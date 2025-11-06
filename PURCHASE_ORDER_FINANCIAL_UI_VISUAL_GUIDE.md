# Purchase Order Financial Details - Visual UI Guide

## Step 3: Financial Details - Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Purchase Order                                                 [X]│
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ Step Indicator:  ① Basic  →  ② Items  →  ③ Financial Details [CURRENT]│
│                                                                         │
│ ═════════════════════════════════════════════════════════════════════  │
│                                                                         │
│ 📋 PAYMENT TERMS                                              * (required)
│ ┌─────────────────────────────────────────────────────────────────────┐
│ │ ○ 100% Advance Payment                                              │
│ │ ○ 50% Advance • 50% Before Delivery                                │
│ │ ○ 30% Advance • 70% After QC Approval                              │
│ │ ○ Net 30 Days (Credit After Delivery)                              │
│ │ ○ Other                                                              │
│ └─────────────────────────────────────────────────────────────────────┘
│
│ [If "Other" selected, additional field appears:]
│ ┌─────────────────────────────────────────────────────────────────────┐
│ │ [_________________________________] ← Enter custom payment terms   │
│ └─────────────────────────────────────────────────────────────────────┘
│
│ ⚠️ Select a payment term.  [Error appears if validation fails]
│ ═════════════════════════════════════════════════════════════════════
│
│ 📝 SPECIAL INSTRUCTIONS                                     * (required)
│ ┌─────────────────────────────────────────────────────────────────────┐
│ │ ☐ Urgent order — prioritize production and delivery                 │
│ │ ☐ Separate packaging required per item                              │
│ │ ☐ Add customer branding / labeling                                  │
│ │ ☐ Requires quality inspection before dispatch                       │
│ │                                                                     │
│ │ Additional Notes  (optional, but required if no instruction selected)│
│ │ ┌──────────────────────────────────────────────────────────────┐   │
│ │ │ e.g., special packing, labeling, priority handling...      │   │
│ │ │                                                              │   │
│ │ │                                                              │   │
│ │ └──────────────────────────────────────────────────────────────┘   │
│ └─────────────────────────────────────────────────────────────────────┘
│
│ ⚠️ Select at least one instruction or add a note.  [Error if validation fails]
│ ═════════════════════════════════════════════════════════════════════
│
│ ✓ TERMS & CONDITIONS                                  * All required
│ ┌─────────────────────────────────────────────────────────────────────┐
│ │ ☐ I confirm the product specifications and quantities are correct.  │
│ │ ☐ I accept the delivery timeline and schedule.                      │
│ │ ☐ I agree to the selected payment terms.                            │
│ │ ☐ I understand that cancellations after production may incur        │
│ │   charges.                                                          │
│ │ ☐ I agree that warranty covers only manufacturing defects.          │
│ │ ☐ I accept the return/refund policy.                                │
│ │                                                                     │
│ │ Optional Notes                                                       │
│ │ ┌──────────────────────────────────────────────────────────────┐   │
│ │ │ Optional notes about terms...                              │   │
│ │ │                                                              │   │
│ │ └──────────────────────────────────────────────────────────────┘   │
│ └─────────────────────────────────────────────────────────────────────┘
│
│ ⚠️ You must accept all terms to proceed.  [Error if any unchecked]
│ ═════════════════════════════════════════════════════════════════════
│
│ 📦 DELIVERY & INTERNAL NOTES
│ ┌──────────────────────────────────────┬──────────────────────────┐
│ │ Delivery Address                     │ Internal Notes           │
│ │ [_____________________________]       │ ┌────────────────────────┐
│ │                                      │ │ Internal notes (not     │
│ │                                      │ │ visible to vendor)      │
│ │                                      │ │                         │
│ │                                      │ │                         │
│ │                                      │ └────────────────────────┘
│ └──────────────────────────────────────┴──────────────────────────┘
│
│ ═════════════════════════════════════════════════════════════════════
│
│ 💰 COST SUMMARY
│ ┌─────────────────────────────────────────────────────────────────────┐
│ │ Discount %    [____]    Tax %    [__]    Freight (₹)    [______]   │
│ └─────────────────────────────────────────────────────────────────────┘
│
│ ───────────────────────────────────────────────────────────────────────
│
│ 📊 FINAL COST SUMMARY
│ ┌─────────────────────────────────────────────────────────────────────┐
│ │ Subtotal:                                    ₹ 10,000.00           │
│ │ Discount (10%):                             -₹  1,000.00           │
│ │ After Discount:                              ₹  9,000.00           │
│ │ Tax (12%):                                   ₹  1,080.00           │
│ │ Freight:                                     ₹    500.00           │
│ │ ─────────────────────────────────────────────────────────────    │
│ │ Grand Total:                                 ₹ 10,580.00           │
│ └─────────────────────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────────────────┘

┌─ MODAL FOOTER ──────────────────────────────────────────────────────────┐
│                                                                          │
│  [← Back]                      [Cancel]  [✓ Create PO & Send for Approval] │
│                                          Note: PO will be automatically      │
│                                          sent to admin for approval          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Color Coding Breakdown

### Section 1: Payment Terms (BLUE)

```
┌─────────────────────────────────────────────┐
│ 🔵 Payment Terms Section  (Blue: #EFF6FF)   │  ← bg-blue-50
│ ├─ Border: Blue (#BFDBFE)                   │  ← border-blue-200
│ ├─ Radio buttons: Blue accent               │  ← text-blue-600
│ ├─ Focus ring: Blue highlight               │  ← focus:ring-blue-500
│ └─ Hover: Light blue                        │  ← hover:bg-blue-100
└─────────────────────────────────────────────┘
```

### Section 2: Special Instructions (PURPLE)

```
┌─────────────────────────────────────────────┐
│ 🟣 Special Instructions Section             │
│ ├─ Background: Purple (#F3E8FF)             │  ← bg-purple-50
│ ├─ Border: Purple (#E9D5FF)                 │  ← border-purple-200
│ ├─ Checkboxes: Purple accent                │  ← text-purple-600
│ ├─ Focus ring: Purple highlight             │  ← focus:ring-purple-500
│ └─ Hover: Light purple                      │  ← hover:bg-purple-100
└─────────────────────────────────────────────┘
```

### Section 3: Terms & Conditions (GREEN)

```
┌─────────────────────────────────────────────┐
│ 🟢 Terms & Conditions Section               │
│ ├─ Background: Green (#F0FDF4)              │  ← bg-green-50
│ ├─ Border: Green (#DCFCE7)                  │  ← border-green-200
│ ├─ Checkboxes: Green accent                 │  ← text-green-600
│ ├─ Focus ring: Green highlight              │  ← focus:ring-green-500
│ └─ Hover: Light green                       │  ← hover:bg-green-100
└─────────────────────────────────────────────┘
```

### Supporting Sections (GRAY)

```
┌─────────────────────────────────────────────┐
│ ⚪ Delivery & Internal Notes                 │
│ ├─ Background: Light gray (#F9FAFB)         │  ← bg-gray-50
│ ├─ Border: Gray (#E5E7EB)                   │  ← border-gray-200
│ └─ Inputs: Standard blue focus               │  ← focus:ring-blue-500
└─────────────────────────────────────────────┘

Cost Summary (WHITE)
├─ Background: White (#FFFFFF)
└─ Border: Green (#DCFCE7)

Final Cost Summary (GRADIENT)
├─ Background: Blue→Indigo (#DBEAFE→C7D2FE)
└─ Border: Blue (#BFDBFE)
```

---

## Interactive States

### Radio Button States

#### Option Not Selected

```
○ 100% Advance Payment
└─ Circle outline, gray text, hoverable
```

#### Option Selected (Active)

```
◉ 50% Advance • 50% Before Delivery
└─ Filled circle, blue radio button, blue accent
```

#### On Hover (Not Selected)

```
○ 30% Advance • 70% After QC Approval
└─ Light blue background highlight
```

#### On Hover (Selected)

```
◉ Net 30 Days (Credit After Delivery)
└─ Light blue background, remains blue
```

### Checkbox States

#### Unchecked

```
☐ Urgent order — prioritize production and delivery
└─ Empty box, gray, hoverable
```

#### Checked

```
☑ Separate packaging required per item
└─ Filled checkbox with checkmark, purple/green/blue
```

#### On Hover

```
☐ Add customer branding / labeling
└─ Light background highlight (color-appropriate)
```

#### Focused (Keyboard)

```
☑ Requires quality inspection before dispatch
└─ Box outline + background highlight
```

### Validation Error States

```
⚠️ Red Text: "Select a payment term."
│
├─ Font: 12px, bold, red (#DC2626)
├─ Icon: ⚠️ emoji before text
├─ Position: Below the section
└─ Clearance: Clears on field change

Alternative:
⚠️ "Select at least one instruction or add a note."
⚠️ "You must accept all terms to proceed."
```

---

## Responsive Behavior

### Desktop (1024px+)

```
┌────────────────────────────┐
│  Full width sections       │
│  Two-column layouts work   │
│  ample spacing             │
└────────────────────────────┘
```

### Tablet (768px - 1023px)

```
┌──────────────────┐
│  Sections stack  │
│  slightly        │
│  narrower        │
└──────────────────┘
```

### Mobile (< 768px)

```
┌──────┐
│ Full │
│width │
│      │
│stack │
└──────┘
```

---

## Accessibility Features

### Keyboard Navigation

```
Tab    → Move to next input
Shift+Tab → Move to previous input
Space/Enter → Toggle checkbox
Space/Enter → Select radio button
```

### Screen Reader Text

```
<label>
  <input type="radio" ... />
  "100% Advance Payment"
</label>

Announces: "100% Advance Payment, radio button, not checked"
           or "100% Advance Payment, radio button, checked"
```

### Focus Indicators

```
Input on Focus:
├─ Blue outline ring
├─ 2px solid border
├─ Distinct from hover state
└─ Always visible
```

---

## User Journey with Validation

### Valid Submission Path

```
User opens form
    ↓
Step 1: Fills basic info → Next
    ↓
Step 2: Adds items → Next
    ↓
Step 3: Financial Details
    ├─ Selects payment term ✓
    ├─ Checks 1+ special instruction OR adds notes ✓
    ├─ Checks all 6 T&C boxes ✓
    │
    └─ Clicks "Create PO & Send for Approval"
        ├─ Validates all sections
        ├─ All valid? Yes!
        └─ Submits → Success
```

### Invalid Submission Path (Missing Payment Term)

```
Step 3: Financial Details
    ├─ Payment Terms: NOT selected ✗
    ├─ Special Instructions: Checked 2 options ✓
    ├─ Terms & Conditions: Checked all 6 ✓
    │
    └─ Clicks "Create PO & Send for Approval"
        ├─ Validates all sections
        ├─ Error in Payment Terms!
        ├─ Shows: ⚠️ "Select a payment term."
        └─ Prevents submission

User selects option
    ↓
Error clears
    ↓
Clicks submit again → Success!
```

### Invalid Submission Path (Custom Payment Term Required)

```
Step 3: Financial Details
    ├─ Payment Terms: "Other" selected ✓
    ├─ But custom text field is EMPTY ✗
    ├─ Special Instructions: Checked 1 option ✓
    ├─ Terms & Conditions: Checked all 6 ✓
    │
    └─ Clicks "Create PO & Send for Approval"
        ├─ Validates all sections
        ├─ Error in Payment Terms!
        ├─ Shows: ⚠️ "Enter custom payment terms (required)"
        └─ Prevents submission

User enters custom text: "Net 15 with 2% discount"
    ↓
Error clears
    ↓
Clicks submit again → Success!
```

### Invalid Submission Path (No Special Instructions Selected)

```
Step 3: Financial Details
    ├─ Payment Terms: "Net 30 Days" selected ✓
    ├─ Special Instructions: NO checkboxes checked ✗
    ├─ Special Instructions Notes: EMPTY ✗
    ├─ Terms & Conditions: Checked all 6 ✓
    │
    └─ Clicks "Create PO & Send for Approval"
        ├─ Validates all sections
        ├─ Error in Special Instructions!
        ├─ Shows: ⚠️ "Select at least one instruction or add a note."
        └─ Prevents submission

User either:
    Option A: Checks at least 1 checkbox
              or
    Option B: Types in Additional Notes field
    ↓
Error clears
    ↓
Clicks submit again → Success!
```

### Invalid Submission Path (Terms Not Fully Accepted)

```
Step 3: Financial Details
    ├─ Payment Terms: "100% Advance" selected ✓
    ├─ Special Instructions: Checked 1 option ✓
    ├─ Terms & Conditions: Checked only 5 of 6 ✗
    │   └─ Missing: "I accept the return/refund policy."
    │
    └─ Clicks "Create PO & Send for Approval"
        ├─ Validates all sections
        ├─ Error in Terms & Conditions!
        ├─ Shows: ⚠️ "You must accept all terms to proceed."
        └─ Prevents submission

User checks the final T&C checkbox
    ↓
Error clears
    ↓
Clicks submit again → Success!
```

---

## Summary

**Total Validation Rules**: 3 primary + 2 secondary

- ✅ Payment Terms: Required (1 option must be selected)
- ✅ Payment Terms Custom: Required IF "Other" selected
- ✅ Special Instructions: Required (1 checkbox OR notes)
- ✅ Terms & Conditions: Required (ALL 6 must be checked)
- ✅ T&C Notes: Optional (never affects validation)

**Error Messages**: 4 unique messages for different scenarios
**Color Scheme**: Blue → Purple → Green progression
**Accessibility**: Full keyboard + screen reader support
**Mobile Ready**: Responsive on all screen sizes
