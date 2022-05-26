<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'

const { $store } = useNuxtApp()
const { onClick, checkIsActive } = useMenuData()
const activeTab = computed(() => $store.state.ui.activeTab)
</script>

<template lang="pug">
.menu
  LazyLayoutMenuBottomModal(v-if="activeTab === 'menu'")

  .grid.mx-auto.max-w-xl
    .menu__row
      //- Wallets
      .menu__item.group(
        :class="{ _active: checkIsActive('wallets') }"
        @click="onClick('wallets')"
      )
        UiIconWallet.w-6.h-6.md_w-8.md_h-8(
          :class="{ 'text-blue3 dark_text-white': checkIsActive('wallets'), 'group-hover_text-white': !checkIsActive('wallets') }"
        )

      //- Categories
      .menu__item.group(
        :class="{ _active: checkIsActive('categories') }"
        @click="onClick('categories')"
      )
        UiIconCategory.w-6.h-6.md_w-8.md_h-8(
          :class="{ 'text-blue3 dark_text-white': checkIsActive('categories'), 'group-hover_text-white': !checkIsActive('categories') }"
        )

      .openTrnForm(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
        svg(
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        )
          path(d='M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z')

      //- Stat
      .menu__item.group(
        :class="{ _active: checkIsActive('index') }"
        @click="onClick('index')"
      )
        UiIconStat.w-6.h-6.md_w-8.md_h-8(
          :class="{ 'text-blue3 dark_text-white': checkIsActive('index'), 'group-hover_text-white': !checkIsActive('index') }"
        )

      //- menu
      .menu__item.group(
        :class="{ _active: checkIsActive('menu') }"
        @click="$store.dispatch('ui/setActiveTab', 'menu')"
      )
        UiIconMenu.w-6.h-6.md_w-8.md_h-8.group-hover_text-white
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.menu
  &__row
    display flex
    align-items center
    justify-content center

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    flex-flow column
    padding $m6 0
    color var(--c-font-4)
    anim()

    +media(600px)
      border-radius 8px

    +media-hover()
      &:not(._active)
        cursor pointer
        color var(--c-font-1)
        background var(--c-blue-1)

    &:active
      color var(--c-font-2)
      background var(--c-blue-1)

.openTrnForm
  flex-grow 1
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding $m6 0
  anim()

  +media(600px)
    border-radius 8px

  +media-hover()
    background var(--c-blue-1)

    svg
      fill var(--c-font-1)

  svg
    width 24px
    height 24px
    fill var(--c-blue-1)
    anim()
</style>
