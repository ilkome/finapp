<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'LayoutMobileMenuModal',

  setup () {
    const { store } = useContext()
    const activeTab = computed(() => store.state.ui.activeTab)
    const activeTabStat = computed(() => store.state.ui.activeTabStat)

    return {
      activeTab,
      activeTabStat
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
      CustomizeMenu
      .context-menu-sep

    SharedContextMenuItem(
      :title="$t('theme.change')"
      icon="mdi mdi-palette"
      @onClick="$store.dispatch('ui/changeTheme')"
    )
</template>
