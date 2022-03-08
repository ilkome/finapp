<template lang="pug" scoped>
.sidebar.relative.bg-gray-50.dark_bg-custom5
  .sidebar__content
    .p-4.px-5.flex.items-center.justify-between
      .text-xl.font-bold.text-neutral-500.dark_text-neutral-200.font-nunito
        | {{ $t('appName') }}

      .text-xl.mdi.mdi-palette(@click="$store.dispatch('ui/changeTheme')")

    .pt-2.pb-8
      LayoutSidebarMenu

    .pb-12
      WalletsTotal
      WalletsList(
        :limit="6"
        showToogle
        uiSimple
        @onClick="id => $router.push(`/wallets/${id}`)"
      )

  .absolute.left-0.bottom-0.w-full
    //- .sidebar__trn.py-4(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create', isPc: true })")
    .sidebar__trn.py-4(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
      .btn: .mdi.mdi-plus
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
