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
      .mb-2.mx-6.pb-6.flex.items-center.justify-between.border-b.border-neutral-800
        .text-neutral-400
          .text-lg {{ $store.state.user.user.displayName }}
          .text-sm {{ $store.state.user.user.email }}

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
