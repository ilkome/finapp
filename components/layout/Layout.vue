<script>
export default {
}
</script>

<template lang="pug">
.layout
  LazyLayoutMobile(v-if="$store.state.ui.mobile")
  LazyLayoutPc(v-if="$store.state.ui.pc")
</template>

<style lang="stylus" scoped>
.layout
  height 100%
</style>
