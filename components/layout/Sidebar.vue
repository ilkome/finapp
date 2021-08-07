<script>
export default {
  name: 'LayoutSidebar',

  methods: {
    handleShowWalletsModalWalletModal (id) {
      this.$store.commit('wallets/showWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', id)
    }
  }
}
</script>

<template lang="pug" scoped>
.sidebar
  LayoutSidebarMenu

  .sidebar__content
    WalletsTotal

    WalletsList(
      :showToogle="true"
      :limit="6"
      @onClick="(id) => handleShowWalletsModalWalletModal(id)")

  .sidebar__trn(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
    .btn
      .mdi.mdi-plus
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.sidebar
  display grid
  grid-template-columns 1fr
  grid-template-rows minmax(auto, auto) minmax(auto, auto) 1fr
  height 100vh
  min-width 280px
  background var(--c-bg-4)
  border-right 1px solid var(--c-bg-2)

  &__content
    scrollbar()
    overflow hidden
    overflow-y auto
    height 100%
    padding-bottom $m9

  &__trn
    cursor pointer
    display flex
    align-items flex-end
    justify-content center
    padding-bottom $m10
    anim()

    +media-hover()
      background var(--c-bg-5)

      .btn
        transform scale(1.3)

    .btn
      display flex
      align-items center
      justify-content center
      width 48px
      height 48px
      color var(--c-font-1)
      font-size 32px
      background var(--c-blue-1)
      border-radius 50%
      anim()
</style>
