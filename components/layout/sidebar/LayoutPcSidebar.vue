<script>
export default {
  name: 'LayoutPcSidebar',

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
      this.$store.commit('wallets/showWalletModal')
      this.$store.commit('wallets/setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug" scoped>
.sidebar
  BaseMenu

  .sidebar__content
    WalletsTotal

    WalletsList(
      :showToogle="true"
      :limit="6"
      @onClick="(id) => handleShowWalletModal(id)")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.sidebar
  display grid
  grid-template-columns 1fr
  grid-template-rows minmax(auto, auto) minmax(auto, auto) 1fr
  height 100vh
  background var(--c-bg-4)
  border-right 1px solid var(--c-bg-2)

  &__content
    scrollbar()
    overflow hidden
    overflow-y auto
    height 100%
</style>
