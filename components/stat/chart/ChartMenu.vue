<script>
import localforage from 'localforage'
import useChart from '~/components/chart/useChart'

export default {
  props: {
    showDropdown: {
      type: Boolean,
      default: false
    }
  },

  setup () {
    // Chart
    const { isShowDataLabels } = useChart()

    return {
      isShowDataLabels
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
      this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    removePeriodOrGroup () {
      this.$store.commit('chart/removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    toogleChartsView () {
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
SharedContextMenu(
  v-if="filterPeriod !== 'all'"
  :position="{ right: showDropdown ? '-12px' : true }"
  :visible="visibleContextMenu"
  :openerCircle="true"
  @onClickOpener="visibleContextMenu = !visibleContextMenu"
)

  template(v-if="showDropdown")
    template(slot="opener")
      SharedDropdown._noBd(
        :active="visibleContextMenu"
        :title="$t('chart.title')"
      )

  template(slot="content")
    SharedContextMenuItem(
      icon="mdi mdi-subtitles-outline"
      :selected="isShowDataLabels"
      title="Show labels"
      @onClick="isShowDataLabels = !isShowDataLabels"
    )

    SharedContextMenuItem(
      :icon="periods[filterPeriod].grouped ? 'mdi mdi-chart-bar' : 'mdi mdi-chart-line'"
      :title="periods[filterPeriod].grouped ? $t('chart.view.groupedTitle') : $t('chart.view.simpleTitle')"
      @onClick="toogleChartsView"
    )

    .context-menu-sep

    SharedContextMenuItem(
      icon="mdi mdi-plus"
      :title="$t('chart.view.addPeriodButton')"
      @onClick="addPeriodOrGroup"
    )

    SharedContextMenuItem(
      v-if="periods[filterPeriod].showedPeriods > 1"
      icon="mdi mdi-minus"
      :title="$t('chart.view.removePeriodButton')"
      @onClick="removePeriodOrGroup"
    )

  template(slot="desc") {{ $t('chart.view.showed') }} {{ periods[filterPeriod].showedPeriods }}  {{ $t('chart.view.periodsName') }}
</template>
