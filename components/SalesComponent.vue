<template>
  <div class="container">
    <div class="header">
      <h1>売上ページ</h1>
      <button @click="downloadExcel" class="download-button">
        レポート
      </button>
    </div>
    <div v-if="salesData.length">
      <div v-for="(dayData, index) in salesData" :key="index" class="day-sales">
        <h2>{{ dayData.date }}</h2>

        <!-- たこ焼きの売上 -->
        <h3>たこ焼きの売上 : ¥{{ dayData.takoyakiTotalSales.toLocaleString() }}</h3>
        <table v-if="dayData.takoyaki.length">
          <thead>
            <tr>
              <th>価格</th>
              <th>個数</th>
              <th>売上金額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(takoyakiData, idx) in dayData.takoyaki" :key="'takoyaki-' + idx">
              <td>¥{{ takoyakiData.price.toLocaleString() }}</td>
              <td>{{ takoyakiData.quantity }}</td>
              <td>¥{{ takoyakiData.sales.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <!-- デザートの売上 -->
        <h3>デザートの売上 : ¥{{ dayData.dessertTotalSales.toLocaleString() }}</h3>
        <table v-if="dayData.dessert.length">
          <thead>
            <tr>
              <th>価格</th>
              <th>個数</th>
              <th>売上金額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dessertData, idx) in dayData.dessert" :key="'dessert-' + idx">
              <td>¥{{ dessertData.price.toLocaleString() }}</td>
              <td>{{ dessertData.quantity }}</td>
              <td>¥{{ dessertData.sales.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 日の合計売上金額 -->
        <div class="total-day-sales">
          <h2>日別合計売上金額: ¥{{ dayData.totalSales.toLocaleString() }}</h2>
        </div>
      </div>
    </div>
    <div v-else>
      <p>売上データがありません。</p>
    </div>
  </div>
</template>



<script>
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      salesData: [], // 売上データを格納する配列
      orders: [] // 取得した注文データを格納する配列
    };
  },
  async created() {
    await this.fetchSalesData(); // コンポーネント生成時に売上データを取得
  },
  methods: {
    async fetchSalesData() {
      try {
        // statusが'completed'の注文データを取得
        this.orders = await this.$axios.$get('/api/orders'); // orders を格納

        // データを日付と価格ごとに集計
        const salesByDate = this.orders
          .filter(order => order.status === 'completed')
          .reduce((acc, order) => {
            const orderDate = new Date(order.order_date).toISOString().split('T')[0]; // 日付部分のみ抽出

            // 日付が存在しない場合は新しく追加
            if (!acc[orderDate]) {
              acc[orderDate] = {
                date: orderDate,
                takoyaki: [],
                dessert: [],
                takoyakiTotalSales: 0,
                dessertTotalSales: 0,
                totalSales: 0
              };
            }

            // たこ焼きのデータ集計
            const takoyakiPrice = Math.round(order.takoyaki_price * 100) / 100; // 小数点を切り捨てないように
            const takoyakiIndex = acc[orderDate].takoyaki.findIndex(entry => entry.price === takoyakiPrice);
            if (takoyakiIndex !== -1) {
              acc[orderDate].takoyaki[takoyakiIndex].quantity += order.takoyaki_quantity;
              acc[orderDate].takoyaki[takoyakiIndex].sales += order.takoyaki_quantity * order.takoyaki_price;
            } else {
              acc[orderDate].takoyaki.push({
                price: takoyakiPrice,
                quantity: order.takoyaki_quantity,
                sales: order.takoyaki_quantity * order.takoyaki_price
              });
            }

            // デザートのデータ集計
            const dessertPrice = Math.round(order.dessert_takoyaki_price * 100) / 100; // 小数点を切り捨てないように
            const dessertIndex = acc[orderDate].dessert.findIndex(entry => entry.price === dessertPrice);
            if (dessertIndex !== -1) {
              acc[orderDate].dessert[dessertIndex].quantity += order.dessert_takoyaki_quantity;
              acc[orderDate].dessert[dessertIndex].sales += order.dessert_takoyaki_quantity * order.dessert_takoyaki_price;
            } else {
              acc[orderDate].dessert.push({
                price: dessertPrice,
                quantity: order.dessert_takoyaki_quantity,
                sales: order.dessert_takoyaki_quantity * order.dessert_takoyaki_price
              });
            }

            // 合計売上金額を計算
            acc[orderDate].takoyakiTotalSales += order.takoyaki_quantity * order.takoyaki_price;
            acc[orderDate].dessertTotalSales += order.dessert_takoyaki_quantity * order.dessert_takoyaki_price;
            acc[orderDate].totalSales += (order.takoyaki_quantity * order.takoyaki_price) + (order.dessert_takoyaki_quantity * order.dessert_takoyaki_price);

            return acc;
          }, {});

        // salesDataに日付ごとのデータを追加
        this.salesData = Object.values(salesByDate).sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        console.error('売上データの取得に失敗しました:', error.response ? error.response.data : error.message);
        alert('売上データの取得に失敗しました: ' + (error.response ? error.response.data.message : error.message));
      }
    },
    downloadExcel() {
      const wsData = [];
      // ヘッダー行
      wsData.push([
        '注文ID', '注文番号', 'たこ焼き個数', 'たこ焼き単価', 'デザート個数', 'デザート単価', '注文日時', '受け渡し日時', 'ステータス'
      ]);

      // 取得した注文データを行ごとに追加
      this.orders.forEach(order => {
        wsData.push([
          order.id, order.order_number, order.takoyaki_quantity, order.takoyaki_price, order.dessert_takoyaki_quantity, order.dessert_takoyaki_price, order.order_date, order.pass_date, order.status
        ]);
      });

      // エクセルワークブック作成
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '注文データ');

      // エクセルファイルとしてダウンロード
      XLSX.writeFile(wb, 'orders_data.xlsx');
    }
  }
};
</script>



<style scoped>
.header {
  display: flex;
  align-items: center; /* 垂直方向に中央揃え */
  justify-content: space-between; /* タイトルとボタンを左右に配置 */
  margin-bottom: 20px;
}

h1 {
  margin: 0; /* 見出しの余白を削除 */
}

.download-button {
  padding: 10px 20px;
  background-color: #ff6600;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.download-button:hover {
  background-color: #e55b00; /* ホバー時の色 */
}

.day-sales {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
}

table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: right;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

.total-day-sales h2 {
  font-size: 2em;
  color: #ff6600;
}

.total-sales, .total-day-sales {
  margin-top: 10px;
}

.download-button:hover {
    background-color: #0056b3;
}


</style>
