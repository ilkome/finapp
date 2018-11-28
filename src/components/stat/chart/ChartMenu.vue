<script>
import localforage from 'localforage'
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'

export default {
  components: {
    ContextMenu,
    ContextMenuItem
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
        ? this.$store.commit('addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })

      // Should remove?
      // this.$nextTick(() => {
      //   const box = document.querySelector('.charts__items')
      //   if (box) box.scrollLeft = box.clientWidth
      // })
      this.saveChartsPeriodsToLocalStorage()
    },

    removePeriodOrGroup () {
      this.periods[this.filterPeriod].grouped
        ? this.$store.commit('removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    toogleChartsView () {
      this.visibleContextMenu = !this.visibleContextMenu
      this.$store.commit('toogleChartPeriodView', { periodName: this.filterPeriod })
      this.saveChartsPeriodsToLocalStorage()
    },

    saveChartsPeriodsToLocalStorage () {
      localforage.setItem('next.chart.periods', this.periods)
    }
  }
}
</script>

<template lang="pug">
ContextMenu(
  :position="{ right: true }"
  :visible="visibleContextMenu"
  :openerCircle="true"
  v-on:onClickOpener="visibleContextMenu = !visibleContextMenu"
)
  template(slot="content")
    template(v-if="filterPeriod !== 'year'")
      ContextMenuItem(
        icon="mdi mdi-ungroup"
        :title="periods[filterPeriod].grouped ? 'Simple charts' : 'Grouped charts'"
        v-on:onClick="toogleChartsView"
      )
    ContextMenuItem(
      icon="mdi mdi-plus"
      :title="periods[filterPeriod].grouped ? 'Add group' : 'Add period'"
      v-on:onClick="addPeriodOrGroup"
    )
    ContextMenuItem(
      v-if="(periods[filterPeriod].grouped && periods[filterPeriod].showedGroups > 1) || (!periods[filterPeriod].grouped && periods[filterPeriod].showedPeriods > 1)"
      icon="mdi mdi-minus"
      :title="periods[filterPeriod].grouped ? 'Remove group' : 'Remove period'"
      v-on:onClick="removePeriodOrGroup"
    )

  template(slot="desc")
    template(v-if="periods[filterPeriod].grouped") Showed {{ periods[filterPeriod].showedGroups }} groups
    template(v-else) Showed {{ periods[filterPeriod].showedPeriods }} periods
</template>
