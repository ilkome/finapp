<script>
import Button from '@/components/shared/button/Button'
import CategoryItem from '@/components/layout/sidebar/CategoryItem'
import WalletsList from '@/components/wallets/list/WalletsList'

export default {
  components: {
    Button,
    CategoryItem,
    WalletsList
  },

  data () {
    return {
      menu: {
        stat: {
          icon: 'mdi mdi-poll',
          name: this.$lang.stat.shortTitle,
          isOpen: false
        },
        budgets: {
          icon: 'mdi mdi-hand-saw',
          name: this.$lang.budgets.name,
          isOpen: false,
          private: true
        },
        groups: {
          icon: 'mdi mdi-folder-multiple-outline',
          name: this.$lang.groups.name,
          isOpen: false,
          private: true
        },
        wallets: {
          icon: 'mdi mdi-credit-card-multiple',
          name: this.$lang.wallets.name,
          isOpen: true
        },
        categories: {
          icon: 'mdi mdi-chart-bubble',
          name: this.$lang.categories.name,
          isOpen: false
        },
        projects: {
          icon: 'mdi mdi-notebook-outline',
          name: this.$lang.projects.name,
          isOpen: false
        },
        settings: {
          icon: 'mdi mdi-settings',
          name: this.$lang.settings.title,
          isOpen: true
        }
      }
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  methods: {
    handleClickMenu (menuId) {
      if (this.$listeners.onClickMenuCalback) {
        this.$listeners.onClickMenuCalback()
      }
      this.$store.dispatch('setActiveTab', menuId)
    }
  }
}
</script>

<template lang="pug">
.menu
  template(v-for="(menuItem, menuId) in menu")
    .menuItem(
      v-if="$store.getters.isTester || !menuItem.private"
      @click="handleClickMenu(menuId)"
      :class="{ _active: activeTab === menuId, [`_${menuId}`]: true }")
      .menuItem__icon: div(:class="menuItem.icon")
      .menuItem__text {{ menuItem.name }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables"

item-bg-active()
  background var(--c-bg-6)

.menu
  border-bottom 1px solid var(--c-bg-1)

  &:last-child
    border-bottom 0

.menuItem
  display grid
  grid-template-columns 24px 1fr 24px
  grid-column-gap 20px
  padding 16px 16px
  align-items center

  +media-laptop()
    padding 16px 20px

  &:hover
    +media-laptop()
      background var(--c-bg-6)

  &:active
    item-bg-active()

  &._active
    color var(--c-font-2)
    border-right 4px solid var(--c-bg-8)

  &__icon
    align-self center
    justify-self center
    font-size 20px
    grid-column 1 / 2
    color var(--c-font-3)

  &__text
    grid-column 2 / 3
    color var(--c-font-4)
    font-size 14px

    ~/._active &
      color var(--c-font-2)

  &__arrow
    display flex
    align-items center
    justify-content center
    margin -10px 0
    width 40px
    height 40px
    margin-right -14px
    justify-self end
    font-size 22px
    color var(--c-font-4)
</style>
