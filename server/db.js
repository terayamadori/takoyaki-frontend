// server/db.js
const { Pool } = require('pg');

// PostgreSQL接続プールの設定
const pool = new Pool({
    connectionString: process.env.DB_CONNECT_STRING
});


// 接続の確認
pool.connect()
    .then(client => {
        console.log('Database connected successfully');
        client.release(); // 接続をリリース
    })
    .catch(err => {
        console.error('Database connection error', err.stack);
    });

module.exports = pool;
