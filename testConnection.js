require('dotenv').config(); // .envから環境変数を読み込む
const { Pool } = require('pg'); // PostgreSQL用のクライアントをインポート

// 環境変数から接続情報を取得
const pool = new Pool({
  connectionString: process.env.DB_CONNECT_STRING
});

// データベースに接続してクエリを実行
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error', err.stack); // エラーがあれば表示
  } else {
    console.log('Database connected successfully'); // 接続成功メッセージを表示

    // テストクエリを実行（例：現在の日付を取得）
    client.query('SELECT NOW()', (err, result) => {
      release(); // クライアントを解放

      if (err) {
        console.error('Query error', err.stack); // クエリエラーがあれば表示
      } else {
        console.log('Current date and time:', result.rows[0]); // 結果を表示
      }
    });
  }
});
