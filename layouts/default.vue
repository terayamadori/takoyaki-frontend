<template>
  <div>
    <header>
      <HeaderComponent/>
    </header>
    <Nuxt />
  </div>
</template>

<script>
import HeaderComponent from '~/components/HeaderComponent.vue'

export default {
  components: {
    HeaderComponent
  }
}
</script>

<style>
/* 必要に応じてスタイルを追加 */
</style>
