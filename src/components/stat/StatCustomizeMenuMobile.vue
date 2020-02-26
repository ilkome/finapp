<script>
import Button from '@/components/shared/button/Button'
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'

export default {
  components: {
    Button,
    ContextMenu,
    ContextMenuItem,
    Dropdown
  },

  props: {
    icon: {
      type: String,
      default: null
    },
    position: {
      type: Object,
      default: () => ({
        left: true,
        bottom: true
      })
    }
  },

  data () {
    return {
      visibleCustomizeMenu: false
    }
  },

  computed: {
    positionStyles () {
      const styles = { ...this.position }
      return styles
    }
  }
}
</script>

<template lang="pug">
ContextMenu(
  :position="position"
  :visible="visibleCustomizeMenu"
  v-on:onClickOpener="visibleCustomizeMenu = !visibleCustomizeMenu")
  template(slot="opener")
    template(v-if="icon")
      Button._border._square(
        :icon="icon")
    template(v-else)
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
      icon="mdi mdi-history"
      title="Stat categories list"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.statItems === 'visible'"
      v-on:onClick="$store.dispatch('toogleVisibilityStatItems')")
    ContextMenuItem(
      icon="mdi mdi-history"
      title="Last trns"
      :showCheckbox="true"
      :checkboxValue="$store.state.ui.statLastTrnsVisibility === 'visible'"
      v-on:onClick="$store.dispatch('toogleStatLastTrnsVisibility')")
    .context-menu-sep
    ContextMenuItem(
      icon="mdi mdi-palette"
      title="Change theme"
      v-on:onClick="$store.dispatch('changeTheme')")
</template>
