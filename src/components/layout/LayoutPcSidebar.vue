<script>
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import WalletsList from '@/components/wallets/list/WalletsList'
import WalletsTotal from '@/components/wallets/total/WalletsTotal'
import Menu from '@/components/layout/sidebar/Menu'

export default {
  components: {
    Menu,
    ContextMenu,
    ContextMenuItem,
    WalletsList,
    WalletsTotal
  },

  data () {
    return {
      visibleSettingsMenu: false
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('showWalletModal')
      this.$store.commit('setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug" scoped>
.sidebar
  .sidebar__top
    .sidebar__menu
      ContextMenu(
        :position="{ left: true, top: true }"
        :visible="visibleSettingsMenu"
        v-on:onClickOpener="visibleSettingsMenu = !visibleSettingsMenu")
        template(slot="opener")
          .link(:class="{ _active: visibleSettingsMenu }"): .mdi.mdi-tune

        template(slot="content")
          ContextMenuItem(
            icon="mdi mdi-palette"
            title="Change theme"
            v-on:onClick="$store.dispatch('changeTheme')")
          ContextMenuItem(
            icon="mdi mdi-cog-outline"
            :title="$lang.settings.open"
            v-on:onClick="$store.dispatch('setActiveTab', 'settings')"
            v-on:onClose="visibleSettingsMenu = !visibleSettingsMenu")
          .context-menu-sep
          ContextMenuItem(
            icon="mdi mdi-logout"
            title="Sign Out"
            v-on:onClick="$store.dispatch('signOut')"
            v-on:onClose="visibleSettingsMenu = !visibleSettingsMenu")

      .sidebar__menu__item(
        :class="{ _active: activeTab === 'wallets'}"
        @click="$store.dispatch('setActiveTab', 'wallets')"
      ): .mdi.mdi-credit-card-multiple

      .sidebar__menu__item(
        :class="{ _active: activeTab === 'categories'}"
        @click="$store.dispatch('setActiveTab', 'categories')"
      ): .mdi.mdi-chart-bubble

      .sidebar__menu__item(
        :class="{ _active: activeTab === 'stat'}"
        @click="$store.dispatch('setActiveTab', 'stat')"
      ): .mdi.mdi-poll
  Menu

  .sidebar__content
    WalletsTotal

    WalletsList(
      :style="{ paddingTop: '8px' }"
      :showToogle="true"
      :limit="6"
      v-on:onClick="(id) => handleShowWalletModal(id)")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables"

.sidebar
  display grid
  grid-template-columns 1fr
  grid-template-rows minmax(auto, auto) minmax(auto, auto) 1fr
  height 100vh
  background var(--c-bg-4)
  border-right 1px solid var(--c-bg-1)

  &__menu
    display flex
    justify-content space-between
    padding 0 $m7
    background var(--c-bg-5)
    border-bottom 1px solid var(--c-bg-1)

    &__item
      position relative
      display inline-flex
      align-items center
      justify-content center
      padding $m7 $m8
      font-header-1()
      font-size 18px
      color var(--c-font-4)

      +media-laptop()
        padding 10px 20px

      &:hover
        @media $media-laptop
          background var(--c-bg-6)

      &._active
        color var(--c-font-2)

  &__content
    scrollbar()
    overflow hidden
    overflow-y auto
    height 100%

.link
  z-index 1
  padding $m7 $m8
  font-header-1()
  font-size 18px
  color var(--c-font-4)

  &:hover:not(._active)
    @media $media-laptop
      background var(--c-bg-6)
</style>
