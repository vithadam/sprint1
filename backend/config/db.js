// db.js
const mysql = require('mysql2');
require('dotenv').config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,        // e.g., 'localhost'
  user: process.env.DB_USER,        // e.g., 'root' or 'admin'
  password: process.env.DB_PASSWORD,// e.g., '1234'
  database: process.env.DB_NAME,    // e.g., 'jewelry_sales_db'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to promise-based
const promisePool = pool.promise();

// Test the connection immediately
promisePool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected Successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

module.exports = promisePool;
