const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// মাইএসকিউএল ডাটাবেজ কানেকশন
const db = mysql.createConnection({
  host: 'brtlg4exutshwgqmiirt-mysql.services.clever-cloud.com',
  user: 'brtlg4exutshwgqmiirt-mysql.services.clever-cloud.com',      
  password: 'S6rOxv51mLqUfwkmC7xX', 
  database: 'sanscounts'   
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL Database!');
});

// সাইন-আপ রাউট
app.post('/api/signup', (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  const query = 'INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?)';

  db.query(query, [firstName, lastName, username, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error saving user to MySQL' });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});