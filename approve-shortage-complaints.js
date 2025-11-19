const { sequelize, Approval, PurchaseOrder, VendorRequest } = require('./server/config/database');

async function approveShortageComplaints(poId) {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`\n=== Approving Shortage Complaints for PO ID: ${poId} ===\n`);

    const complaints = await Approval.findAll({
      where: {
        entity_id: poId,
        entity_type: 'purchase_order',
        stage_key: 'grn_shortage_complaint',
        status: ['pending', 'in_progress']
      },
      transaction
    });

    console.log(`Found ${complaints.length} pending/in_progress complaints\n`);

    if (complaints.length === 0) {
      console.log('No pending complaints to approve');
      await transaction.rollback();
      return;
    }

    let approvedCount = 0;

    for (const complaint of complaints) {
      console.log(`Approving: ${complaint.stage_key}`);
      console.log(`  ID: ${complaint.id}`);
      console.log(`  Current Status: ${complaint.status}`);

      await complaint.update(
        {
          status: 'approved',
          reviewer_id: 1,
          decision_note: 'Approved for shortage fulfillment',
          decided_at: new Date()
        },
        { transaction }
      );

      const po = await PurchaseOrder.findByPk(poId, { transaction });

      await po.update({ status: 'reopened' }, { transaction });

      const shortageItems = complaint.metadata?.items_affected || [];
      if (shortageItems.length > 0 && complaint.metadata?.grn_id) {
        const totalValue = shortageItems.reduce((sum, item) => {
          return sum + parseFloat(item.shortage_value || 0);
        }, 0);

        await VendorRequest.create(
          {
            purchase_order_id: po.id,
            grn_id: complaint.metadata.grn_id,
            vendor_id: po.vendor_id,
            complaint_id: complaint.id,
            request_type: 'shortage',
            request_number: `SR-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString().slice(2, 7)}`,
            items: shortageItems.map(item => ({
              material_name: item.material_name,
              product_code: item.product_code || '',
              shortage_qty: item.shortage_qty,
              shortage_quantity: item.shortage_qty,
              ordered_qty: item.ordered_qty,
              received_qty: item.received_qty,
              rate: item.rate || 0,
              uom: item.uom || 'Meters'
            })),
            total_value: totalValue,
            status: 'sent',
            sent_at: new Date(),
            created_by: 1
          },
          { transaction }
        );

        console.log(`  ✓ Approved`);
        console.log(`  ✓ PO Status → reopened`);
        console.log(`  ✓ VendorRequest created for ${shortageItems.length} items`);
        approvedCount++;
      }
    }

    await transaction.commit();

    console.log(`\n✓ Successfully approved ${approvedCount} complaint(s)!\n`);

    const po = await PurchaseOrder.findByPk(poId);
    console.log(`PO Status is now: ${po.status}`);
    console.log('\nNext Step: Create a second GRN with shortage items');

  } catch (error) {
    await transaction.rollback();
    console.error('Error approving complaints:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

const poId = process.argv[2] || 1;
approveShortageComplaints(parseInt(poId));
