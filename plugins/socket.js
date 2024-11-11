// plugins/socket.js
import io from 'socket.io-client';

export default (context, inject) => {
  const socket = io(process.env.SOCKET_URL || 'http://localhost:3000');

  // 注文が更新されたときにリアルタイムでデータを再取得
  socket.on('orderUpdated', (orders) => {
    // Vuex ストアのミューテーションをコミットして注文データを更新
    context.store.commit('orders/SET_ORDERS', orders);
  });

  // 他のイベントも必要に応じてハンドリング可能
  // 例: 新しい注文が追加されたとき
  socket.on('newOrder', (order) => {
    context.store.commit('orders/ADD_ORDER', order);
  });

  inject('socket', socket);
};
