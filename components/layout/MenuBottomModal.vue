<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'

const { $store } = useNuxtApp()
const activeTab = computed(() => $store.state.ui.activeTab)

function onClickTheme(close: unknown) {
  $store.dispatch('ui/changeTheme')
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
      div(:class="getStyles('modal', ['bg', 'rounded', 'padding1'])")
        //- User
        .mx-4.mb-2.dark_text-neutral-300
          .text-xl.font-nunito.font-semibold {{ $store.state.user.user.displayName }}
          .text-sm.text-gray-900.dark_text-neutral-500 {{ $store.state.user.user.email }}

        //- Main Menu
        LayoutSidebarMenu(variant="modal")

        //- Theme
        div(
          :class="getStyles('item', ['link', 'rounded', 'menu', 'menuModal'])"
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
</style>
