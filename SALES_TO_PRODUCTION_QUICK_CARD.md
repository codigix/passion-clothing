# 🎴 Sales to Production - Quick Reference Card
**Print and keep at your desk!**

---

## 📋 15 Steps to Production

| # | Department | Action | Result |
|---|------------|--------|--------|
| 1 | 👔 Sales | Create Sales Order | SO-XXXXX |
| 2 | 👔 Sales | Send to Procurement | PR auto-created |
| 3 | 🛒 Procurement | Create PO | PO-XXXXX |
| 4 | 🛒 Procurement | Send for Approval | Notification sent |
| 5 | 👨‍💼 Manager | Approve PO | ✅ Approved |
| 6 | 🚚 Vendor | Deliver Materials | Physical delivery |
| 7 | 📦 Inventory | Create GRN | GRN-XXXXX |
| 8 | 🔍 QC | Verify GRN | ✅ Verified |
| 9 | 📦 Inventory | Add to Inventory | Barcodes created |
| 10 | 🏭 Manufacturing | Create MRN | MRN-XXXXX |
| 11 | 📦 Inventory | Dispatch Materials | Stock deducted |
| 12 | 🏭 Manufacturing | Receive Materials | Receipt logged |
| 13 | 🔍 QC | Verify Materials | ✅ Quality check |
| 14 | 👨‍💼 Manager | Approve Production | ✅ Ready |
| 15 | 🏭 Production | Start Production | 🎉 GO! |

---

## 🔗 Page Links

```
Sales: /sales/orders/create
Procurement: /procurement/create-po
Approvals: /procurement/pending-approvals
GRN: /inventory/grn/create
Verify GRN: /inventory/grn/:id/verify
Add Stock: /inventory/grn/:id/add-to-inventory
MRN: /manufacturing/production-requests
Dispatch: /inventory/dispatch/:mrnId
Receive: /manufacturing/material-receipt/:dispatchId
Verify: /manufacturing/stock-verification/:receiptId
Approve: /manufacturing/production-approval/:verificationId
Start: /manufacturing/production-orders
```

---

## 📊 Status Flow

```
SO: draft → confirmed → ready_for_procurement
PO: draft → pending → approved → received → completed
GRN: received → verified → approved
MRN: pending → issued → received → verified → completed
Production: pending → approved → in_progress
```

---

## 🔔 Who Gets Notified?

| Step | Notification Sent To |
|------|---------------------|
| 2 | Procurement + Manufacturing |
| 5 | Inventory + Vendor |
| 7 | QC Team |
| 9 | Procurement + Inventory |
| 10 | Inventory |
| 11 | Manufacturing |
| 12 | QC |
| 13 | Manufacturing Manager |
| 14 | Production Team |

---

## ⏱️ Typical Timeline

```
Day 1: Steps 1-5 (Create & Approve)
Day 3-7: Vendor Delivery
Day 8: Steps 7-15 (GRN → Production Start)
```

---

## 🎯 Critical Checkpoints

**Before Step 5 (PO Approval):**
- ✅ Vendor verified
- ✅ Quantities correct
- ✅ Prices confirmed

**Before Step 9 (Add to Inventory):**
- ✅ Quality verified
- ✅ Quantities match
- ✅ No damage

**Before Step 14 (Production Approval):**
- ✅ All materials received
- ✅ QC passed
- ✅ Barcodes scanned

**Before Step 15 (Start Production):**
- ✅ Materials allocated
- ✅ Team assigned
- ✅ Manager approved

---

## 🔍 Quick Troubleshooting

| Problem | Check |
|---------|-------|
| Can't find PO | Is it approved? |
| Can't create GRN | PO approved? Vendor delivered? |
| GRN stuck | Manager must approve discrepancy |
| Can't dispatch | MRN status = stock_available? |
| Barcode won't scan | Try manual entry |
| Can't start production | Manager approved? Materials allocated? |

---

## 💾 Auto-Generated Numbers

| Document | Format | Example |
|----------|--------|---------|
| Sales Order | SO-YYYYMMDD-XXXXX | SO-20250128-00001 |
| Production Request | PRQ-YYYYMMDD-XXXXX | PRQ-20250128-00001 |
| Purchase Order | PO-YYYYMMDD-XXXXX | PO-20250128-00001 |
| GRN | GRN-YYYYMMDD-XXXXX | GRN-20250128-00001 |
| Inventory | INV-YYYYMMDD-XXXXX | INV-20250128-00001 |
| MRN | MRN-YYYYMMDD-XXXXX | MRN-20250128-00001 |

---

## 🎨 Color Codes

```
🟢 GREEN = Approved, Completed, Good
🔵 BLUE = In Progress, Pending
🟡 YELLOW = Warning, Variance, Attention
🔴 RED = Rejected, Failed, Critical
⚪ GRAY = Draft, Inactive
```

---

## 📞 Emergency Contacts

| Role | Contact |
|------|---------|
| Sales Manager | ___________ |
| Procurement Manager | ___________ |
| Inventory Manager | ___________ |
| QC Supervisor | ___________ |
| Manufacturing Manager | ___________ |
| Production Supervisor | ___________ |
| IT Support | ___________ |

---

## ✅ Daily Checklist

**Sales:**
- [ ] Check pending orders
- [ ] Send orders to procurement

**Procurement:**
- [ ] Check incoming orders
- [ ] Create POs
- [ ] Send for approval

**Manager:**
- [ ] Check pending approvals
- [ ] Approve POs
- [ ] Approve discrepancies
- [ ] Approve production

**Inventory:**
- [ ] Check incoming materials
- [ ] Create GRNs
- [ ] Verify quality
- [ ] Dispatch to manufacturing

**QC:**
- [ ] Verify GRNs
- [ ] Verify received materials
- [ ] Report issues

**Manufacturing:**
- [ ] Check production requests
- [ ] Create MRNs
- [ ] Receive materials
- [ ] Start production

---

## 🚨 When to Escalate

Escalate to Manager if:
- ⚠️ GRN discrepancy found
- ⚠️ Materials received != ordered
- ⚠️ Quality issues detected
- ⚠️ Production delayed > 24 hours
- ⚠️ Vendor delivery delayed > 3 days
- ⚠️ Any step stuck > 48 hours

---

## 💡 Pro Tips

✅ Always scan barcodes  
✅ Take photos at each step  
✅ Add notes for clarity  
✅ Check notifications daily  
✅ Respond within 24 hours  
✅ Keep documents organized  
✅ Report issues immediately  
✅ Follow the sequence  

---

## 🎯 Success Metrics

**Good:**
- ✅ Steps completed in sequence
- ✅ No steps > 24 hours pending
- ✅ Discrepancy rate < 5%
- ✅ QC pass rate > 95%
- ✅ Production starts on time

**Bad:**
- ❌ Steps out of sequence
- ❌ Long pending times
- ❌ High discrepancy rate
- ❌ Quality failures
- ❌ Production delays

---

## 📚 Full Documentation

For detailed instructions:
1. `SALES_TO_PRODUCTION_COMPLETE_FLOW.md` - Step-by-step guide
2. `SALES_TO_PRODUCTION_VISUAL_GUIDE.md` - Visual diagrams
3. `SALES_TO_PRODUCTION_CHECKLIST.md` - Printable checklist

---

## 🔄 Parallel Work

While waiting for vendor delivery (Days 3-7):
- ✅ Manufacturing plans production
- ✅ Procurement tracks vendor
- ✅ Inventory prepares space
- ✅ Teams coordinate timing

---

## 📱 Mobile-Friendly Actions

If you have barcode scanner:
1. Open dispatch/receipt page
2. Scan barcode
3. Verify details
4. Submit

Takes < 1 minute! 🚀

---

## 🏆 Best Practices

**Sales:**
- Complete customer info
- Clear specifications
- Realistic dates

**Procurement:**
- Choose reliable vendors
- Verify prices
- Track delivery

**Inventory:**
- Count carefully
- Report issues
- Label properly

**QC:**
- Follow checklist
- Document issues
- Don't compromise

**Manufacturing:**
- Plan ahead
- Request early
- Inspect on receipt

**Manager:**
- Review daily
- Approve promptly
- Support team

---

**🎉 You've got this!**

**Questions?** Check the detailed guides or contact IT Support.

---

**Print this card and keep it visible at your workstation!**

---

**Version:** 1.0  
**Last Updated:** January 28, 2025  
**Status:** ✅ Production Ready

**Quick Access URL:** http://localhost:3000 (Development)