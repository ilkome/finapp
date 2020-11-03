<script>
import localforage from 'localforage'

export default {
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
    }
  },

  methods: {
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
ContextMenu(
  :position="{ right: showDropdown ? '-12px' : true }"
  :visible="visibleContextMenu"
  :openerCircle="true"
  @onClickOpener="visibleContextMenu = !visibleContextMenu"
)

  template(v-if="showDropdown")
    template(slot="opener")
      Dropdown._noBd(
        :active="visibleContextMenu"
        :title="$t('chart.title')"
      )

  template(slot="content")
    template(v-if="filterPeriod !== 'year'")
      ContextMenuItem(
        icon="mdi mdi-ungroup"
        :title="periods[filterPeriod].grouped ? $t('chart.view.groupedTitle') : $t('chart.view.simpleTitle')"
        @onClick="toogleChartsView")

    ContextMenuItem(
      icon="mdi mdi-plus"
      :title="periods[filterPeriod].grouped ? $t('chart.view.addGroupButton') : $t('chart.view.addPeriodButton')"
      @onClick="addPeriodOrGroup"
    )

    ContextMenuItem(
      v-if="(periods[filterPeriod].grouped && periods[filterPeriod].showedGroups > 1) || (!periods[filterPeriod].grouped && periods[filterPeriod].showedPeriods > 1)"
      icon="mdi mdi-minus"
      :title="periods[filterPeriod].grouped ? $t('chart.view.removeGroupButton') : $t('chart.view.removePeriodButton')"
      @onClick="removePeriodOrGroup"
    )

  template(slot="desc")
    template(v-if="periods[filterPeriod].grouped") {{ $t('chart.view.showed') }} {{ periods[filterPeriod].showedGroups }} {{ $t('chart.view.groupsName') }}
    template(v-else) {{ $t('chart.view.showed') }} {{ periods[filterPeriod].showedPeriods }}  {{ $t('chart.view.periodsName') }}
</template>
