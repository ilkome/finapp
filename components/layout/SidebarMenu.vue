<script>
export default {
  name: 'LayoutSidebarBaseMenu',

  computed: {
    menu () {
      return {
        trnForm: {
          icon: 'mdi mdi-plus',
          name: this.$t('createTrn')
        },
        index: {
          icon: 'mdi mdi-poll',
          name: this.$t('stat.shortTitle')
        },
        wallets: {
          icon: 'mdi mdi-credit-card-multiple',
          name: this.$t('wallets.name')
        },
        categories: {
          icon: 'mdi mdi-folder-star',
          name: this.$t('categories.name')
        },
        settings: {
          icon: 'mdi mdi-cog-outline',
          name: this.$t('settings.title')
        }
      }
    }
  },

  methods: {
    onClickMenu (menuId) {
      menuId === 'trnForm'
        ? this.$store.dispatch('trnForm/openTrnForm', { action: 'create' })
        : this.$router.push(menuId)

      this.$store.dispatch('ui/setActiveTab', null)
    }
  }
}
</script>

<template lang="pug">
.menu
  template(v-for="(menuItem, menuId) in menu")
    .menuItem(
      :class="{ _active: $route.name === menuId }"
      @click="onClickMenu(menuId)"
    )
      .menuItem__icon: div(:class="menuItem.icon")
      .menuItem__text {{ menuItem.name }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.menu
  padding-bottom $m10

.menuItem
  cursor pointer
  display flex
  align-items center
  gap $m8
  padding $m7 $m8

  +media-hover()
    background var(--c-item3-bg-hover)

  &._active
    color var(--c-font-2)
    border-right 4px solid var(--c-bg-8)

  &__icon
    color var(--c-font-3)
    font-size 20px

  &__text
    color var(--c-font-4)
    font-size 14px

    ~/._active &
      color var(--c-font-2)
</style>
