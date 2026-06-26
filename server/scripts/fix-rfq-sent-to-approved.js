/**
 * Fix existing RFQ records that have status "Sent" → "Approved"
 * and auto-create/update Quotation records for them.
 * Run: node scripts/fix-rfq-sent-to-approved.js
 */
const { sequelize, ClientRequirement, Quotation } = require('../config/database');

const generateQuotationNumber = async (transaction) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const lastQuot = await Quotation.findOne({
    where: { quotation_number: { [require('sequelize').Op.like]: `QT-${dateStr}-%` } },
    order: [['id', 'DESC']],
    transaction
  });
  let seq = 1;
  if (lastQuot) {
    const parts = lastQuot.quotation_number.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  return `QT-${dateStr}-${seq.toString().padStart(4, '0')}`;
};

async function main() {
  try {
    console.log('🔧 Fixing RFQ "Sent" → "Approved" for all requirements...\n');

    const requirements = await ClientRequirement.findAll();
    let fixedCount = 0;
    let quotationCount = 0;

    for (const req of requirements) {
      const history = req.rfq_history;
      if (!history || !Array.isArray(history)) continue;

      let changed = false;
      let latestApproved = null;

      // Update all "Sent" → "Approved", mark older ones as "Revised"
      history.forEach((rec, idx) => {
        if (rec.status === 'Sent') {
          // If this is the last one, approve it; otherwise mark Revised
          if (idx === history.length - 1) {
            rec.status = 'Approved';
            latestApproved = rec;
          } else {
            rec.status = 'Revised';
          }
          changed = true;
        } else if (rec.status === 'Approved') {
          latestApproved = rec;
        }
      });

      if (changed) {
        const t = await sequelize.transaction();
        try {
          req.rfq_history = history;
          await req.save({ transaction: t });
          console.log(`  ✅ Fixed RFQ history for: ${req.requirement_number}`);
          fixedCount++;

          // Auto-create/update Quotation if there's an approved version
          if (latestApproved && latestApproved.rfqItems && latestApproved.rfqItems.length > 0) {
            const rfqItems = latestApproved.rfqItems;
            let totalAmount = 0, totalDiscount = 0, totalTax = 0, totalFinal = 0, totalQty = 0;

            rfqItems.forEach(item => {
              const qty = parseInt(item.quantity, 10) || 0;
              const rate = parseFloat(item.unit_cost) || 0;
              const itemTotal = qty * rate;
              const discPct = parseFloat(item.discount_percentage) || 0;
              const itemDiscount = (itemTotal * discPct) / 100;
              const taxable = itemTotal - itemDiscount;
              const gstPct = parseFloat(item.gst_percentage) || 18;
              const itemTax = (taxable * gstPct) / 100;
              totalQty += qty;
              totalAmount += itemTotal;
              totalDiscount += itemDiscount;
              totalTax += itemTax;
              totalFinal += taxable + itemTax;
            });

            const firstItem = rfqItems[0] || {};
            const unitPrice = parseFloat(firstItem.unit_cost) || 0;
            const discPct = parseFloat(firstItem.discount_percentage) || 0;
            const taxPct = parseFloat(firstItem.gst_percentage) || 18;

            let quotation = await Quotation.findOne({ where: { client_requirement_id: req.id }, transaction: t });
            if (quotation) {
              await quotation.update({
                rfq_no: latestApproved.rfq_number,
                rfq_version: latestApproved.version,
                product_name: req.product_name || firstItem.product_name || 'Custom Product',
                quantity: totalQty || req.quantity,
                unit_price: unitPrice,
                total_amount: totalAmount,
                discount_percentage: discPct,
                discount_amount: totalDiscount,
                tax_percentage: taxPct,
                tax_amount: totalTax,
                final_amount: totalFinal,
                status: 'Sent'
              }, { transaction: t });
              console.log(`     → Updated Quotation: ${quotation.quotation_number}`);
            } else {
              const quotNo = await generateQuotationNumber(t);
              quotation = await Quotation.create({
                quotation_number: quotNo,
                client_requirement_id: req.id,
                customer_name: req.customer_name,
                product_name: req.product_name || firstItem.product_name || 'Custom Product',
                quantity: totalQty || req.quantity,
                unit_price: unitPrice,
                total_amount: totalAmount,
                discount_percentage: discPct,
                discount_amount: totalDiscount,
                tax_percentage: taxPct,
                tax_amount: totalTax,
                final_amount: totalFinal,
                status: 'Sent',
                rfq_no: latestApproved.rfq_number,
                rfq_version: latestApproved.version,
                quotation_type: 'Sent'
              }, { transaction: t });
              console.log(`     → Created Quotation: ${quotation.quotation_number}`);
            }

            // Update requirement status
            req.status = 'Quotation Generated';
            await req.save({ transaction: t });
            quotationCount++;
          }

          await t.commit();
        } catch (e) {
          await t.rollback();
          console.error(`  ❌ Failed for ${req.requirement_number}:`, e.message);
        }
      }
    }

    console.log(`\n✅ Done! Fixed ${fixedCount} requirements, created/updated ${quotationCount} quotations.`);
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

main();
