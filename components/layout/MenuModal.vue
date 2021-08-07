<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'LayoutMobileMenuModal',

  setup () {
    const { store } = useContext()
    const activeTab = computed(() => store.state.ui.activeTab)

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

    template(#header)
      template(v-if="walletId")
        .walletWrap
          WalletsItemWalletItem2(
            :id="walletId"
            vertical="center"
            size="xl"
          )

    template
      .content
        div(style="height: 16px")
        LayoutSidebarMenu

        div(style="padding: 0 16px 16px 16px")
          SharedContextMenuItem(
            :title="$t('theme.change')"
            icon="mdi mdi-palette"
            @onClick="$store.dispatch('ui/changeTheme')"
          )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

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
  border-radius $m7 $m7 0 0
  +media(600px)
    border-radius $m7
</style>
