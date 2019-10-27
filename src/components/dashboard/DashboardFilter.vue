<script>
import FilterItem from '@/components/filter/FilterItem'

export default {
  components: {
    FilterItem
  },

  props: {
    showTittle: {
      type: Boolean,
      default: false
    }
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
      let nextCategory
      this.filterCategory.parentId !== 0
        ? nextCategory = this.filterCategory.parentId
        : nextCategory = null
      this.$store.dispatch('setFilterCategoryId', nextCategory)
    },
    clearParentCategoryFilter () {
      this.$store.dispatch('setFilterCategoryId', null)
    },
    clearWalletFilter () {
      this.$store.dispatch('setFilterWalletId', null)
    },
    clearAllFilters () {
      this.$store.dispatch('setFilterCategoryId', null)
      this.$store.dispatch('setFilterWalletId', null)
    }
  }
}
</script>

<template lang="pug">
.filter(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
  .filter__in
    .filter__title(v-if="showTittle") Filter
    //- wallet
    template(v-if="$store.state.filter.walletId")
      FilterItem(
        :color="filterWallet.color || $store.state.ui.defaultBgColor"
        :name="filterWallet.name"
        icon="mdi mdi-credit-card-multiple"
        v-on:onClick="clearWalletFilter")

    //- categories
    template(v-if="$store.state.filter.categoryId")
      //- parent category
      template(v-if="filterCategory.parentId !== 0")
        FilterItem(
          :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
          :icon="filterCategoryParent.icon"
          :name="filterCategoryParent.name"
          v-on:onClick="clearParentCategoryFilter")

      //- category
      FilterItem(
        :color="filterCategory.color || $store.state.ui.defaultBgColor"
        :icon="filterCategory.icon"
        :name="filterCategory.name"
        v-on:onClick="clearCategoryFilter")

    //- clear
    FilterItem._clear(
      icon="mdi mdi-filter-remove-outline"
      name="Clear filter"
      v-on:onClick="clearAllFilters")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables"

.filter
  background var(--c-bg-4)
  border-bottom 1px solid var(--c-bg-2)

  &__in
    display flex
    position relative
    max-width 1100px
    padding 10px 60px

  &__title
    font-header-1()
    font-size 22px
    padding-bottom 20px
</style>
