import Vue from 'vue';
import Router from 'vue-router';
import History from '@/components/History.vue'; // 履歴ページ
import Edit from '@/components/Edit.vue'; // 編集ページ

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/history',
      name: 'history',
      component: History, // 修正：Historyコンポーネントを指定
    },
    {
      path: '/edit/:taskId',
      name: 'edit',
      component: Edit, // 修正：Editコンポーネントを指定
      props: true, // taskIdをプロパティとして渡す
    },
  ],
});
