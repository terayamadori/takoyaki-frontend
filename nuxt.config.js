export default {
  // サーバーサイドレンダリング (SSR) を無効化
  ssr: false, // 必要に応じて true に変更可能

  // ページヘッダーの設定
  head: {
    title: 'my-nuxt-app',
    htmlAttrs: {
      lang: 'en'
    },  
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // グローバルCSSの設定
  css: [],

  // プラグインの設定
  plugins: ['~/plugins/socket.js'],

  // 自動コンポーネントインポート
  components: true,

  // 開発とビルド用のモジュール
  buildModules: [],

  // 利用するモジュール
  modules: [
    'bootstrap-vue/nuxt',   // BootstrapVueの追加
    '@nuxtjs/axios',        // Axiosモジュールの追加
  ],

  // axiosの設定
  axios: {
    baseURL: process.env.API_URL || 'https://takoyakiapp.fly.dev', // バックエンドのAPI URLを指定
    credentials: true, // CORS対応でクッキーを含むリクエストを許可する場合
  },

  // サーバーサイドミドルウェアの追加
  serverMiddleware: [
    { path: '/api', handler: '~/server/api/orders.js' } // ルートパスとして/apiを設定
  ],

  // ビルド設定
  build: {
    vendor: [
      'socket.io-client'
    ] ,
  },

  // サーバー設定
  server: {
    host: '0.0.0.0', // 外部からアクセスする場合のホスト
    port: 8080       // Nuxt.jsアプリのポート番号
  },

  // 環境変数の設定
  env: {
    API_URL: process.env.API_URL || 'https://takoyakiapp.fly.dev', // APIのURL
    SOCKET_URL: process.env.SOCKET_URL || 'https://takoyakiapp.fly.dev',
  },
}