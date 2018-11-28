<script>
import FilterItem from '@/components/filter/FilterItem'
import ModalBottom from '@/components/modal/ModalBottom'

export default {
  components: {
    FilterItem,
    ModalBottom
  },

  computed: {
    filterCategory () {
      return this.$store.state.categories.items[this.$store.state.filter.categoryId]
    },

    filterCategoryParent () {
      return this.$store.state.categories.items[this.filterCategory.parentId]
    },

    filterWallet () {
      return this.$store.state.wallets.items[this.$store.state.filter.walletId]
    }
  },

  methods: {
    clearCategoryFilter () {
      if (!this.$store.state.filter.walletId && !this.filterCategoryParent) {
        this.$store.commit('toogleFilterModal')
      }
      setTimeout(() => {
        const nextCategory = this.filterCategory.parentId !== 0 ? this.filterCategory.parentId : null
        this.$store.dispatch('setFilterCategoryId', nextCategory)
      }, 50)
    },

    clearParentCategoryFilter () {
      if (!this.$store.state.filter.walletId) this.$store.commit('toogleFilterModal')
      setTimeout(() => {
        this.$store.dispatch('setFilterCategoryId', null)
      }, 50)
    },

    clearWalletFilter () {
      if (!this.$store.state.filter.categoryId) this.$store.commit('toogleFilterModal')
      setTimeout(() => {
        this.$store.dispatch('setFilterWalletId', null)
      }, 50)
    },

    clearFilter () {
      this.$store.commit('toogleFilterModal')
      setTimeout(() => {
        this.$store.commit('setFilterCategoryId', null)
        this.$store.commit('setFilterWalletId', null)
      }, 50)
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  :show="$store.state.filter.showFilterModal"
  title="Filter"
  v-on:onClose="$store.commit('toogleFilterModal')"
)
  .filterItems
    //- wallet
    template(v-if="$store.state.filter.walletId")
      FilterItem(
        :color="filterWallet.color || $store.state.ui.defaultBgColor"
        :name="filterWallet.name"
        icon="mdi mdi-credit-card-multiple"
        v-on:onClick="clearWalletFilter"
      )

    //- parent category
    template(v-if="$store.state.filter.categoryId")
      template(v-if="filterCategory.parentId !== 0")
        FilterItem(
          :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
          :icon="filterCategoryParent.icon"
          :name="filterCategoryParent.name"
          v-on:onClick="clearParentCategoryFilter"
        )

      //- category
      FilterItem(
        :color="filterCategory.color || $store.state.ui.defaultBgColor"
        :icon="filterCategory.icon"
        :name="filterCategory.name"
        v-on:onClick="clearCategoryFilter"
      )

  .filterBtnAlign
    .filterBtn(@click="clearFilter")
      .filterBtn__icon: .mdi.mdi-filter-remove-outline
      .filterBtn__name Clear filter
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.filterBtnAlign
  display flex
  justify-content center

.filterBtn
  display flex
  align-items center
  justify-content center
  margin-top $m9
  padding $m7 $m9
  color var(--c-font-1)
  background var(--c-blue-1)
  border-radius $m3

  &__icon
    padding-right $m6
    opacity .8
    width 36px
    font-size 22px

  &__name
    font-size 18px
</style>
