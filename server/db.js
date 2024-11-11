// server/db.js
const { Pool } = require('pg');

// PostgreSQL接続プールの設定
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 20, // 最大接続数
    min: 2,   // 最小接続数
    idleTimeoutMillis: 30000, // 接続アイドル時間
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
