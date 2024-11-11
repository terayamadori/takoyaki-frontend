import io from 'socket.io-client';

// store/orders.js

export const state = () => ({
  orders: []
});

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders;
  },
  ADD_ORDER(state, order) {
    state.orders.push(order);
  },
  UPDATE_ORDER(state, updatedOrder) {
    const index = state.orders.findIndex(order => order.id === updatedOrder.id);
    if (index !== -1) {
      this.commit('orders/SET_ORDERS', [
        ...state.orders.slice(0, index),
        updatedOrder,
        ...state.orders.slice(index + 1)
      ]);
    }
  },
  DELETE_ORDER(state, orderId) {
    state.orders = state.orders.filter(order => order.id !== orderId);
  }
};

export const actions = {
  async fetchOrders({ commit }) {
    try {
      const orders = await this.$axios.$get('/api/orders');
      commit('SET_ORDERS', orders);
    } catch (error) {
      console.error('注文データの取得に失敗しました:', error.message);
    }
  },
};
