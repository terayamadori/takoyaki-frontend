<template>
  <div class="container">
    <div class="row">
      <div class="col-md-4 mb-3" v-for="order in orders" :key="order.id">
        <div class="postit-card">
          <h5 class="order-number">受付番号: {{ order.order_number }}</h5>
          <p class="order-detail">たこ焼き: {{ order.takoyaki_quantity }}個</p>
          <p class="order-detail">
            デザート: {{ order.dessert_takoyaki_quantity }}個
          </p>
          <p class="order-date">受付日時: {{ formatDate(order.order_date) }}</p>
          <button
            class="btn btn-primary btn-lg"
            @click="pass(order.id, order.order_number)"
          >
            受け渡し
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      orders: [], // 注文データを格納する配列
    };
  },
  async created() {
    await this.fetchOrders(); // 初回の注文データを取得
    this.initializeSocket(); // ソケット接続を初期化してリアルタイム更新を設定
  },
  methods: {
    async fetchOrders() {
      try {
        const allOrders = await this.$axios.$get("/api/orders");
        // 古い順に並べ替え
        this.orders = allOrders
          .filter((order) => order.status !== "completed")
          .sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
      } catch (error) {
        console.error(
          "注文データの取得に失敗しました:",
          error.response ? error.response.data : error.message
        );
        alert(
          "注文データの取得に失敗しました: " +
            (error.response ? error.response.data.message : error.message)
        );
      }
    },
    async pass(orderId, order_number) {
      try {
        const response = await this.$axios.$patch(`/api/orders/${orderId}`, {
          status: "completed",
          pass_date: new Date().toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
          }), // 日本時間を設定
        });

        alert(`受付番号 ${order_number} の受け渡しが完了しました！`);
        this.orders = this.orders.filter((order) => order.id !== orderId); // リストから削除
      } catch (error) {
        console.error(
          "受け渡しの更新に失敗しました:",
          error.response ? error.response.data : error.message
        );
        alert(
          "受け渡しの更新に失敗しました: " +
            (error.response ? error.response.data.message : error.message)
        );
      }
    },
    initializeSocket() {
      const socket = io(process.env.HOST_URL);

      socket.on("orderUpdated", (updatedOrder) => {
        const index = this.orders.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (index !== -1) {
          if (updatedOrder.status === "completed") {
            this.orders.splice(index, 1); // リストから削除
          } else {
            this.orders.splice(index, 1, updatedOrder); // 更新された注文をリストに反映
          }
        } else if (updatedOrder.status !== "completed") {
          this.orders.push(updatedOrder); // 新しい注文が追加された場合
        }
        // 古い順に並べ替え
        this.orders.sort(
          (a, b) => new Date(a.order_date) - new Date(b.order_date)
        );
      });

      socket.on("orderAdded", (newOrder) => {
        if (newOrder.status !== "completed") {
          this.orders.push(newOrder); // 新しい注文をリストに追加
          // 古い順に並べ替え
          this.orders.sort(
            (a, b) => new Date(a.order_date) - new Date(b.order_date)
          );
        }
      });

      socket.on("orderDeleted", (deletedOrderId) => {
        this.orders = this.orders.filter(
          (order) => order.id !== deletedOrderId
        ); // リストから削除
      });
    },
    formatDate(dateString) {
      try {
        if (!dateString) return "日時不明";
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return ` ${hours}:${minutes}`;
      } catch (e) {
        console.error("日付フォーマットエラー:", e);
        return "日時不明";
      }
    },
  },
};
</script>

<style scoped>
.postit-card {
  background-color: #fffbcc; /* ポストイット風の淡い黄色 */
  border: 1px solid #e3e3a5;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-align: center;
  transition: transform 0.2s; /* マウスオーバー時の効果 */
  font-size: 1.5em; /* ポストイット内のフォントサイズを大きく */
}
.postit-card:hover {
  transform: scale(1.05); /* マウスオーバー時に拡大 */
}
.postit-card h5 {
  color: #ff7f50; /* タイトルの色 */
  font-size: 1.5em; /* 受付番号のフォントサイズを大きく */
}
.order-detail,
.order-date {
  font-size: 1em; /* 他のテキストのフォントサイズを大きく */
}
.postit-card button {
  margin-top: 10px; /* ボタンのマージン */
  font-size: 1.2em; /* ボタンのフォントサイズを大きく */
  padding: 0spx 0px; /* ボタンのパディングを調整 */
}
</style>
