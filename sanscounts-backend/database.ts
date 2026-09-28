const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'brtlg4exutshwgqmiirt-mysql.services.clever-cloud.com',
  port: 3306,
  user: 'utb2xw1clxaeh4ip',
  password: 'PxZWT62NVyoQ2d4vg7qG',
  database: 'brtlg4exutshwgqmiirt',
  ssl: { rejectUnauthorized: false }
});

db.connect((err: any) => {
  if (err) {
    console.error('ক্লেভার ক্লাউড ডেটাবেজ কানেক্ট করতে সমস্যা হয়েছে: ', err);
    return;
  }
  console.log('সফলভাবে ক্লেভার ক্লাউড MySQL ডেটাবেজের সাথে কানেক্ট হয়েছে!');
});

module.exports = db;