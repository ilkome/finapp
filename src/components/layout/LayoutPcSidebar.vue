<script>
import WalletsList from '@/components/wallets/list/WalletsList'
import WalletsTotal from '@/components/wallets/total/WalletsTotal'

export default {
  components: {
    WalletsList,
    WalletsTotal
  },
  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('showWalletModal')
      this.$store.commit('setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug" scoped>
.sidebar
  .sidebar__top
    .sidebar__menu
      .sidebar__menu__item(
        :class="{ _active: activeTab === 'settings'}"
        @click="$store.dispatch('setActiveTab', 'settings')"
      ): .mdi.mdi-settings-outline

      .sidebar__menu__item(
        :class="{ _active: activeTab === 'wallets'}"
        @click="$store.dispatch('setActiveTab', 'wallets')"
      ): .mdi.mdi-credit-card-multiple

      .sidebar__menu__item(
        :class="{ _active: activeTab === 'categories'}"
        @click="$store.dispatch('setActiveTab', 'categories')"
      ): .mdi.mdi-chart-bubble

      .sidebar__menu__item(
        :class="{ _active: activeTab === 'stat'}"
        @click="$store.dispatch('setActiveTab', 'stat')"
      ): .mdi.mdi-poll

    WalletsTotal

  .sidebar__content
    WalletsList(
      :showToogle="true"
      :limit="6"
      v-on:onClick="(id) => handleShowWalletModal(id)"
    )
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.sidebar
  overflow hidden
  display flex
  flex-flow column
  background var(--c-bg-4)
  border-right 1px solid var(--c-bg-1)
  scrollbar()

  &__menu
    display flex
    justify-content space-between
    padding 0 $m7

    &__item
      display inline-flex
      align-items center
      justify-content center
      padding $m7 $m8
      font-header-1()
      font-size 18px
      color var(--c-font-4)

      &:hover
        @media $media-laptop
          background var(--c-bg-6)

      &._active
        color var(--c-font-2)

  &__content
    overflow-y auto
    padding $m5 0
    scrollbar()
</style>
