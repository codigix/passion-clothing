const db = require('./config/database');

const verify = async () => {
  try {
    const notifications = await db.Notification.findAll({
      where: { type: 'credit_note_created' },
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'department']
        }
      ]
    });
    
    console.log('Notifications sent to Finance Department:');
    console.log(JSON.stringify(notifications, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

verify();
