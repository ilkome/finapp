<script>
export default {
  name: 'LayoutMobileMenu2',

  props: {
    slider: {
      type: Object,
      required: true
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    },
    menu () {
      return {
        stat: {
          icon: 'mdi mdi-poll',
          id: 'stat',
          name: this.$t('stat.shortTitle')
        },
        wallets: {
          icon: 'mdi mdi-credit-card-multiple',
          id: 'wallets',
          name: this.$t('wallets.name')
        },
        categories: {
          icon: 'mdi mdi-folder-star',
          id: 'categories',
          name: this.$t('categories.shortTitle')
        },
        menu: {
          icon: 'mdi mdi-menu',
          id: 'menu',
          name: this.$t('trns.shortTitle')
        }
      }
    }
  },

  methods: {
    getClassName (tab) {
      if (this.slider) {
        const index = this.slider.activeIndex
        if (tab === 'wallets' && index === 0) { return true }
        if (tab === 'stat' && index === 1) { return true }
        if (tab === 'categories' && index === 2) { return true }
      }
    },
    handleSetActiveTab (tab) {
      switch (tab) {
        case 'wallets':
          // this.$store.dispatch('ui/setActiveTab', 'stat')
          // this.$store.dispatch('ui/setActiveTabStat', 'stat')
          this.slider.slideTo(0)
          break
        case 'stat':
          // this.$store.dispatch('ui/setActiveTab', 'stat')
          // this.$store.dispatch('ui/setActiveTabStat', 'stat')
          this.slider.slideTo(1)
          break
        case 'categories':
          // this.$store.dispatch('ui/setActiveTab', 'stat')
          // this.$store.dispatch('ui/setActiveTabStat', 'history')
          this.slider.slideTo(2)
          break
        case 'menu':
          this.$store.dispatch('ui/setActiveTab', 'menu')
          break
        default:
          // this.$store.dispatch('ui/setActiveTab', tab)
          this.slider.slideTo(0)
      }
      // this.$router.push('/')
    }
  }
}
</script>

<template lang="pug">
.menu
  .menu__wrap
    .menu__row
      //- Wallets
      .menu__item(
        :class="{ _active: getClassName(menu.wallets.id) }"
        @click="handleSetActiveTab(menu.wallets.id)"
      )
        .menu__item__icon: div(:class="menu.wallets.icon")

      //- Stat
      .menu__item(
        :class="{ _active: getClassName(menu.stat.id) }"
        @click="handleSetActiveTab(menu.stat.id)"
      )
        .menu__item__icon: div(:class="menu.stat.icon")

      .openTrnForm(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
        svg(
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        )
          path(d='M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z')

      //- Categories
      .menu__item(
        :class="{ _active: getClassName(menu.categories.id) }"
        @click="handleSetActiveTab(menu.categories.id)"
      )
        .menu__item__icon: div(:class="menu.categories.icon")

      //- History
      .menu__item(
        :class="{ _active: getClassName(menu.menu.id) }"
        @click="handleSetActiveTab(menu.menu.id)"
      )
        .menu__item__icon: div(:class="menu.menu.icon")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

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
  padding 17px 0 16px 0
  border-radius 8px
  anim()

  +media-hover()
    background var(--c-bg-1)

  svg
    width 24px
    height 24px
    fill #0094FF

.menu
  background var(--c-bg-3)

  &__wrap
    display grid
    max-width 620px
    margin 0 auto

  /.light-mode &
    background var(--c-bg-4)

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
    padding 16px 0
    color var(--c-font-4)
    anim()

    &:active
      background var(--c-bg-1)

    &._active
      color var(--c-font-1)

    /.light-mode &
      color var(--c-font-5)

    &__icon
      font-size 26px

    &__text
      margin-top $m5
      font-size 12px
</style>
