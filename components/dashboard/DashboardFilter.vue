<script>
export default {
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
      this.$store.dispatch('filter/setFilterCategoryId', nextCategory)
    },
    clearParentCategoryFilter () {
      this.$store.dispatch('filter/setFilterCategoryId', null)
    },
    clearWalletFilter () {
      this.$store.dispatch('filter/setFilterWalletId', null)
    },
    clearAllFilters () {
      this.$store.dispatch('filter/setFilterCategoryId', null)
      this.$store.dispatch('filter/setFilterWalletId', null)
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
        @onClick="clearWalletFilter"
      )

    //- categories
    template(v-if="$store.state.filter.categoryId")
      //- parent category
      template(v-if="filterCategory.parentId !== 0")
        FilterItem(
          :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
          :icon="filterCategoryParent.icon"
          :name="filterCategoryParent.name"
          @onClick="clearParentCategoryFilter"
        )

      //- category
      FilterItem(
        :color="filterCategory.color || $store.state.ui.defaultBgColor"
        :icon="filterCategory.icon"
        :name="filterCategory.name"
        @onClick="clearCategoryFilter"
      )

    //- clear
    FilterItem._clear(
      :name="$t('filter.clear')"
      icon="mdi mdi-filter-remove-outline"
      @onClick="clearAllFilters"
    )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

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
