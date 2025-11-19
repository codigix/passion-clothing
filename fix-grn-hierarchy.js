const { sequelize, GoodsReceiptNote, PurchaseOrder, Approval } = require('./server/config/database');

async function fixGRNHierarchy(poId) {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`\n=== Fixing GRN Hierarchy for PO ID: ${poId} ===\n`);

    const grns = await GoodsReceiptNote.findAll({
      where: { purchase_order_id: poId },
      order: [['created_at', 'ASC']],
      transaction
    });

    console.log(`Found ${grns.length} GRNs`);

    if (grns.length === 0) {
      console.log('No GRNs found for this PO');
      await transaction.rollback();
      return;
    }

    for (let i = 0; i < grns.length; i++) {
      const grn = grns[i];
      const isFirst = i === 0;
      const sequence = i + 1;
      
      console.log(`\nGRN ${grn.grn_number}:`);
      console.log(`  Current: sequence=${grn.grn_sequence}, is_first_grn=${grn.is_first_grn}`);
      console.log(`  Fixing to: sequence=${sequence}, is_first_grn=${isFirst}`);

      await grn.update(
        {
          grn_sequence: sequence,
          is_first_grn: isFirst,
          original_grn_id: isFirst ? null : grns[0].id
        },
        { transaction }
      );
    }

    const po = await PurchaseOrder.findByPk(poId, { transaction });
    
    console.log(`\nPO Status: ${po.status}`);
    
    const complaints = await Approval.findAll({
      where: {
        entity_id: poId,
        entity_type: 'purchase_order',
        stage_key: ['grn_shortage_complaint', 'grn_overage_complaint']
      },
      transaction
    });

    console.log(`Found ${complaints.length} complaints`);
    
    complaints.forEach(c => {
      console.log(`  - ${c.stage_key}: ${c.status}`);
    });

    console.log('\n=== Recommendations ===');
    if (po.status === 'grn_requested' && grns.length > 0) {
      console.log('1. The first GRN was created but PO status is still "grn_requested"');
      console.log('2. Check if the first GRN has shortages/overages');
      console.log('3. If yes, you need to approve the shortage complaint');
      console.log('4. Complaint status:', complaints.length > 0 ? complaints[0].status : 'No complaints found');
    }

    await transaction.commit();
    console.log('\n✓ Hierarchy fixed successfully!\n');

    const updatedGRNs = await GoodsReceiptNote.findAll({
      where: { purchase_order_id: poId },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'grn_number', 'grn_sequence', 'is_first_grn']
    });

    console.log('Updated GRNs:');
    updatedGRNs.forEach(g => {
      console.log(`  ${g.grn_number}: sequence=${g.grn_sequence}, is_first=${g.is_first_grn}`);
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error fixing hierarchy:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

const poId = process.argv[2] || 1;
fixGRNHierarchy(parseInt(poId));
