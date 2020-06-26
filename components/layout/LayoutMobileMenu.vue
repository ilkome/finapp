<script>
import Button from '~/components/shared/button/Button'
import PeriodNavMobile from '~/components/layout/PeriodNavMobile'

export default {
  components: {
    Button,
    PeriodNavMobile
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    },
    menu () {
      return {
        wallets: {
          icon: 'mdi mdi-credit-card-multiple',
          id: 'wallets',
          name: this.$lang.wallets.name
        },
        categories: {
          icon: 'mdi mdi-folder-star',
          id: 'categories',
          name: this.$lang.categories.shortTitle
        },
        stat: {
          icon: 'mdi mdi-poll',
          id: 'stat',
          name: this.$lang.stat.shortTitle
        },
        history: {
          icon: 'mdi mdi-history',
          id: 'history',
          name: this.$lang.trns.shortTitle
        }
      }
    }
  },

  methods: {
    getClassName (tab) {
      if (this.$store.state.ui.activeTab === 'stat') {
        if (tab === this.$store.state.ui.stat.activeTab) {
          return {
            _active: true
          }
        }
      }
      else if (this.$store.state.ui.activeTab === tab) {
        return {
          _active: true
        }
      }
    },
    handleSetActiveTab (tab) {
      switch (tab) {
        case 'stat':
          this.$store.dispatch('ui/setActiveTab', 'stat')
          this.$store.dispatch('ui/setActiveTabStat', 'stat')
          break
        case 'history':
          this.$store.dispatch('ui/setActiveTab', 'stat')
          this.$store.dispatch('ui/setActiveTabStat', 'history')
          break
        default:
          this.$store.dispatch('ui/setActiveTab', tab)
      }
    }
  }
}
</script>

<template lang="pug">
.menu
  .menu__wrap
    .menu__row(v-show="activeTab === 'stat'")
      PeriodNavMobile

    .menu__row
      .menu__item(
        :class="getClassName(menu.wallets.id)"
        @click="handleSetActiveTab(menu.wallets.id)"
      )
        .menu__item__icon: div(:class="menu.wallets.icon")
        //- .menu__item__text {{ menu.wallets.name }}

      .menu__item(
        :class="getClassName(menu.categories.id)"
        @click="handleSetActiveTab(menu.categories.id)"
      )
        .menu__item__icon: div(:class="menu.categories.icon")
        //- .menu__item__text {{ menu.categories.name }}

      .openTrnForm(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })")
        svg(
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        )
          path(d='M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z')

      .menu__item(
        :class="getClassName(menu.stat.id)"
        @click="handleSetActiveTab(menu.stat.id)"
      )
        .menu__item__icon: div(:class="menu.stat.icon")
        //- .menu__item__text {{ menu.stat.name }}

      .menu__item(
        :class="getClassName(menu.history.id)"
        @click="handleSetActiveTab(menu.history.id)"
      )
        .menu__item__icon: div(:class="menu.history.icon")
        //- .menu__item__text {{ menu.history.name }}
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

  /.theme-light &
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

    /.theme-light &
      color var(--c-font-5)

    &__icon
      font-size 26px

    &__text
      margin-top $m5
      font-size 12px
</style>
