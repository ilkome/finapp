<script>
export default {
  props: {
    slider: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    },

    menu () {
      return {
        trnForm: {
          icon: 'mdi mdi-plus',
          name: this.$lang.createTrn,
          isOpen: false
        },
        stat: {
          icon: 'mdi mdi-poll',
          name: this.$lang.stat.shortTitle,
          isOpen: false
        },
        wallets: {
          icon: 'mdi mdi-credit-card-multiple',
          name: this.$lang.wallets.name,
          isOpen: true
        },
        categories: {
          icon: 'mdi mdi-folder-star',
          name: this.$lang.categories.name,
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
        users: {
          icon: 'mdi mdi-account-multiple',
          name: 'Users',
          isOpen: false,
          private: true
        },
        settings: {
          icon: 'mdi mdi-cog-outline',
          name: this.$lang.settings.title,
          isOpen: true
        }
      }
    }
  },

  methods: {
    handleClickMenu (menuId) {
      if (menuId === 'users') {
        this.$router.push('/users')
        return
      }
      else if (menuId === 'trnForm') {
        this.$store.dispatch('trnForm/openTrnForm', { action: 'create' })
        return
      }
      else if (menuId === 'groups') {
        this.$store.dispatch('ui/setActiveTab', 'groups')
      }
      else {
        this.$router.push('/')
      }

      if (this.$listeners.onClickMenuCalback) {
        this.$listeners.onClickMenuCalback()
      }

      if (this.slider) {
        switch (menuId) {
          case 'wallets':
            this.slider.slideTo(0)
            break
          case 'stat':
            this.slider.slideTo(1)
            break
          case 'history':
            this.slider.slideTo(3)
            break
          case 'categories':
            this.slider.slideTo(2)
            break
          default:
            this.slider.slideTo(0)
        }
      }

      this.$store.dispatch('ui/setActiveTab', menuId)
    }
  }
}
</script>

<template lang="pug">
.menu
  template(v-for="(menuItem, menuId) in menu")
    .menuItem(
      v-if="$store.getters['user/isTester'] || !menuItem.private"
      :class="{ _active: activeTab === menuId, [`_${menuId}`]: true }"
      @click="handleClickMenu(menuId)"
    )
      .menuItem__icon: div(:class="menuItem.icon")
      .menuItem__text {{ menuItem.name }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

item-bg-active()
  background var(--c-bg-6)

.menu
  border-bottom 1px solid var(--c-bg-2)

  &:last-child
    border-bottom 0

  &__wallets
    padding-top $m8

.menuItem
  cursor pointer
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
