<script>
import Button from '@/components/shared/button/Button'
import PeriodNavMobile from '@/components/layout/PeriodNavMobile'

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
      return [{
        icon: 'mdi mdi-credit-card-multiple',
        id: 'wallets',
        name: this.$lang.wallets.name
      }, {
        icon: 'mdi mdi-chart-bubble',
        id: 'categories',
        name: this.$lang.categories.shortTitle
      }, {
        icon: 'mdi mdi-poll',
        id: 'stat',
        name: this.$lang.stat.shortTitle
      }, {
        icon: 'mdi mdi-history',
        id: 'history',
        name: this.$lang.trns.shortTitle
      }]
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
      else {
        if (this.$store.state.ui.activeTab === tab) {
          return {
            _active: true
          }
        }
      }
    },
    handleSetActiveTab (tab) {
      switch (tab) {
        case 'stat':
          this.$store.dispatch('setActiveTab', 'stat')
          this.$store.dispatch('setActiveTabStat', 'stat')
          break
        case 'history':
          this.$store.dispatch('setActiveTab', 'stat')
          this.$store.dispatch('setActiveTabStat', 'history')
          break
        default:
          this.$store.dispatch('setActiveTab', tab)
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
      template(v-for="menuItem of menu")
        .menu__item(
          :key="menuItem.id"
          :class="getClassName(menuItem.id)"
          @click="handleSetActiveTab(menuItem.id)")
          .menu__item__icon: div(:class="menuItem.icon")
          .menu__item__text {{ menuItem.name }}

      .menu__item(@click="$store.dispatch('openTrnForm', { action: 'create' })")
        .menu__item__icon: .mdi.mdi-plus-box-multiple-outline
        .menu__item__text {{ this.$lang.create.title }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"

.create-btn
  flex-grow 1
  padding-left $m7

.customize
  display flex
  justify-content flex-end
  flex-grow 1
  padding-right $m7

.menu
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-1)

  &__wrap
    display grid
    grid-row-gap $m5
    max-width 620px
    margin 0 auto

  /.theme-light &
    background var(--c-bg-4)

  &__row
    display flex
    align-items center
    justify-content center

    &:first-child
      padding-top 10px

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    flex-flow column
    padding 10px 0 10px 0
    color var(--c-font-4)
    anim()

    &:active
      background var(--c-bg-1)

    /.theme-light &
      color var(--c-font-5)

    &._active
      color var(--c-font-2)

    &__icon
      margin-bottom $m5
      font-size 26px

    &__text
      font-size 12px
</style>
