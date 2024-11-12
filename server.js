
// server.js
const express = require('express');
const cors = require('cors'); // CORSミドルウェアのインポート
const ordersRouter = require('./orders');

const app = express();

// CORSの設定（特定のオリジンのみを許可）
const allowedOrigins = ['http://localhost:8080', 'https://yourfrontenddomain.com']; // 許可するオリジンを設定
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSONボディの解析ミドルウェア（express 4.16+ では body-parser は不要）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ordersRouterのルーティング設定
app.use('/api', ordersRouter);

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// サーバーレベルのエラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// ポート番号の設定
const PORT = process.env.PORT || 3000; // 環境変数からポートを取得
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で稼働中`);
});
