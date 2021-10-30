<script>
import { computed, useContext, useRoute, useRouter } from '@nuxtjs/composition-api'

export default {
  name: 'LayoutMobileBottomMenu',

  props: {
    slider: {
      type: Object,
      required: true
    },
    stat2: {
      type: Boolean,
      default: false
    }
  },

  setup () {
    const { store, app: { i18n } } = useContext()
    const route = useRoute()
    const router = useRouter()

    const menu = computed(() => ({
      stat: {
        icon: 'mdi mdi-poll',
        id: 'stat',
        name: i18n.t('stat.shortTitle')
      },
      wallets: {
        icon: 'mdi mdi-credit-card-multiple',
        id: 'wallets',
        name: i18n.t('wallets.name')
      },
      categories: {
        icon: 'mdi mdi-folder-star',
        id: 'categories',
        name: i18n.t('categories.shortTitle')
      },
      menu: {
        icon: 'mdi mdi-menu',
        id: 'menu',
        name: i18n.t('trns.shortTitle')
      }
    }))

    function handleSetActiveTab (tabName) {
      if (tabName === 'menu') {
        store.dispatch('ui/setActiveTab', 'menu')
        return
      }

      router.push(tabName)
    }

    function getClassName (tabName) {
      if (route.value.name === tabName)
        return true
      else if (tabName === 'stat' && route.value.name === 'index')
        return true
    }

    return {
      menu,
      handleSetActiveTab,
      getClassName
    }
  }
}
</script>

<template lang="pug">
.menu
  .menu__wrap
    .menu__row
      //- wallets
      .menu__item(
        :class="{ _active: getClassName(menu.wallets.id) }"
        @click="handleSetActiveTab(menu.wallets.id)"
      )
        .menu__item__icon: div(:class="menu.wallets.icon")

      //- categories
      .menu__item(
        :class="{ _active: getClassName(menu.categories.id) }"
        @click="handleSetActiveTab(menu.categories.id)"
      )
        .menu__item__icon: div(:class="menu.categories.icon")

      .openTrnForm(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
        svg(
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        )
          path(d='M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z')

      //- stat
      .menu__item(
        :class="{ _active: getClassName(menu.stat.id) }"
        @click="handleSetActiveTab(menu.stat.id)"
      )
        .menu__item__icon: div(:class="menu.stat.icon")

      //- menu
      .menu__item(
        :class="{ _active: getClassName(menu.menu.id) }"
        @click="handleSetActiveTab(menu.menu.id)"
      )
        .menu__item__icon: div(:class="menu.menu.icon")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.create-btn
  flex-grow 1
  padding-left $m7

.customize
  display flex
  justify-content flex-end
  flex-grow 1
  padding-right $m7

.openTrnForm
  flex-grow 1
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding $m6 0
  border-radius 8px
  anim()

  +media-hover()
    background var(--c-blue-1)

    svg
      fill var(--c-font-1)

  +media(600px)
    padding $m8 0

  svg
    width 24px
    height 24px
    fill var(--c-blue-1)
    anim()

.menu
  background var(--c-bg-3)

  &__wrap
    display grid
    max-width 680px
    margin 0 auto

  /.light-mode &
    background var(--c-bg-4)

  &__row
    display flex
    align-items center
    justify-content center

  &__item
    cursor pointer
    display flex
    align-items center
    justify-content center
    flex-grow 1
    flex-flow column
    padding $m6 0
    color var(--c-font-4)
    border-radius 8px
    anim()

    +media(600px)
      padding $m8 0
      border-radius 8px

    +media-hover()
      color var(--c-font-1)
      background var(--c-blue-1)

    &:active
      color var(--c-font-2)
      background var(--c-blue-1)

    &._active
      color var(--c-font-2)

    /.light-mode &
      color var(--c-font-5)

    &__icon
      font-size 22px

      +media(800px)
        font-size 28px
</style>
