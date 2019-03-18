<script>
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'

export default {
  components: {
    ContextMenu,
    ContextMenuItem,
    Dropdown
  },

  data () {
    return {
      visibleCustomizeMenu: false
    }
  }
}
</script>

<template lang="pug">
ContextMenu(
  :position="{ left: true, bottom: true }"
  :visible="visibleCustomizeMenu"
  v-on:onClickOpener="visibleCustomizeMenu = !visibleCustomizeMenu")
  template(slot="opener")
    Dropdown._inline(
      :active="visibleCustomizeMenu"
      :title="$lang.settings.customize")
  template(slot="content")
    ContextMenuItem(
      icon="mdi mdi-credit-card-multiple"
      title="Wallets"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.stat.walletsVisibility === 'visible'"
      v-on:onClick="$store.dispatch('toogleStatWalletsVisibility')")
    ContextMenuItem(
      icon="mdi mdi-chart-bar-stacked"
      title="Periods chart"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.statGraphsVisibility === 'visible'"
      v-on:onClick="$store.dispatch('toogleShowStatGraphs')")
    ContextMenuItem(
      icon="mdi mdi-numeric"
      title="Summary"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.statSummuryVisibility === 'visible'"
      v-on:onClick="$store.dispatch('toogleStatSummuryVisibility')")
    ContextMenuItem(
      icon="mdi mdi-chart-bubble"
      title="Stat categories chart"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.catsChart === 'visible'"
      v-on:onClick="$store.dispatch('toogleVisibleCatsChart')")
    ContextMenuItem(
      icon="mdi mdi-chart-gantt"
      title="Stat categories list"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.statItems === 'visible'"
      v-on:onClick="$store.dispatch('toogleVisibilityStatItems')")
    .context-menu-sep
    ContextMenuItem(
      icon="mdi mdi-palette"
      title="Change theme"
      v-on:onClick="$store.dispatch('changeTheme')")
</template>

<style lang="stylus" scoped>

</style>
