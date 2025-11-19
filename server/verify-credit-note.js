const db = require('./config/database');

const verify = async () => {
  try {
    const creditNotes = await db.CreditNote.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      raw: true
    });
    
    console.log('Credit Notes stored in database:');
    console.log(JSON.stringify(creditNotes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

verify();
