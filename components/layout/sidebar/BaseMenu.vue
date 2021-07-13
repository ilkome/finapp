<script>
export default {
  name: 'LayoutSidebarBaseMenu',

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    },

    menu () {
      return {
        trnForm: {
          id: 'trnForm',
          icon: 'mdi mdi-plus',
          name: this.$t('createTrn')
        },
        stat: {
          icon: 'mdi mdi-poll',
          name: this.$t('stat.shortTitle')
        },
        wallets: {
          id: 'wallets',
          icon: 'mdi mdi-credit-card-multiple',
          name: this.$t('wallets.name')
        },
        categories: {
          id: 'categories',
          icon: 'mdi mdi-folder-star',
          name: this.$t('categories.name')
        },
        users: {
          icon: 'mdi mdi-account-multiple',
          name: this.$t('users.title'),
          private: true
        },
        settings: {
          icon: 'mdi mdi-cog-outline',
          name: this.$t('settings.title')
        }
      }
    }
  },

  methods: {
    handleSetActiveTab (tabName) {
      if (tabName === 'menu') {
        store.dispatch('ui/setActiveTab', 'menu')
        return
      }
      store.dispatch('ui/setActiveTabViewName', tabName)
    },

    handleClickMenu (menuId) {
      if (menuId === 'stat')
        this.$store.dispatch('ui/setActiveTabViewName', 'stat')

      if (menuId === 'wallets')
        this.$store.dispatch('ui/setActiveTabViewName', 'wallets')

      if (menuId === 'categories')
        this.$store.dispatch('ui/setActiveTabViewName', 'categories')

      if (menuId === 'users') {
        this.$router.push('/users')
        this.$store.dispatch('ui/setActiveTab', 'stat')
        return
      }
      else if (menuId === 'trnForm') {
        this.$store.dispatch('trnForm/openTrnForm', { action: 'create' })
        return
      }
      else {
        this.$router.push('/')
      }

      if (this.$listeners.onClickMenuCalback)
        this.$listeners.onClickMenuCalback()

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
@import '~assets/stylus/variables'

item-bg-active()
  background var(--c-bg-6)

.menu
  &__wallets
    padding-top $m8

.menuItem
  cursor pointer
  display grid
  grid-template-columns 24px 1fr 24px
  grid-column-gap 20px
  align-items center
  height 50px
  padding 16px 16px

  +media-laptop()
    height auto
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
    color var(--c-font-3)
    font-size 20px
    grid-column 1 / 2

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
    width 40px
    height 40px
    margin -10px 0
    margin-right -14px
    justify-self end
    color var(--c-font-4)
    font-size 22px
</style>
