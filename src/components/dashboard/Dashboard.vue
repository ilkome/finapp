<script>
import DashboardFilter from '@/components/dashboard/DashboardFilter'
import DashboardNav from '@/components/dashboard/DashboardNav'
import StatChartsLine from '@/components/stat/StatChartsLine'
import StatSummaryPc from '@/components/stat/StatSummaryPc'
import StatPc from '@/components/stat/StatPc'

export default {
  components: {
    DashboardFilter,
    DashboardNav,
    StatChartsLine,
    StatPc,
    StatSummaryPc
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  }
}
</script>

<template lang="pug">
.statMain(v-show="activeTab === 'stat'")
  StatChartsLine

  .statMain__info
    DashboardNav
    StatSummaryPc
  DashboardFilter

  slot
  StatPc
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/scrollbar"

.statMain
  scrollbar()
  overflow hidden
  overflow-y auto

  &__info
    position relative
    padding $m9 $mb2
    background var(--c-bg-3)
    border-bottom 1px solid var(--c-bg-1)

    @media $media-laptop
      padding $m9 $mb2

    @media $media-xl
      padding $m9 $mb2
</style>
