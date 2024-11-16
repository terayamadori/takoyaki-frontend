# my-nuxt-app

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

### デプロイコマンド
- 認証
```
fly auth login
```

- ローンチ
```
fly launch
```

- デプロイ
```
fly deploy
```

- 環境変数設定
```
fly secrets set SOCKET_URL=[デプロイ後のSOCKET_URL]
fly secrets set API_URL=[デプロイ後のURL]
```
