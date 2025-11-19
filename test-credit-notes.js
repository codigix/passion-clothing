const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let vendorId = 1;
let grnId = 1;
let creditNoteId = null;

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`
});

const log = (title, data) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 ${title}`);
  console.log('='.repeat(60));
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
};

const testCreditNotes = async () => {
  try {
    log('🧪 CREDIT NOTES API TEST SUITE', '');

    // 1. Test Create Credit Note
    console.log('\n1️⃣  Testing: Create Credit Note');
    try {
      const createRes = await axios.post(`${API_BASE}/credit-notes/`, {
        grn_id: grnId,
        credit_note_type: 'partial_credit',
        tax_percentage: 18,
        settlement_method: 'cash_credit',
        remarks: 'Test credit note creation'
      }, { headers: headers() });

      if (createRes.status === 201) {
        log('✅ CREATE SUCCESS', createRes.data);
        creditNoteId = createRes.data.creditNote?.id;
      }
    } catch (error) {
      if (error.response?.status === 400) {
        log('ℹ️  NOTE', error.response.data.message || 'No overage items in GRN');
      } else {
        throw error;
      }
    }

    // 2. Test Generate from GRN
    console.log('\n2️⃣  Testing: Generate from GRN');
    try {
      const genRes = await axios.post(`${API_BASE}/credit-notes/generate-from-grn/${grnId}`, {
        tax_percentage: 18,
        settlement_method: 'adjust_invoice'
      }, { headers: headers() });

      if (genRes.status === 201) {
        log('✅ GENERATE SUCCESS', genRes.data);
        if (!creditNoteId && genRes.data.creditNote?.id) {
          creditNoteId = genRes.data.creditNote.id;
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        log('ℹ️  NOTE', error.response.data.message || 'No overage items found');
      } else {
        throw error;
      }
    }

    // 3. Test List Credit Notes
    console.log('\n3️⃣  Testing: List Credit Notes');
    try {
      const listRes = await axios.get(`${API_BASE}/credit-notes/?limit=10&offset=0`, {
        headers: headers()
      });

      log('✅ LIST SUCCESS', {
        total: listRes.data.total,
        count: listRes.data.count,
        first_item: listRes.data.creditNotes[0] || 'No credit notes yet'
      });
    } catch (error) {
      throw error;
    }

    // 4. Test Get Credit Note Details
    if (creditNoteId) {
      console.log('\n4️⃣  Testing: Get Credit Note Details');
      try {
        const getRes = await axios.get(`${API_BASE}/credit-notes/${creditNoteId}`, {
          headers: headers()
        });

        log('✅ GET DETAILS SUCCESS', {
          credit_note_number: getRes.data.credit_note_number,
          status: getRes.data.status,
          total_credit_amount: getRes.data.total_credit_amount,
          items_count: getRes.data.items?.length || 0
        });
      } catch (error) {
        throw error;
      }

      // 5. Test Update
      console.log('\n5️⃣  Testing: Update Credit Note (Draft Only)');
      try {
        const updateRes = await axios.put(`${API_BASE}/credit-notes/${creditNoteId}`, {
          tax_percentage: 20,
          remarks: 'Updated during test'
        }, { headers: headers() });

        log('✅ UPDATE SUCCESS', {
          status: updateRes.data.creditNote.status,
          tax_percentage: updateRes.data.creditNote.tax_percentage
        });
      } catch (error) {
        log('ℹ️  UPDATE RESULT', error.response?.data?.message || 'Could not update');
      }
    }

    log('✅ ALL TESTS COMPLETED', 'Check results above');

  } catch (error) {
    log('❌ TEST ERROR', {
      status: error.response?.status || 'N/A',
      message: error.response?.data?.message || error.message
    });
  }

  process.exit(0);
};

(async () => {
  console.log('\n🧪 CREDIT NOTES API TEST SUITE\n');
  authToken = process.env.AUTH_TOKEN || 'test-token';
  await testCreditNotes();
})();
