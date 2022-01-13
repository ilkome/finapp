<script lang="ts">
export default defineComponent({
  methods: {
    handleShowWalletsModalWalletModal (id) {
      this.$store.commit('wallets/showWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', id)
    }
  }
})
</script>

<template lang="pug" scoped>
.sidebar.bg-white2(
  class="dark:bg-custom5"
)
  .sidebar__content
    .p-4.px-5.flex.items-center.justify-between
      .font-nunito.text-xl.font-bold.text-neutral-500(
        class="dark:text-neutral-200"
      )  {{ $t('appName') }}

      .text-xl.mdi.mdi-palette(
        @click="$store.dispatch('ui/changeTheme')"
      )

    .pt-2.pb-8
      LayoutSidebarMenu

    WalletsTotal
    WalletsList(
      :showToogle="true"
      :limit="6"
      ui="simple"
      @onClick="(id) => handleShowWalletsModalWalletModal(id)"
    )

  .sidebar__trn.py-2(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
    .btn
      .mdi.mdi-plus
</template>

<style lang="stylus" scoped>
.sidebar
  display grid
  grid-template-columns 1fr
  grid-template-rows minmax(auto, auto) 1fr
  height 100vh
  min-width 280px

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
