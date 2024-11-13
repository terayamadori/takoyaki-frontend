<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <h2>注文一覧</h2>
        <div class="alert alert-info total-display">
          <strong>計:</strong>
          <span> たこ焼き : {{ totalTakoyaki }}個, デザート : {{ totalDessert }}個</span>
        </div>

        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-hover" v-if="orders.length > 0">
            <thead class="thead-light sticky-header">
              <tr>
                <th scope="col" @click="sortOrders('order_number')" class="header-text">受付番号</th>
                <th scope="col" @click="sortOrders('takoyaki_quantity')" class="header-text">たこ焼き</th>
                <th scope="col" @click="sortOrders('dessert_takoyaki_quantity')" class="header-text">デザート</th>
                <th scope="col" @click="sortOrders('order_date')" class="header-text">注文日時</th>
                <th scope="col" @click="sortOrders('status')" class="header-text">ステータス</th>
                <th scope="col">削除</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="text-center">{{ order.order_number }}</td>
                <td class="text-center">{{ order.takoyaki_quantity }}</td>
                <td class="text-center">{{ order.dessert_takoyaki_quantity }}</td>
                <td class="text-center">
                  <span v-if="order.order_date">
                    {{ new Date(order.order_date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }) }}
                  </span>
                  <span v-else>無効な日付</span>
                </td>
                <td class="text-center">{{ order.status === 'completed' ? '済' : '' }}</td>
                <td class="text-center">
                  <button class="btn btn-danger btn-sm" @click="deleteOrder(order.id, order.order_number)">削除</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else>注文がありません。</div>
        </div>
      </div>

      <div class="col-md-4">
        <form @submit.prevent="submitForm">
          <div class="form-group row">
            <label for="order_number" class="col-sm-12 col-form-label">受付番号</label>
            <input type="text" v-model="form.order_number" class="col-sm-12 form-control" id="order_number" @focus="setCurrentField('order_number')" required>
          </div>
          <div class="form-group row">
            <label for="takoyaki" class="col-sm-12 col-form-label">たこ焼き: {{ existingPrices.takoyakiPrice }}円</label>
            <input type="number" v-model="form.takoyaki" class="col-sm-12 form-control" id="takoyaki" @focus="setCurrentField('takoyaki')" required>
          </div>
          <div class="form-group row">
            <label for="dessert" class="col-sm-12 col-form-label">デザート: {{ existingPrices.dessertPrice }}円</label>
            <input type="number" v-model="form.dessert" class="col-sm-12 form-control" id="dessert" @focus="setCurrentField('dessert')" required>
          </div>

          <div class="calculator mt-3">
            <div class="row">
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('1')">1</button>
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('2')">2</button>
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('3')">3</button>
            </div>
            <div class="row">
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('4')">4</button>
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('5')">5</button>
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('6')">6</button>
            </div>
            <div class="row">
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('7')">7</button>
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('8')">8</button>
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('9')">9</button>
            </div>
            <div class="row">
              <button type="button" class="btn btn-secondary btn-lg col-3 mx-1 my-1" @click="appendValue('0')">0</button>
              <button type="button" class="btn btn-secondary btn-lg col-6 mx-1 my-1" @click="clearValue">C</button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg col-sm-12 mt-3">登録</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      orders: [],
      form: {
        order_number: '',
        takoyaki: '',
        dessert: '',
      },
      totalTakoyaki: 0,
      totalDessert: 0,
      currentField: '',
      sortKey: 'order_date',
      sortOrder: -1,
      existingPrices: {
        takoyakiPrice: null,
        dessertPrice: null
      },
      socket: null  // Socket.IOのインスタンスを格納
    };
  },
  async created() {
    await this.fetchOrders();
    await this.fetchCurrentPrices();
    this.initializeSocket();  // Socket.IOの接続を初期化
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();  // コンポーネントが破棄される際にSocket.IOを切断
    }
  },
  methods: {
    initializeSocket() {
      // Socket.IOサーバーに接続
      this.socket = io('https://takoyakiapp.fly.dev');

      // 注文が追加された場合
      this.socket.on('orderAdded', (newOrder) => {
        this.orders.unshift(newOrder);  // 新しい注文をリストの先頭に追加
        this.calculateTotals();
      });

      // 注文が更新された場合
      this.socket.on('orderUpdated', (updatedOrder) => {
        const index = this.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          this.orders.splice(index, 1, updatedOrder);  // 注文データを更新
          this.calculateTotals();
        }
      });

      // 注文が削除された場合
      this.socket.on('orderDeleted', (orderId) => {
        this.orders = this.orders.filter(order => order.id !== orderId);  // リストから削除
        this.calculateTotals();
      });
    },
    async fetchOrders() {
      try {
        this.orders = await this.$axios.$get('/api/orders');
        this.orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        this.calculateTotals();
      } catch (error) {
        console.error('注文データの取得に失敗しました:', error.response ? error.response.data : error.message);
        alert('注文データの取得に失敗しました: ' + (error.response ? error.response.data.message : error.message));
      }
    },
    async fetchCurrentPrices() {
      try {
        const response = await this.$axios.$get('/api/pricesettings');
        if (response.length > 0) {
          this.existingPrices.takoyakiPrice = Math.floor(response[0].takoyaki_price);
          this.existingPrices.dessertPrice = Math.floor(response[0].dessert_takoyaki_price);
        }
      } catch (error) {
        console.error('価格の取得に失敗しました:', error);
      }
    },
    // 合計計算
    calculateTotals() {
    this.totalTakoyaki = this.orders
      .filter(order => order.status === 'preparing')  // ステータスが preparing の注文のみをフィルタリング
      .reduce((total, order) => total + (order.takoyaki_quantity || 0), 0);  // 合計計算

      this.totalDessert = this.orders
      .filter(order => order.status === 'preparing')  // ステータスが preparing の注文のみをフィルタリング
      .reduce((total, order) => total + (order.dessert_takoyaki_quantity || 0), 0);  // 合計計算
    },
    async submitForm() {
      try {
        // 価格情報を取得
        const response = await this.$axios.$get('/api/pricesettings');
        let takoyakiPrice = 0;
        let dessertTakoyakiPrice = 0;
        if (response.length > 0) {
          takoyakiPrice = Math.floor(response[0].takoyaki_price);
          dessertTakoyakiPrice = Math.floor(response[0].dessert_takoyaki_price);
        }

        // 新しい注文を作成
        const newOrder = await this.$axios.$post('/api/orders', {
          order_number: this.form.order_number,
          takoyaki_quantity: this.form.takoyaki,
          dessert_takoyaki_quantity: this.form.dessert,
          order_date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }), // 日本時間を設定
          takoyaki_price: takoyakiPrice,  // 価格を追加
          dessert_takoyaki_price: dessertTakoyakiPrice  // 価格を追加
        });

        // Socket.IOによってリアルタイム更新されるため、ここでは手動で追加する必要はありません
        this.resetForm();
      } catch (error) {
        console.error('注文の登録に失敗しました:', error);
        alert('注文の登録に失敗しました: ' + error.message);
      }
    },
    resetForm() {
      this.form.order_number = '';
      this.form.takoyaki = '';
      this.form.dessert = '';
    },
    setCurrentField(field) {
      this.currentField = field;
    },
    appendValue(value) {
      if (this.currentField) {
        this.form[this.currentField] += value;
      }
    },
    clearValue() {
      if (this.currentField) {
        this.form[this.currentField] = '';
      }
    },
  async deleteOrder(orderId, order_number) {
    if (confirm(`受付番号 ${order_number}を削除しますか？`)) {  // 確認メッセージを表示
      try {
        await this.$axios.$delete(`/api/orders/${orderId}`);
        // Socket.IOによってリアルタイム更新されるため、ここでの手動削除は不要
      } catch (error) {
        console.error(`注受付番号 ${order_number}を削除に失敗しました:`, error);
        alert('注文の削除に失敗しました: ' + (error.response ? error.response.data.message : error.message));
      }
    }
  },
    sortOrders(key) {
      this.sortKey = key;
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
      this.orders.sort((a, b) => {
        if (a[key] < b[key]) return -this.sortOrder;
        if (a[key] > b[key]) return this.sortOrder;
        return 0;
      });
    }
  }
};
</script>


<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
}
.header-text {
  cursor: pointer;
}
.total-display {
  margin-bottom: 20px;
}
</style>