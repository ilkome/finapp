<script>
export default {
}
</script>

<template lang="pug">
.loader
  .loader__wrap
    SharedAppName
    .loader__spiner
      SharedSpiner(theme="dark" size="lg")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'

.loader
  z-index 100
  position fixed
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 100%
  flex-flow column wrap
  background var(--c-bg-1)

  &__wrap
    display flex
    flex-flow column nowrap
    align-items center

  &__spiner
    height 48px
    margin-top 40px
</style>
