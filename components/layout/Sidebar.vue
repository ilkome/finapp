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
</style>
