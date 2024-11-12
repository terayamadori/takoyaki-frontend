<template>
  <div class="col-md-8 mx-auto">
    <h2>履歴</h2>

    <div class="alert alert-info total-display">
      <strong>合計:</strong>
      <span>{{ totalTakoyaki }} たこ焼き, {{ totalDessert }} デザート</span>
    </div>

    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
      <table class="table table-hover" v-if="orders.length > 0">
        <thead class="thead-light sticky-header">
          <tr>
            <th scope="col" @click="sortOrders('order_number')" class="header-text text-center">受付番号</th>
            <th scope="col" @click="sortOrders('takoyaki_quantity')" class="header-text text-center">たこ焼き</th>
            <th scope="col" @click="sortOrders('dessert_takoyaki_quantity')" class="header-text text-center">デザート</th>
            <th scope="col" @click="sortOrders('order_date')" class="header-text text-center">注文日時</th>
            <th scope="col" class="text-center">受け渡し日時</th>
            <th scope="col" class="text-center">たこ焼き価格</th>
            <th scope="col" class="text-center">デザート価格</th>
            <th scope="col" class="text-center">受取取消</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="text-center">{{ order.order_number }}</td>
            <td class="text-center">{{ order.takoyaki_quantity }}</td>
            <td class="text-center">{{ order.dessert_takoyaki_quantity }}</td>
            <td class="text-center">
              <span v-if="order.order_date">
                {{ formatOrderDate(order.order_date) }}
              </span>
              <span v-else>無効な日付</span>
            </td>
            <td class="text-center">
              <span v-if="order.status === 'completed' && order.pass_date">
                {{ formatOrderDate(order.pass_date) }}
              </span>
              <span v-else>
                未受渡
              </span>
            </td>
            <td class="text-center">{{ Math.floor(order.takoyaki_price) }}</td>
            <td class="text-center">{{ Math.floor(order.dessert_takoyaki_price) }}</td>
            <td class="text-center">
              <button 
                class="btn btn-lightblue btn-sm" 
                :disabled="order.status !== 'completed'" 
                @click="cancel(order.id, order.order_number)"
              >
                取消
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>注文がありません。</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orders: [],
      totalTakoyaki: 0,
      totalDessert: 0,
    };
  },
  async created() {
    await this.fetchOrders();
    this.calculateTotals();
  },
  methods: {
    async fetchOrders() {
      try {
        this.orders = await this.$axios.$get('/api/orders');
        console.log('注文データ:', this.orders);
        this.orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        this.calculateTotals();
      } catch (error) {
        console.error('注文データの取得に失敗しました:', error.response ? error.response.data : error.message);
        alert('注文データの取得に失敗しました: ' + (error.response ? error.response.data.message : error.message));
      }
    },
    calculateTotals() {
      this.totalTakoyaki = this.orders.reduce((total, order) => total + (order.takoyaki_quantity || 0), 0);
      this.totalDessert = this.orders.reduce((total, order) => total + (order.dessert_takoyaki_quantity || 0), 0);
    },
    formatOrderDate(date) {
      const d = new Date(date);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    async cancel(orderId, order_number) {
      try {
        const response = await this.$axios.$patch(`/api/orders/${orderId}`, { status: 'preparing' });
        alert(`受付番号 ${order_number} の受け渡しを取り消しました！`);
        await this.fetchOrders();
      } catch (error) {
        console.error('取り消しに失敗しました:', error.response ? error.response.data : error.message);
        alert('取り消しに失敗しました: ' + (error.response ? error.response.data.message : error.message));
      }
    },
    sortOrders(field) {
      this.orders.sort((a, b) => {
        if (field === 'order_date') {
          return new Date(b.order_date) - new Date(a.order_date);
        }
        return a[field] > b[field] ? 1 : -1;
      });
    },
  },
};
</script>

<style scoped>
.table {
  margin-top: 20px;
}
.btn-lightblue {
  background-color: #87CEFA;
  color: #ffffff;
}
.btn-lightblue:disabled {
  background-color: #B0C4DE;
  cursor: not-allowed;
}
</style>