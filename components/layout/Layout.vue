<script>
import LayoutMobile from '~/components/layout/LayoutMobile'
import LayoutPc from '~/components/layout/LayoutPc'

export default {
  components: {
    LayoutMobile,
    LayoutPc
  }
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
