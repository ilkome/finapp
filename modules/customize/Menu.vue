<script>
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'CustomizeMenu',

  props: {
    isShowMainChart: { type: Boolean, default: true },
    isShowHistory: { type: Boolean, default: true }
  },

  setup () {
    const { ui, setUI } = useUIView()

    function toogleView (name) {
      setUI({ name, value: !ui[name] })
    }

    return {
      ui,
      toogleView
    }
  }
}
</script>

<template lang="pug">
.menu
  SharedContextMenuItem(
    v-if="isShowMainChart"
    :checkboxValue="ui.showMainChart"
    :title="$t('chart.showMain')"
    showCheckbox
    @onClick="toogleView('showMainChart')"
  )

  SharedContextMenuItem(
    :checkboxValue="ui.showPieChart"
    :title="$t('stat.customize.showcatsChartPie')"
    showCheckbox
    @onClick="toogleView('showPieChart')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showCatsVerticalChart"
    :title="$t('stat.customize.showCategorisChart')"
    showCheckbox
    @onClick="toogleView('showCatsVerticalChart')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showRoundCats"
    :title="$t('stat.customize.showRoundCats')"
    showCheckbox
    @onClick="toogleView('showRoundCats')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showCatsHorizontalList"
    :title="$t('stat.customize.showCategorisList')"
    showCheckbox
    @onClick="toogleView('showCatsHorizontalList')"
  )
  SharedContextMenuItem(
    v-if="isShowHistory"
    :checkboxValue="ui.showHistory"
    :title="$t('stat.customize.showHistory')"
    showCheckbox
    @onClick="toogleView('showHistory')"
  )
</template>

<style lang="stylus" scoped>
//
</style>
