<script>
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'CustomizeMenu',

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
div
  SharedContextMenuItem(
    :checkboxValue="ui.showPieChart"
    icon="mdi mdi-chart-pie"
    :title="$t('stat.customize.showcatsChartPie')"
    showCheckbox
    @onClick="toogleView('showPieChart')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showCatsVerticalChart"
    :title="$t('stat.customize.showCategorisChart')"
    icon="mdi mdi-poll"
    showCheckbox
    @onClick="toogleView('showCatsVerticalChart')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showRoundCats"
    :title="$t('stat.customize.showRoundCats')"
    icon="mdi mdi-chart-bubble"
    showCheckbox
    @onClick="toogleView('showRoundCats')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showCatsHorizontalList"
    :title="$t('stat.customize.showCategorisList')"
    icon="mdi mdi-chart-timeline"
    showCheckbox
    @onClick="toogleView('showCatsHorizontalList')"
  )
  SharedContextMenuItem(
    :checkboxValue="ui.showHistory"
    :title="$t('stat.customize.showHistory')"
    icon="mdi mdi-history"
    showCheckbox
    @onClick="toogleView('showHistory')"
  )
</template>

<style lang="stylus" scoped>
//
</style>
