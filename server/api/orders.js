// require("dotenv").config();
// const express = require("express");
// const { Pool } = require("pg");
// const router = express.Router();
// const cors = require("cors");

// // PostgreSQL接続プールの設定
// const pool = new Pool({
//   connectionString: process.env.DB_CONNECT_STRING
// });

// // CORS設定
// router.use(
//   cors({
//     origin : [
//       process.env.HOST_URL,
//     ],
//     credentials: true,
//   })
// );

// // 注文データの取得API
// router.get("/orders", async (req, res) => {

//   const { status } = req.query; // クエリパラメータからstatusを取得
//   try {
//     let query = `
//             SELECT id, order_number, takoyaki_quantity, takoyaki_price,
//                   dessert_takoyaki_quantity, dessert_takoyaki_price,
//                   order_date, status, pass_date
//             FROM public.orders
//         `;
//     const values = [];

//     // statusパラメータが存在する場合、フィルタリングを追加
//     if (status) {
//       query += ` WHERE status = $1`;
//       values.push(status); // フィルタリングするstatusをvalues配列に追加
//     }

//     // データを取得
//     const result = await pool.query(query, values);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("データ取得エラー:", error);
//     res
//       .status(500)
//       .json({ error: "データ取得に失敗しました。詳細: " + error.message });
//   }
// });

// // 価格設定データの取得API
// router.get("/pricesettings", async (req, res) => {
//   console.log(res)
//   try {
//     const result = await pool.query(
//       "SELECT takoyaki_price, dessert_takoyaki_price FROM public.pricesettings"
//     );
//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "価格設定データが見つかりませんでした" });
//     }
//     console.log(result)
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("価格設定データ取得エラー:", error);
//     res.status(500).json({
//       error: "価格設定データの取得に失敗しました。詳細: " + error.message,
//     });
//   }
// });

// module.exports = router;
