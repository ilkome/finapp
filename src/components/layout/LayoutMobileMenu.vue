<script>
import Button from '@/components/shared/button/Button'
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'
import PeriodNavMobile from '@/components/layout/PeriodNavMobile'

export default {
  components: {
    Button,
    ContextMenu,
    ContextMenuItem,
    Dropdown,
    PeriodNavMobile
  },

  data () {
    return {
      visibleCustomizeMenu: false,
      menu: [{
        icon: 'mdi mdi-credit-card-multiple',
        id: 'wallets',
        name: 'Wallets'
      }, {
        icon: 'mdi mdi-chart-bubble',
        id: 'categories',
        name: 'Cats'
      }, {
        icon: 'mdi mdi-poll',
        id: 'stat',
        name: 'Stat'
      }, {
        icon: 'mdi mdi-history',
        id: 'history',
        name: 'Trns'
      }]
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  methods: {
    getClassName (tab) {
      if (this.$store.state.ui.activeTab === 'stat') {
        if (tab === this.$store.state.ui.stat.activeTab) {
          return {
            '_active': true
          }
        }
      } else {
        if (this.$store.state.ui.activeTab === tab) {
          return {
            '_active': true
          }
        }
      }
    },
    handleSetActiveTab (tab) {
      switch (tab) {
        case 'stat':
          this.$store.dispatch('setActiveTab', 'stat')
          this.$store.dispatch('setActiveTabStat', 'stat')
          break
        case 'history':
          this.$store.dispatch('setActiveTab', 'stat')
          this.$store.dispatch('setActiveTabStat', 'history')
          break
        default:
          this.$store.dispatch('setActiveTab', tab)
      }
    }
  }
}
</script>

<template lang="pug">
.menu
  .menu__row
    PeriodNavMobile(v-show="activeTab === 'stat' || activeTab === 'trns'")

    .create-btn(v-show="activeTab === 'categories'")
      Button(
        className="_inline _small"
        title="New category"
        v-on:onClick="$store.dispatch('setActiveTab', 'createCategory')")

    .create-btn(v-show="activeTab === 'wallets'")
      Button(
        className="_inline _small"
        title="New wallet"
        v-on:onClick="$store.dispatch('setActiveTab', 'createWallet')")

    .customize(v-show="activeTab !== 'stat' && activeTab !== 'trns'")
      ContextMenu(
        :position="{ right: true, bottom: true }"
        :visible="visibleCustomizeMenu"
        v-on:onClickOpener="visibleCustomizeMenu = !visibleCustomizeMenu")
        template(slot="opener")
          Dropdown(
            :active="visibleCustomizeMenu"
            icon="mdi mdi-tune"
            title="Options")
        template(slot="content")
          ContextMenuItem(
            icon="mdi mdi-logout"
            title="Sign Out"
            v-on:onClick="$store.dispatch('signOut')"
            v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
          .context-menu-sep
          ContextMenuItem(
            icon="mdi mdi-palette"
            title="Change theme"
            v-on:onClick="$store.dispatch('changeTheme')"
            v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
          ContextMenuItem(
            icon="mdi mdi-chart-bubble"
            title="Last cats in TrnForm"
            :checkValue="$store.state.ui.lastUsedCatsInTrnForm === 'visible'"
            v-on:onClick="$store.dispatch('toogleLastUsedCatsInTrnForm')"
            v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")

  .menu__row
    template(v-for="menuItem of menu")
      .menu__item(
        :key="menuItem.id"
        :class="getClassName(menuItem.id)"
        @click="handleSetActiveTab(menuItem.id)")
        .menu__item__icon: div(:class="menuItem.icon")
        .menu__item__text {{ menuItem.name }}

    .menu__item._hightlight(@click="$store.dispatch('openTrnForm', { action: 'create' })")
      .menu__item__icon: .mdi.mdi-library-plus
      .menu__item__text Create
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.create-btn
  flex-grow 1
  padding-left $m7

.customize
  display flex
  justify-content flex-end
  flex-grow 1
  padding-right $m7

.menu
  z-index 2
  position fixed
  left 0
  bottom 0
  display grid
  grid-row-gap $m5
  padding-top $m6
  width 100%
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-1)

  /.theme-light &
    background var(--c-bg-4)

  &__row
    display flex
    align-items center
    justify-content center
    // height 66px

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    flex-flow column
    padding $m6 0 $m6 0
    color var(--c-font-4)

    /.theme-light &
      color var(--c-font-5)

    &._hightlight
      // border-left 1px solid rgba(128,128,128,0.05)

    &._active
      color var(--c-font-2)

    &__icon
      margin-bottom $m5
      font-size 26px

    &__text
      font-size 12px
</style>
