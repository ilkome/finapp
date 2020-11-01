<script>
import localforage from 'localforage'

export default {
  name: 'ChartMenu2',

  props: {
    showDropdown: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      visibleContextMenu: false
    }
  },

  computed: {
    filterPeriod () {
      return this.$store.state.filter.period
    },
    periods () {
      return this.$store.state.chart.periods
    },
    periodName () {
      return this.$store.state.filter.period
    }
  },

  methods: {
    toogleView () {
      this.$store.commit('chart/toogleChartPeriodView', { periodName: this.periodName })
    },

    addPeriodOrGroup () {
      this.periods[this.filterPeriod].grouped
        ? this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    removePeriodOrGroup () {
      this.periods[this.filterPeriod].grouped
        ? this.$store.commit('chart/removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('chart/removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    toogleChartsView () {
      this.visibleContextMenu = !this.visibleContextMenu
      this.$store.commit('chart/toogleChartPeriodView', { periodName: this.filterPeriod })
      this.saveChartsPeriodsToLocalStorage()
    },

    saveChartsPeriodsToLocalStorage () {
      localforage.setItem('finapp.chart.periods', this.periods)
      this.$store.dispatch('ui/saveUiView')
    }
  }
}
</script>

<template lang="pug">
.switcher
  .switcher__name(@click="toogleView")
    template(v-if="periods[filterPeriod].grouped") {{ periods[filterPeriod].showedGroups }} {{ $t('chart.view.groupsName') }}
    template(v-else) {{ periods[filterPeriod].showedPeriods }} {{ $t(`dates.${periodName}.simple`) }}

  .switcher__content(:class="{ _active: visibleContextMenu}")
    .switcher__item(
      v-if="!visibleContextMenu"
      @click="visibleContextMenu = !visibleContextMenu"
    ): .mdi.mdi-dots-horizontal

    template(v-if="visibleContextMenu")
      .switcher__item(@click="toogleView") {{ $t('chart.view.toogle') }}
      .switcher__item(
        v-if="(periods[filterPeriod].grouped && periods[filterPeriod].showedGroups > 1) || (!periods[filterPeriod].grouped && periods[filterPeriod].showedPeriods > 1)"
        @click="removePeriodOrGroup"
      ) {{ $t('chart.view.remove') }}
      .switcher__item(@click="addPeriodOrGroup") {{ $t('chart.view.add') }}
      .switcher__item(
        @click="visibleContextMenu = !visibleContextMenu"
      ): .mdi.mdi-close
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.switcher
  position relative
  display flex
  align-items center
  justify-content space-between
  z-index 15
  // padding 0 $m5
  margin-bottom $m6
  border-radius 8px 8px 0 0
  overflow hidden
  border-bottom 1px solid var(--c-bg-4)

  &__name
    flex-grow 1
    font-size 10px
    text-transform uppercase
    color var(--c-font-5)
    padding-left $m6

  &__content
    display flex
    align-items stretch
    justify-content stretch

    &._active
      border-left 1px solid var(--c-bg-4)

    &._grow
      flex-grow 1
      justify-content space-between

  &__item
    display flex
    align-items center
    justify-content center
    text-align center
    opacity .6
    min-width 48px
    padding $m5 $m7
    font-size 12px

    .mdi
      font-size 16px

    &._grow
      flex-grow 1

    +media-hover()
      background var(--c-bg-3)

    &._active
      opacity 1
      background var(--c-bg-8)
</style>
