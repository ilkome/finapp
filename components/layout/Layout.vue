<script>
export default {
}
</script>

<template lang="pug">
.layout
  LayoutMobile(v-if="$store.state.ui.mobile")
  LayoutPc(v-if="$store.state.ui.pc")
</template>

<style lang="stylus" scoped>
.layout
  height 100%
</style>
