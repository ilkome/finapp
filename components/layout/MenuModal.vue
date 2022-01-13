<script>
import { computed, useNuxtApp } from '#app'

export default {
  setup () {
    const { $store } = useNuxtApp()
    const activeTab = computed(() => $store.state.ui.activeTab)

    return {
      activeTab
    }
  }
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

    .content(class="!overflow-hidden !pt-8 !pb-2")
      .mb-4.pb-4.border-b(
        class="border-neutral-300 dark:border-neutral-800"
      )
        .mx-6.mb-2(
          class="dark:text-neutral-300"
        )
          .text-xl.font-nunito.font-semibold {{ $store.state.user.user.displayName }}
          .text-sm.text-gray-900(class="dark:text-neutral-500") {{ $store.state.user.user.email }}

        .py-3.px-6.space-x-5.flex.items-center(
          class="hocus:bg-white2 dark:hocus:bg-custom1"
          @click="$store.dispatch('user/signOut')"
        )
          .text-xl.mdi.mdi-logout
          .text-sm {{ $t('userLogout') }}

      LayoutMenuModalItems
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
  border-radius $m7 $m7 0 0
  +media(600px)
    border-radius $m7
</style>
