<script>
import AppName from '@/components/shared/appName/AppName'
import Spiner from '@/components/shared/spiner/Spiner'

export default {
  components: {
    AppName,
    Spiner
  }
}
</script>

<template lang="pug">
.loader
  .loader__wrap
    Spiner(theme="dark")
    AppName
</template>

<style lang="stylus" scoped>
.loader
  z-index 100
  position fixed
  display flex
  align-items center
  justify-content center
  flex-flow column wrap
  left 0
  top 0
  width 100%
  height 100%
  background var(--c-bg-1)

  &__wrap
    display flex
    flex-flow column nowrap
    align-items center
</style>
