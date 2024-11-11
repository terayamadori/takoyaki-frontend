require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
const compression = require('compression');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// Nuxt.js optionsの読み込み
const config = require('../nuxt.config.js');
config.dev = process.env.NODE_ENV !== 'production';

// PostgreSQL接続プールの初期化
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// PostgreSQL接続テスト
pool.connect((err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
  }
});

// Nuxt.jsの初期化
const nuxt = new Nuxt(config);

// WebSocketのメッセージキュー
let messageQueue = [];

// WebSocketの開始
function socketStart(server) {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    // 注文が追加・更新された場合に通知
    socket.on('orderUpdated', (order) => {
      console.log('Order updated:', order);
      io.emit('orderUpdated', order); // クライアント全員に注文更新イベントを送信
    });

    // クライアントからメッセージ受信
    socket.on('send-message', (message) => {
      console.log('Received message:', message);
      socket.broadcast.emit('new-message', message);  // 他のクライアントにメッセージを送信
    });

    // クライアント切断時のログ
    socket.on('disconnect', () => {
      console.log('クライアントが切断しました');
    });
  });

  return io;
}

// データの追加や更新時にSocket.IOイベントを発火する関数
async function emitOrderUpdate(io) {
  try {
    // 最新の注文データを取得して全クライアントに送信
    const result = await pool.query('SELECT * FROM public.orders ORDER BY order_date DESC');
    io.emit('orderUpdated', result.rows);
  } catch (error) {
    console.error('Failed to fetch updated orders:', error);
  }
}

// サーバー起動スクリプト
async function start() {
  const app = express();
  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;

  // ミドルウェア設定
  app.use(compression({
    threshold: 0,
    level: 9,
    memLevel: 9,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  }));

  // データベース接続テスト用ルート
  app.get('/api/test', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json(result.rows);
    } catch (err) {
      console.error('Database query error', err.stack);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  // 注文データ追加のエンドポイント
  app.post('/api/orders', async (req, res) => {
    const { order_number, takoyaki_quantity, dessert_quantity, takoyaki_price, dessert_price } = req.body;

    try {
      // データの挿入（例）
      const result = await pool.query(
        'INSERT INTO public.orders (order_number, takoyaki_quantity, dessert_quantity, takoyaki_price, dessert_price, order_date, status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *',
        [order_number, takoyaki_quantity, dessert_quantity, takoyaki_price, dessert_price, 'preparing']
      );
      
      // 成功時に最新の注文データを全クライアントに送信
      await emitOrderUpdate(io);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // 価格変更時のエンドポイント
  app.put('/api/prices', async (req, res) => {
    const { takoyaki_price, dessert_price } = req.body;

    try {
      // データの更新（例）
      await pool.query(
        'UPDATE public.orders SET takoyaki_price = $1, dessert_price = $2 WHERE status = $3',
        [takoyaki_price, dessert_price, 'pending']
      );
      
      // 成功時に最新の注文データを全クライアントに送信
      await emitOrderUpdate(io);
      res.json({ message: 'Prices updated' });
    } catch (error) {
      console.error('Price update error:', error);
      res.status(500).json({ error: 'Failed to update prices' });
    }
  });

  // Nuxt.jsの準備
  await nuxt.ready();
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }
  app.use(nuxt.render);

  // サーバー作成
  const server = http.createServer(app);

  // WebSocketの起動
  const io = socketStart(server);

  // サーバーの起動
  server.listen(port, host, () => {
    consola.ready({
      message: `Server listening on http://${host}:${port}`,
      badge: true,
    });
    console.log('Socket.IO starts');
  });
}

start();
