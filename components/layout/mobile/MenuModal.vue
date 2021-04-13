<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'LayoutMobileMenuModal',

  setup () {
    const { store } = useContext()
    const activeTab = computed(() => store.state.ui.activeTab)
    const activeTabStat = computed(() => store.state.ui.activeTabStat)

    const { ui, setUI } = useUIView()

    function toogleView (name) {
      setUI({ name, value: !ui[name] })
    }

    return {
      activeTab,
      activeTabStat,

      ui,
      toogleView
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="activeTab === 'menu'"
  to="modal"
)
  ModalBottom(
    key="menu"
    @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
  )
    LayoutSidebarBaseMenu
    .context-menu-sep

    template(v-if="activeTabStat === 'details' || activeTabStat === 'incomes' || activeTabStat === 'expenses'")
      SharedContextMenuItem(
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
        :checkboxValue="ui.showHistory"
        :title="$t('stat.customize.showHistory')"
        showCheckbox
        @onClick="toogleView('showHistory')"
      )
      .context-menu-sep

    SharedContextMenuItem(
      :title="$t('theme.change')"
      icon="mdi mdi-palette"
      @onClick="$store.dispatch('ui/changeTheme')"
    )
</template>

<style lang="stylus" scoped>
.context-menu-sep
  background var(--c-bg-2)
</style>
