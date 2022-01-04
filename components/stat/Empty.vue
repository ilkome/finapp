<script>
import { defineComponent } from '#app'
import useStat from '~/modules/stat/useStat'

export default defineComponent({
  setup () {
    const { isEmptyStat } = useStat()

    return {
      isEmptyStat
    }
  }
})
</script>

<template lang="pug">
.noStat.overflow-hidden.py-8.px-3(v-if="isEmptyStat")
  .noStat__title {{ $t('stat.empty') }}
  .noStat__desc {{ $t('stat.emptyDesc') }}
</template>

<style lang="stylus" scoped>
.noStat
  color var(--c-font-3)
  text-align center

  &__title
    padding-bottom $m6
    font-size 22px

  &__desc
    color var(--c-font-4)
    font-size 14px
</style>
