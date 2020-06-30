<script>
import localforage from 'localforage'
import ContextMenu from '~/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '~/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '~/components/shared/dropdown/Dropdown'

export default {
  components: {
    ContextMenu,
    ContextMenuItem,
    Dropdown
  },

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
      localforage.setItem('next.chart.periods', this.periods)
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
  @onClickOpener="visibleContextMenu = !visibleContextMenu")

  template(v-if="showDropdown")
    template(slot="opener")
      Dropdown._noBd(
        :active="visibleContextMenu"
        title="Chart")

  template(slot="content")
    template(v-if="filterPeriod !== 'year'")
      ContextMenuItem(
        icon="mdi mdi-ungroup"
        :title="periods[filterPeriod].grouped ? 'Simple charts' : 'Grouped charts'"
        @onClick="toogleChartsView")

    ContextMenuItem(
      icon="mdi mdi-plus"
      :title="periods[filterPeriod].grouped ? 'Add group' : 'Add period'"
      @onClick="addPeriodOrGroup")

    ContextMenuItem(
      v-if="(periods[filterPeriod].grouped && periods[filterPeriod].showedGroups > 1) || (!periods[filterPeriod].grouped && periods[filterPeriod].showedPeriods > 1)"
      icon="mdi mdi-minus"
      :title="periods[filterPeriod].grouped ? 'Remove group' : 'Remove period'"
      @onClick="removePeriodOrGroup")

  template(slot="desc")
    template(v-if="periods[filterPeriod].grouped") Showed {{ periods[filterPeriod].showedGroups }} groups
    template(v-else) Showed {{ periods[filterPeriod].showedPeriods }} periods
</template>
