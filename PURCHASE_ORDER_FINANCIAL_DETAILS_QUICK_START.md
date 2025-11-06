# Purchase Order Financial Details - Quick Start Guide

## 🎯 What Changed?

The Financial Details section now has **3 color-coded panels** instead of simple text inputs:

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Payment Terms (BLUE) - Select ONE option                    │
├─────────────────────────────────────────────────────────────────┤
│  ○ 100% Advance Payment                                         │
│  ○ 50% Advance • 50% Before Delivery                           │
│  ○ 30% Advance • 70% After QC Approval                         │
│  ○ Net 30 Days (Credit After Delivery)                         │
│  ○ Other [Enter custom terms _______________]                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📝 Special Instructions (PURPLE) - Check if applicable          │
├─────────────────────────────────────────────────────────────────┤
│  ☐ Urgent order — prioritize production and delivery           │
│  ☐ Separate packaging required per item                        │
│  ☐ Add customer branding / labeling                            │
│  ☐ Requires quality inspection before dispatch                 │
│                                                                 │
│  Additional Notes (optional, or required if no checkbox checked)│
│  ┌───────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ✓ Terms & Conditions (GREEN) - CHECK ALL 6 TO PROCEED          │
├─────────────────────────────────────────────────────────────────┤
│  ☑ I confirm the product specifications and quantities         │
│  ☑ I accept the delivery timeline and schedule                 │
│  ☑ I agree to the selected payment terms                       │
│  ☑ I understand cancellations may incur charges                │
│  ☑ I agree warranty covers manufacturing defects only          │
│  ☑ I accept the return/refund policy                           │
│                                                                 │
│  Optional Notes                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Validation Rules

### Payment Terms

- **Required:** Must select ONE option
- **If "Other":** Must fill the custom text field
- **Error:** ⚠️ "Select a payment term." or "Enter custom payment terms (required)"

### Special Instructions

- **Required:** At least ONE of:
  - 1+ checkbox selected, OR
  - Additional notes filled
- **Error:** ⚠️ "Select at least one instruction or add a note."

### Terms & Conditions

- **Required:** ALL 6 checkboxes must be checked
- **Error:** ⚠️ "You must accept all terms to proceed."

---

## 🚀 Quick Workflow

### Step 1: Select Payment Terms

```
Click radio button → Select your payment term
                 ↓
           [Optional] If you selected "Other"
                 ↓
        Fill custom payment term text field
                 ↓
              Error clears ✓
```

### Step 2: Check Special Instructions

```
Check boxes for applicable instructions
          ↓
   (Or fill Additional Notes if none apply)
          ↓
       Error clears ✓
```

### Step 3: Accept Terms & Conditions

```
Check ALL 6 T&C boxes
       ↓
   Can't proceed unless ALL checked
       ↓
    Error shows count: "Accept remaining X terms"
       ↓
   Once all checked → Error clears ✓
```

### Step 4: Submit

```
All 3 sections valid?
       ↓
      YES → PO Created ✓
       ↓
       NO → See error messages, fix, try again
```

---

## 🎨 Color Guide

| Section                     | Color     | Meaning                         |
| --------------------------- | --------- | ------------------------------- |
| **📋 Payment Terms**        | 🔵 BLUE   | Primary financial choice        |
| **📝 Special Instructions** | 🟣 PURPLE | Custom handling requirements    |
| **✓ Terms & Conditions**    | 🟢 GREEN  | Legal acceptance (all required) |

---

## 📚 Common Scenarios

### Scenario 1: Standard Order

```
1. Click "50% Advance • 50% Before Delivery"
2. Check "Requires quality inspection before dispatch"
3. Check ALL 6 Terms & Conditions boxes
4. Click Submit ✓
```

### Scenario 2: Rush Order

```
1. Click "100% Advance Payment"
2. Check "Urgent order — prioritize production and delivery"
3. Check ALL 6 Terms & Conditions boxes
4. Click Submit ✓
```

### Scenario 3: Custom Terms

```
1. Click "Other"
2. Type: "50% now, 50% 15 days after delivery"
3. Check "Separate packaging required per item"
4. Check ALL 6 Terms & Conditions boxes
5. Click Submit ✓
```

### Scenario 4: Special Handling with Notes

```
1. Click "Net 30 Days (Credit After Delivery)"
2. DON'T check any special instructions boxes
3. Type in Additional Notes: "Customer wants items marked with lot numbers"
4. Check ALL 6 Terms & Conditions boxes
5. Click Submit ✓
```

---

## ⚡ Error Prevention

### ❌ This WON'T work:

```
Payment Terms: NOT selected
Special Instructions: NO checkboxes, NO notes
T&C: Only 5/6 checked

Result: 3 error messages shown
Action: Fix all 3 sections and retry
```

### ✅ This WILL work:

```
Payment Terms: "100% Advance Payment" selected
Special Instructions: 1 checkbox checked
T&C: ALL 6 checked

Result: PO created successfully ✓
```

---

## 🔄 Editing Existing PO

When you edit a saved PO:

```
1. All previous selections LOAD automatically
2. Payment term radio button is checked
3. Special instruction checkboxes are checked
4. All 6 T&C checkboxes are checked
5. Can modify any section
6. Same validation applies on save
```

---

## 💡 Pro Tips

1. **Fill T&C Last:** Leave T&C section for last, then check all 6 boxes at once
2. **Use Notes Wisely:** If multiple special instructions apply, consider adding details in Additional Notes too
3. **Payment Term Clarity:** For custom payment terms, be specific (e.g., "50% on order, 50% on delivery")
4. **Copy Previous:** Similar orders? Create, then edit to modify payment terms/instructions

---

## 🆘 Troubleshooting

| Problem                                 | Solution                                         |
| --------------------------------------- | ------------------------------------------------ |
| "Select a payment term" error           | Click one of the radio buttons                   |
| Custom text field not appearing         | Make sure you clicked "Other" radio button       |
| "Select at least one instruction" error | Either check a box OR type in Additional Notes   |
| Can't submit order                      | Check all 6 T&C boxes - they ALL must be checked |
| Old data not loading on edit            | Check console for errors - should auto-load      |

---

## 📋 Checklist Before Submitting

- [ ] Payment term selected (or custom text filled if "Other")
- [ ] Special instructions: 1+ checked OR additional notes filled
- [ ] ALL 6 Terms & Conditions boxes checked
- [ ] Ready to click Submit!

---

**Status:** ✅ Ready to use  
**Questions?** Check error messages - they tell you exactly what's missing!
