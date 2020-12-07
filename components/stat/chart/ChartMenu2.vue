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
      if (this.periodName !== 'year') {
        this.$store.commit('chart/toogleChartPeriodView', { periodName: this.periodName })
      }
    },

    addPeriodOrGroup () {
      if (this.periods[this.filterPeriod].grouped) {
        this.$store.commit('chart/toogleChartPeriodView', { periodName: this.filterPeriod })
      }

      this.periods[this.filterPeriod].grouped
        ? this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    removePeriodOrGroup () {
      if (this.periods[this.filterPeriod].grouped) {
        this.$store.commit('chart/toogleChartPeriodView', { periodName: this.filterPeriod })
      }

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
      localforage.setItem('finapp.chart.periods', this.$store.state.chart.periods)
      this.$store.dispatch('ui/saveUiView')
    }
  }
}
</script>

<template lang="pug">
.chartMenu
  //- .chartMenu__name(
  //-   v-if="filterPeriod !== 'all'"
  //-   @click="toogleView"
  //- )
  //- ) {{ $store.state.chart.periods[filterPeriod].showedPeriods }} {{ $t(`dates.${periodName}.simple`) }}

  .chartMenu__content
    ContextMenu(
      :position="{ right: '0px', top: '38px' }"
      :visible="visibleContextMenu"
      @onClickOpener="visibleContextMenu = !visibleContextMenu"
    )
      template(slot="opener")
        Dropdown._noBd.date(:active="visibleContextMenu")
          template(slot="title")
            //- Date
            //- .activrPeriodName {{ $t(`dates.${$store.state.filter.period}.simple`) }}
      template(
        slot="desc"
        v-if="filterPeriod !== 'all'"
      ) {{ $store.state.chart.periods[filterPeriod].showedPeriods }} {{ $t(`dates.${periodName}.simple`) }}

      template(slot="content")
        ContextMenuItem(
          :title="$t('chart.view.remove')"
          icon="mdi mdi-minus"
          @onClick="removePeriodOrGroup"
        )
        ContextMenuItem(
          :title="$t('chart.view.add')"
          icon="mdi mdi-plus"
          @onClick="addPeriodOrGroup"
        )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.chartMenu
  z-index 8
  position absolute
  right 0
  bottom 8px
  display flex
  align-items center
  justify-content space-between
  margin 0
  padding 0 $m7

  &__name
    flex-grow 1
    color var(--c-font-5)
    font-size 8px
    text-transform uppercase

  &__content
    display flex
    align-items stretch
    justify-content stretch
    width 32px

    &._active
      border-left 1px solid var(--c-bg-4)

    &._grow
      flex-grow 1
      justify-content space-between

  &__item
    opacity .6
    display flex
    align-items center
    justify-content center
    padding 0 $m6
    font-size 12px
    text-align center

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
