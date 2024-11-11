<template>
  <div class="container-fluid bg-dark mb-3">
      <div class="container">
          <nav class="navbar navbar-dark">
              <span class="navbar-brand mb-0 h1">注文管理アプリ</span>
              <div>
                  <nuxt-link to="./">
                      <button class="btn btn-success ms-2">お会計</button>
                  </nuxt-link>
                  <nuxt-link to="/TaskList">
                      <button class="btn btn-success ms-2">受け渡し</button>
                  </nuxt-link>
                  <nuxt-link to="/History">
                      <button class="btn btn-success ms-2">履歴</button>
                  </nuxt-link>
                  <nuxt-link to="/PriceSettings">
                      <button class="btn btn-success ms-2">売価設定</button>
                  </nuxt-link>
                  <nuxt-link to="/Sales">
                      <button class="btn btn-success ms-2">売上</button>
                  </nuxt-link>
              </div>
          </nav>
      </div>
  </div>
</template>
