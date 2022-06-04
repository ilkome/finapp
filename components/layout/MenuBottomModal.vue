<script setup lang="ts">
const { $store } = useNuxtApp()
const activeTab = computed(() => $store.state.ui.activeTab)
const onClickTheme = (close) => {
  $store.dispatch('ui/changeTheme')
  console.log(close)
  close && close()
}
</script>

<template lang="pug">
Portal(to="modal")
  LazyBaseBottomSheet(
    v-if="activeTab === 'menu'"
    @closed="$store.dispatch('ui/setActiveTab', null)"
  )
    template(#handler="{ close }")
      .handler
      BaseBottomSheetClose(@onClick="close")

    template(#default="{ close }")
      .content(class="!overflow-hidden !pt-8 !pb-2")
        //- User
        .mb-4.pb-4.border-b.border-neutral-300.dark_border-neutral-800
          .mx-6.mb-2.dark_text-neutral-300
            .text-xl.font-nunito.font-semibold {{ $store.state.user.user.displayName }}
            .text-sm.text-gray-900.dark_text-neutral-500 {{ $store.state.user.user.email }}

          .cursor-pointer.py-3.px-6.space-x-5.flex.items-center.hocus_bg-white2.dark_hocus_bg-custom1(
            @click="$store.dispatch('user/signOut')"
          )
            .text-xl.mdi.mdi-logout
            .text-sm {{ $t('userLogout') }}

        //- Main Menu
        LayoutSidebarMenu

        //- Theme
        .cursor-pointer.flex.items-center.py-3.px-6.space-x-5.text-slate-600.dark_text-neutral-400.hocus_bg-zinc-100.dark_hocus_bg-neutral-800(
          @click="onClickTheme(close)"
        )
          .text-xl.mdi.mdi-palette
          .text-sm {{ $t('theme.change') }}
</template>

<style lang="stylus" scoped>
.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

  &:after
    content ''
    display block
    width 32px
    height 4px
    background var(--c-bg-8)
    border-radius 4px

.content
  padding 0
  background var(--c-bg-3)
  border-radius $m7 $m7 0 0
  +media(600px)
    border-radius $m7
</style>
