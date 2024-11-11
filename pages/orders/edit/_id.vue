<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-sm-8">
        <h2>注文編集</h2>

        <!-- 編集フォーム -->
        <div v-if="order">
          <form @submit.prevent="updateOrder">
            <!-- ID -->
            <div class="form-group d-flex align-items-center mb-3">
              <label for="id" class="col-sm-3 col-form-label text-nowrap">ID</label>
              <div class="col-sm-9 p-0">
                <input type="text" class="form-control-plaintext" readonly id="id" :value="order.id">
              </div>
            </div>

            <!-- 受付番号 -->
            <div class="form-group d-flex align-items-center mb-3">
              <label for="order_number" class="col-sm-3 col-form-label text-nowrap">受付番号</label>
              <div class="col-sm-9 p-0">
                <input type="text" class="form-control" id="order_number" v-model="order.order_number">
              </div>
            </div>

            <!-- たこ焼き -->
            <div class="form-group d-flex align-items-center mb-3">
              <label for="takoyaki_quantity" class="col-sm-3 col-form-label text-nowrap">たこ焼き</label>
              <div class="col-sm-9 p-0">
                <input type="number" class="form-control" id="takoyaki_quantity" v-model="order.takoyaki_quantity" required>
              </div>
            </div>

            <!-- デザート -->
            <div class="form-group d-flex align-items-center mb-3">
              <label for="dessert_takoyaki_quantity" class="col-sm-3 col-form-label text-nowrap">デザート</label>
              <div class="col-sm-9 p-0">
                <input type="number" class="form-control" id="dessert_takoyaki_quantity" v-model="order.dessert_takoyaki_quantity" required>
              </div>
            </div>

            <!-- 価格設定 -->
            <div class="form-group d-flex align-items-center mb-3">
              <label for="takoyaki_price" class="col-sm-3 col-form-label text-nowrap">たこ焼き価格</label>
              <div class="col-sm-9 p-0">
                <input type="number" class="form-control" id="takoyaki_price" v-model="order.takoyaki_price" required>
              </div>
            </div>

            <div class="form-group d-flex align-items-center mb-3">
              <label for="dessert_takoyaki_price" class="col-sm-3 col-form-label text-nowrap">デザート価格</label>
              <div class="col-sm-9 p-0">
                <input type="number" class="form-control" id="dessert_takoyaki_price" v-model="order.dessert_takoyaki_price" required>
              </div>
            </div>

            <!-- 更新ボタン -->
            <button type="submit" class="btn btn-primary col-sm-12">更新</button>
          </form>
        </div>

        <!-- ローディング中のメッセージ -->
        <div v-else>
          <p>注文データを取得中...</p>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="error" class="alert alert-danger">
          注文データの取得に失敗しました。後でもう一度お試しください。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async created() {
    this.fetchOrder();
  },
  data() {
    return {
      order: null,
      error: false,
    };
  },
  methods: {
    async fetchOrder() {
      try {
        const response = await this.$axios.$get(`/api/orders/${this.$route.params.id}`);
        this.order = response;
      } catch (error) {
        console.error('注文データの取得に失敗しました:', error);
        this.error = true;
      }
    },
    async updateOrder() {
      if (this.order.takoyaki_quantity <= 0 || this.order.dessert_takoyaki_quantity <= 0) {
        alert('数量は正の整数でなければなりません');
        return;
      }
      try {
        await this.$axios.$patch(`/api/orders/${this.order.id}`, this.order);
        alert('注文が更新されました');
        setTimeout(() => {
          this.$router.push('/history');
        }, 1000);
      } catch (error) {
        console.error('注文更新に失敗しました:', error);
        alert('注文更新に失敗しました');
      }
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}
.text-nowrap {
  white-space: nowrap;
}
</style>
