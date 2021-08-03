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
Portal(
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="activeTab === 'menu'"
    @closed="$store.dispatch('ui/setActiveTab', 'stat')"
  )
    template(#handler="{ close }")
      .handler

      .handler__close(@click="close")
        svg(
          viewBox='0 0 24 24'
          fill='none'
          stroke='#000'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='3'
        )
          path(d='M.75 23.249l22.5-22.5')
          path(d='M23.25 23.249L.75.749')

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
        LayoutSidebarBaseMenu

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

  &__close
    z-index 3
    cursor pointer
    position absolute
    top 4px
    right 4px
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    border-radius 50%
    anim()

    +media-hover()
      background var(--c-blue-1)

    svg
      anim()
      width 12px
      height 12px
      stroke var(--c-font-4)

    +media-hover()
      svg
        width 12px
        height 12px
        stroke var(--c-font-1)

.content
  border-radius $m7 $m7 0 0
</style>
